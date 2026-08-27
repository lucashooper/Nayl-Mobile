-- Investor demo: millie@app.com
-- Run in Supabase Dashboard → SQL Editor (or delete user + run create script)
--
-- If Confirm email is OFF but login still fails for an old account, run:
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE lower(email) = 'millie@app.com';
