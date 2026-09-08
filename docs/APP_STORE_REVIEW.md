# App Store Review — sign-in instructions

Paste the block below into **App Store Connect → App → App Review Information → Sign-in required**.

---

**How to access the app**

1. Install the build on iPad (or iPhone).
2. On the welcome screen, tap **Login** (returning user flow).
3. Sign in using **email** (recommended for review):

- **Username:** `millie@app.com`
- **Password:** `Millie123`

This demo account has **full Nayl Pro access** and sample streak/progress data for review.

**Alternative sign-in:** Sign in with Apple or Google using any valid test account. Email sign-in is the most reliable path for App Review.

**Account deletion:** Profile tab → scroll to **Delete Account** (Guideline 5.1.1v).

**Subscription / paywall:** The demo account bypasses the paywall. New users complete onboarding, then subscribe via the in-app paywall (StoreKit).

---

## Before each submission

1. Ensure the demo user exists in **production Supabase**:

```bash
node scripts/create-investor-demo-user.mjs
```

2. In **EAS → Environment variables → production**, set:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` ← required for Google Sign-In on iOS
- `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`

3. In **Supabase → Authentication → Providers**:

- Apple: enabled, bundle ID `app.nayl.mobile`
- Google: enabled, Web client ID matches `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- Email: **Confirm email** = OFF (so demo login works immediately)

4. Test on **iPad simulator or device** with a release/dev client build (not Expo Go).
