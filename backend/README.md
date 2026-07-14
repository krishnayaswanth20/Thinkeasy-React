# ThinkEasy Backend — Deployment

## Database configuration

All database configuration comes exclusively from environment variables —
there are no hardcoded hosts, ports, usernames, passwords, or database
names anywhere in the codebase. `db.py` is the single module responsible
for the database connection; every route in `app.py` uses it via:

```python
from db import get_db
```

Required variables (same names everywhere — local `.env`, Render,
Railway):

```
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
ADMIN_SECRET_KEY
```

If any `DB_*` variable is missing, the app fails immediately at startup
with a clear message listing exactly which variable is missing — it
never falls back to `localhost` or starts up in a broken state.

On startup, the app always prints one of:

```
✓ Connected to Railway MySQL
```
or
```
✗ Database connection failed:
<the real mysql-connector error>
```

so a bad connection is visible in the very first lines of the logs.

---

## Local development

1. **Create `backend/.env`** — copy the template and fill in your local
   (or a dev/staging) MySQL credentials:

   ```bash
   cp .env.example .env
   ```

   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_local_password
   DB_NAME=thinkeasy
   ADMIN_SECRET_KEY=any_random_string_for_dev
   ```

   `.env` is loaded automatically by `db.py` via `python-dotenv` — you
   don't need to `source` it or export anything manually. **Do not commit
   `.env`** — only `.env.example` (with blank values) belongs in git.

2. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Run the app:**

   ```bash
   python app.py
   ```

   You should see `✓ Connected to Railway MySQL` (or your local DB) near
   the top of the output. If you see `✗ Database connection failed:`
   instead, the error immediately below it is the real reason (wrong
   password, MySQL not running, wrong port, etc.).

---

## Production (Render)

1. In the Render dashboard, open your service → **Environment**.
2. Add each of the following as a Render environment variable (values
   from your Railway MySQL instance — see below):
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `ADMIN_SECRET_KEY` (a long random string — generate with
     `python -c "import secrets; print(secrets.token_hex(32))"`)
3. Render injects these as real OS environment variables. **No `.env`
   file is used or needed in production** — `db.py`'s `.env` loading is a
   no-op if no `.env` file is present, and even if one accidentally ended
   up in the deployment, real environment variables always take priority
   over `.env` values.
4. Deploy. Check the Render **Logs** tab for `✓ Connected to Railway
   MySQL` right after startup to confirm the connection succeeded.

---

## Production (Railway MySQL)

Railway is used here as the MySQL host (not necessarily the app host).
From your Railway project:

1. Open your MySQL service → **Variables** (or **Connect**) tab.
2. Copy the connection details — Railway typically exposes a proxy host
   like `xxxxx.proxy.rlwy.net`, a port, `root` as the user, a generated
   password, and `railway` as the database name.
3. Use these exact values for `DB_HOST`, `DB_PORT`, `DB_USER`,
   `DB_PASSWORD`, `DB_NAME` wherever you're running the Flask app
   (Render's environment variables, or Railway's own environment
   variables if the app itself is also deployed on Railway).
4. The connection uses `ssl_disabled=False`, which is required for
   Railway's MySQL proxy.

If you ever need to rotate the database password, generate a new one in
Railway's dashboard, then update `DB_PASSWORD` in Render (or wherever the
app runs) — there is nothing to change in the codebase, since no
credential is ever hardcoded.

---

## Compatibility

- **React frontend** — CORS origins and all API response shapes are
  unchanged by this refactor; only the database connection layer moved
  into `db.py`.
- **Render backend** — reads `DB_HOST` / `DB_PORT` / `DB_USER` /
  `DB_PASSWORD` / `DB_NAME` / `ADMIN_SECRET_KEY` from Render's
  Environment Variables.
- **Railway MySQL** — connection uses `ssl_disabled=False`, matching
  Railway's proxy requirements.

## Endpoints

All existing endpoints are unchanged and continue to use the same
`get_db()` from `db.py`, including:

- `GET /health`
- `GET /api/categories`
- `GET /api/businesses`
- `GET /api/products`
- `POST /api/login`
- `POST /api/admin/login`

and every other route in `app.py`.
