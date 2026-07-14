"""
create_admin.py — create (or reset) an admin account.

Usage:
    python create_admin.py

You'll be prompted for a username, email, and password. The password is
hashed with Werkzeug's generate_password_hash() before being
stored — the plain text password is never written anywhere.

If the username already exists, you'll be asked whether to reset its
password instead of creating a duplicate account.
"""

import sys
import getpass

from db import get_db
from app import init_admin_table
from werkzeug.security import generate_password_hash


def main():
    init_admin_table()

    username = input("Admin username: ").strip()
    if not username:
        print("Username cannot be empty.")
        sys.exit(1)

    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id FROM admin WHERE username=%s", (username,))
    existing = cursor.fetchone()

    if existing:
        choice = input(
            f"An admin named '{username}' already exists. Reset their password instead? [y/N]: "
        ).strip().lower()
        if choice != "y":
            print("Aborted. No changes made.")
            cursor.close()
            conn.close()
            sys.exit(0)

        password = getpass.getpass("New password: ")
        confirm = getpass.getpass("Confirm new password: ")
        if password != confirm:
            print("Passwords do not match.")
            sys.exit(1)
        if len(password) < 8:
            print("Password must be at least 8 characters.")
            sys.exit(1)

        password_hash = generate_password_hash(password)
        cursor.execute(
            "UPDATE admin SET password_hash=%s, failed_login_attempts=0, locked_until=NULL, is_active=1 WHERE id=%s",
            (password_hash, existing["id"])
        )
        conn.commit()
        print(f"Password reset for '{username}'.")
    else:
        email = input("Admin email: ").strip()
        if not email:
            print("Email cannot be empty.")
            sys.exit(1)

        password = getpass.getpass("Password: ")
        confirm = getpass.getpass("Confirm password: ")
        if password != confirm:
            print("Passwords do not match.")
            sys.exit(1)
        if len(password) < 8:
            print("Password must be at least 8 characters.")
            sys.exit(1)

        password_hash = generate_password_hash(password)
        cursor.execute(
            "INSERT INTO admin (username, email, password_hash, is_active) VALUES (%s, %s, %s, 1)",
            (username, email, password_hash)
        )
        conn.commit()
        print(f"Admin account '{username}' created.")

    cursor.close()
    conn.close()


if __name__ == "__main__":
    main()