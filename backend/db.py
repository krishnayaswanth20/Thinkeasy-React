"""
db.py — single, reusable database connection module.

This is the ONLY place in the backend that knows how to connect to
MySQL. app.py and every other module must import get_db() from here:

    from db import get_db

Configuration is read exclusively from environment variables:

    DB_HOST
    DB_PORT
    DB_USER
    DB_PASSWORD
    DB_NAME

In local development these are loaded from a `.env` file (via
python-dotenv) if one exists next to this file. In production
(Render/Railway) they must be set as real environment variables in the
hosting provider's dashboard — .env is not used there and, even if a
stray .env file exists, python-dotenv never overrides a variable that
is already set in the real environment, so production values always
win.

There are NO hardcoded hosts, ports, usernames, passwords, or database
names anywhere in this file — if any required variable is missing,
startup fails immediately with a clear, specific error instead of
silently falling back to localhost or returning None without
explanation.
"""

import os
import sys

# ──────────────────────────────────────────────
# .env LOADING (local development only)
# ──────────────────────────────────────────────
try:
    from dotenv import load_dotenv
    load_dotenv()  # loads backend/.env if present; no-op if it doesn't exist
except ImportError:
    # python-dotenv isn't installed. Harmless in production (real env vars
    # are already set there); local dev will get a clear error below if
    # required variables are missing as a result.
    pass

import mysql.connector

# ──────────────────────────────────────────────
# REQUIRED ENVIRONMENT VARIABLES
# ──────────────────────────────────────────────
REQUIRED_DB_VARS = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"]


def _fail_startup(message: str) -> None:
    """Print a clear, actionable error and exit. Never used for per-request
    connection failures — only for missing/invalid configuration at import
    time, where continuing would mean silently talking to the wrong
    database (e.g. a localhost fallback) or crashing later with a vague
    error."""
    print(
        "\n✗ Database configuration error: " + message + "\n\n"
        "  Local development:\n"
        "    Create a backend/.env file (see .env.example) defining:\n"
        "      " + ", ".join(REQUIRED_DB_VARS) + "\n\n"
        "  Production (Render/Railway):\n"
        "    Set these in the hosting provider's Environment Variables\n"
        "    dashboard for this service.\n",
        file=sys.stderr,
        flush=True,
    )
    sys.exit(1)


_missing = [name for name in REQUIRED_DB_VARS if not os.environ.get(name)]
if _missing:
    _fail_startup("missing required environment variable(s): " + ", ".join(_missing))

DB_HOST = os.environ["DB_HOST"]
DB_USER = os.environ["DB_USER"]
DB_PASSWORD = os.environ["DB_PASSWORD"]
DB_NAME = os.environ["DB_NAME"]

try:
    DB_PORT = int(os.environ["DB_PORT"])
except ValueError:
    _fail_startup(f"DB_PORT is set to {os.environ['DB_PORT']!r}, which is not a valid integer port number.")


# ──────────────────────────────────────────────
# CONNECTION
# ──────────────────────────────────────────────
def get_db():
    """
    Return a live mysql.connector connection, built exclusively from the
    DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME environment
    variables validated above. Supports Railway MySQL (ssl_disabled=False).

    On failure, the real mysql.connector error is always printed/logged
    before returning None — callers can rely on the fact that a None
    return is never silent; the reason is always in the logs immediately
    before it.
    """
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            ssl_disabled=False,
            connection_timeout=10,
        )
        return conn
    except mysql.connector.Error as e:
        # print() output isn't always flushed/captured reliably by Render's
        # log pipeline under gunicorn. Use the Flask/gunicorn logger too so
        # this always shows up in the dashboard's Logs tab.
        print(f"✗ Database connection failed: {e}", flush=True)
        try:
            from flask import current_app
            current_app.logger.error("Database connection failed: %s", e)
        except Exception:
            # Not inside a Flask app/request context (e.g. called from a
            # standalone script) — the print() above already logged it.
            pass
        return None


def test_connection() -> bool:
    """
    Startup connectivity check. Call this once when the app boots
    (e.g. from app.py right after `app = Flask(__name__)`) to print a
    clear, immediate signal of whether the database is reachable:

        ✓ Connected to Railway MySQL
    or
        ✗ Database connection failed:
        <real mysql error>

    Returns True/False; does not raise and does not exit the process —
    a transient DB outage at boot shouldn't necessarily crash the whole
    web server, since get_db() is retried on every request anyway.
    """
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            ssl_disabled=False,
            connection_timeout=10,
        )
        conn.close()
        print("✓ Connected to Railway MySQL", flush=True)
        return True
    except mysql.connector.Error as e:
        print(f"✗ Database connection failed:\n{e}", flush=True)
        return False


if __name__ == "__main__":
    # Standalone sanity check: `python db.py`
    ok = test_connection()
    sys.exit(0 if ok else 1)
