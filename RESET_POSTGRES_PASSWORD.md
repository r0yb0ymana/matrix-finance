# Reset PostgreSQL Password (Windows)

## Method 1: Using SQL Shell (Easiest)

1. Open **SQL Shell (psql)** from your Start menu

2. Press Enter for all prompts until you see the password prompt:
   ```
   Server [localhost]:        <-- Press Enter
   Database [postgres]:       <-- Press Enter
   Port [5432]:              <-- Press Enter
   Username [postgres]:      <-- Press Enter
   Password for user postgres: <-- Try any password you remember
   ```

3. If you get in, run:
   ```sql
   ALTER USER postgres PASSWORD 'newpassword123';
   ```

4. If you CAN'T get in with any password, try Method 2.

## Method 2: Reset via pg_hba.conf (If locked out)

1. **Find pg_hba.conf** - Usually at:
   ```
   C:\Program Files\PostgreSQL\16\data\pg_hba.conf
   ```
   or
   ```
   C:\Program Files\PostgreSQL\15\data\pg_hba.conf
   ```

2. **Edit pg_hba.conf** (requires admin rights):
   - Right-click Notepad → "Run as administrator"
   - Open the pg_hba.conf file
   - Find lines that look like:
     ```
     host    all             all             127.0.0.1/32            scram-sha-256
     ```
   - Change `scram-sha-256` to `trust`:
     ```
     host    all             all             127.0.0.1/32            trust
     ```
   - Save the file

3. **Restart PostgreSQL**:
   - Open Services (Win+R, type `services.msc`)
   - Find "postgresql-x64-16" (or your version)
   - Right-click → Restart

4. **Open SQL Shell (psql)** and press Enter for all prompts (no password needed now)

5. **Set new password**:
   ```sql
   ALTER USER postgres PASSWORD 'postgres';
   \q
   ```

6. **Restore security**:
   - Edit pg_hba.conf again
   - Change `trust` back to `scram-sha-256`
   - Restart PostgreSQL service again

## Method 3: Reinstall PostgreSQL (Last resort)

If nothing works, you can uninstall and reinstall PostgreSQL, setting a simple password like `postgres` during installation.

---

## After resetting password

Once you know your password, run:
```bash
node scripts/db-complete-setup.mjs YOUR_PASSWORD_HERE
```

Example:
```bash
node scripts/db-complete-setup.mjs postgres
```

This will complete the entire database setup automatically!
