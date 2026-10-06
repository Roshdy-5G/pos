<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/1468f986-3b0b-41b4-accf-5e16643e55f5

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set the PostgreSQL connection values (`SQL_HOST`, `SQL_PORT`, `SQL_USER`, `SQL_PASSWORD`, and `SQL_DB_NAME`). The POS API needs a reachable PostgreSQL database.
3. Set `SESSION_SECRET` in `.env` to a private random value (at least 32 characters); keep it stable to preserve user sessions when restarting the server.
4. Set the `GEMINI_API_KEY` in `.env` to your Gemini API key if using Gemini features.
5. Create or update the PostgreSQL tables from the application schema:
   `npm run db:push`
6. Run the app:
   `npm run dev`

On the first run, the login screen guides you through creating the system administrator account. Passwords must be at least four characters; use a strong password for the system administrator. Password hashes are stored in PostgreSQL, and the system administrator cannot be deleted or have permissions reduced. Use the **المستخدمون والصلاحيات** tab in Settings to add accounts, change usernames/passwords, assign individual permissions, and remove non-admin accounts. Only authenticated sessions can access POS APIs; administrator functions are enforced by the backend as well as the interface.

## Database Migration

The API installs the change-audit triggers from `migrations/002_audit_logs.sql` and applies `migrations/004_user_password_permissions.sql` and `migrations/005_driver_settlements.sql` when first accessed. Existing installations should run `npm run db:push` before starting the app so the current application schema is present. The user-management migration adds password hashes, permissions, and the protected system-administrator marker; password hashes are excluded from audit records. Driver settlement records and their check links are persisted and audited separately from sales and customer payments; grant **متابعة ومحاسبة الطيارين** in user permissions to allow access.

## Backups and data integrity

After a successful PostgreSQL connection, the app writes a PostgreSQL custom-format dump to `backup/pos-backup-YYYY-MM-DD.dump`, refreshes that day's file every five minutes, and attempts a final refresh during graceful shutdown. The completed dump replaces the prior same-day copy atomically. Install PostgreSQL's `pg_dump` client on the application machine and make it available on `PATH`, or set `PG_DUMP_PATH` to its full executable path. Restore a dump with `pg_restore` into a PostgreSQL database.

Database writes are committed before the interface reports success. The app does not report in-memory fallback data as saved: if PostgreSQL is unavailable, the save fails visibly and the data must be resubmitted after reconnecting. Keep the daily dump folder on persistent storage and copy it off-device regularly for protection against disk failure.
