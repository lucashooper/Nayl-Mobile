# App Store Review — instructions for Apple

Paste sections below into **App Store Connect → App Review Information** as needed.

---

## Sign-in (app functionality)

Use this account to explore the app **after** reviewing subscriptions (see IAP section — this account skips the paywall).

1. On the welcome screen, tap **Login**.
2. Sign in with email:

- **Username:** `millie@app.com`
- **Password:** `Millie123`

This demo account has Nayl Pro access and sample streak/progress data.

**Alternative:** Sign in with Apple or Google using any valid sandbox account.

**Account deletion:** Profile tab → scroll to **Delete Account** (Guideline 5.1.1v).

---

## In-App Purchases (required for Guideline 2.1 review)

**Important:** The demo login above **does not show** the subscription paywall (it simulates an active Nayl Pro subscriber). To review IAP, use either path below.

### Path A — fastest (recommended)

1. Open the app on iPad or iPhone.
2. Tap the **Profile** tab (person icon, bottom-right).
3. Tap **Nayl Pro Plans**.
4. The paywall displays all three auto-renewable subscriptions:
   - **Nayl Pro: Weekly**
   - **Nayl Pro: Monthly**
   - **Nayl Pro: Yearly**
5. Tap a plan, then **Subscribe** to trigger the Apple sandbox purchase sheet.
6. Use a **Sandbox Apple ID** to complete test purchases.

### Path B — new user onboarding

1. On the welcome screen, tap **Begin** (do **not** use Login).
2. Complete the onboarding questionnaire (tap through screens; answers are optional).
3. On **Your personalized plan**, tap **Start my journey**.
4. The **Unlock Nayl Pro** paywall appears with Weekly / Monthly / Yearly options.

### Sandbox notes

- Subscriptions are sold via **StoreKit** through **RevenueCat**.
- Ensure the **Paid Apps Agreement** is active in App Store Connect → Business.
- IAP products must be **Ready to Submit** and linked to this app version.

---

## Reply template for App Store Connect (Guideline 2.1b)

Copy and paste this when replying to Apple's message:

```
Thank you for reviewing Nayl.

To locate In-App Purchases (Nayl Pro: Weekly, Nayl Pro: Monthly, Nayl Pro: Yearly):

1. Open the app on iPad or iPhone.
2. Tap Profile (bottom-right tab).
3. Tap "Nayl Pro Plans".
4. All three subscription options are shown on the paywall. Select a plan and tap Subscribe to open the Apple sandbox purchase dialog.

Alternative: From the welcome screen, tap Begin (not Login), complete onboarding, then tap Start my journey on the personalized plan screen to reach the same paywall.

Note: The App Review demo account (millie@app.com) is for testing signed-in app features only and bypasses the paywall because it simulates an active subscriber. Please use Path A or B above to review IAP.

Sandbox testing: use a Sandbox Apple ID. Subscriptions are configured in App Store Connect and delivered via StoreKit/RevenueCat.
```

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
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`

3. In **Supabase → Authentication → Providers**:

- Apple: enabled, bundle ID `app.nayl.mobile`
- Google: enabled, Web client ID matches `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- Email: **Confirm email** = OFF

4. In **App Store Connect → In-App Purchases**: Weekly, Monthly, Yearly subscriptions are **Ready to Submit** and attached to the build.

5. Test IAP on a **release/dev client** build (not Expo Go): Profile → Nayl Pro Plans.
