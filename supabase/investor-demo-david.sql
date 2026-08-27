-- Investor demo: david@insight.app
--
-- WHY "email not confirmed" still happens:
-- Turning OFF "Confirm email" in Auth settings only affects NEW signups.
-- David was created while confirmation was ON, so email_confirmed_at is still NULL.
--
-- FIX OPTION A (recommended — works when SQL Editor is stable):
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE lower(email) = 'david@insight.app';

--
-- FIX OPTION B (if SQL Editor keeps failing):
-- 1. Supabase Dashboard → Authentication → Users
-- 2. Delete user david@insight.app
-- 3. Ensure Authentication → Providers → Email → "Confirm email" is OFF
-- 4. Sign in again from the app (creates a fresh auto-confirmed account)
--    OR run: node scripts/create-investor-demo-user.mjs
