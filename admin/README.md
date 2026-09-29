# Nayl admin panels

Static pages, no build step. They are not part of the Expo app bundle.

## /admin/analytics — onboarding funnel

1. Run `supabase/migrations/20260929000000_onboarding_analytics.sql` once in the
   Supabase dashboard SQL editor. It creates `onboarding_analytics`, which the app
   writes to from `src/services/onboardingAnalytics.ts`.
2. Serve the repo root and open `/admin/analytics/`:
   ```
   npx serve .            # then http://localhost:3000/admin/analytics/
   ```
   Opening `admin/analytics/index.html` directly in a browser also works.
3. Paste the project URL and the **service_role** key (Supabase → Project Settings → API).
   The table blocks reads with the public anon key, so only the service role can
   see names. The key is stored in that browser's local storage only; never commit it
   or host this page publicly with it filled in.

"Load demo data" shows generated sample data without connecting.

Step indexes: 0–18 are the onboarding pages in `OnboardingQuiz.tsx` (18 = paywall),
19 = finished from the plan screen without purchasing, 20 = converted on the paywall.
