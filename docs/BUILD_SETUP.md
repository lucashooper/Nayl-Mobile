# Nayl — build setup on a new machine

After `git pull`, run through this once on each Mac you build from.

## Prerequisites

- Node.js 20+ and npm
- Xcode **26.3+** (26.4+ recommended; 26.3 needs the patches in `patches/`)
- Ruby (for Fastlane) — macOS system Ruby is fine
- CocoaPods: `sudo gem install cocoapods` (if not installed)
- Logged into the correct Apple team in Xcode (Team `HMLV274G9F`)

## 1. Install JS dependencies

```bash
cd Nayl-Mobile
npm install
```

`postinstall` applies patches for Expo SDK 57 + Xcode 26.3 Swift concurrency fixes.

## 2. iOS native deps

```bash
cd ios
bundle install          # Fastlane gems → vendor/bundle/
pod install             # CocoaPods → Pods/
cd ..
```

## 3. Environment files (already in repo)

These are **committed** in this private repo so you don't re-enter secrets:

| File | Purpose |
|------|---------|
| `.env` | Supabase, RevenueCat, Google OAuth (Expo / Metro) |
| `ios/fastlane/.env` | App Store Connect API key metadata |
| `ios/fastlane/AuthKey_254678Q6DV.p8` | App Store Connect upload key |

If `.env` is missing `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, add it from Google Cloud Console → OAuth → Web client (required for Google Sign-In on production builds).

## 4. Local dev

```bash
npm start              # Expo Go
npm run ios            # Simulator dev build
```

## 5. TestFlight / App Store (Fastlane)

```bash
cd ios
bundle exec fastlane beta
```

Builds, signs, and uploads to App Store Connect (app `6792496781`).

## 6. EAS cloud builds (optional)

Project: `@crupid3s-team/nayl-app`. Log in as an account with access to that org:

```bash
eas login
eas whoami            # must list crupid3s-team
eas build --platform ios --profile production --auto-submit
```

Production env vars are on EAS; local `.env` is used for Metro/dev and Fastlane local builds.

## Not in git (regenerated)

| Path | How to get it |
|------|----------------|
| `node_modules/` | `npm install` |
| `ios/Pods/` | `pod install` |
| `ios/vendor/bundle/` | `bundle install` |
| `ios/Nayl.ipa` | `fastlane beta` or `fastlane build` |
| `.expo/` | Created by Expo CLI |

## Troubleshooting

- **Swift concurrency errors in `expo-modules-jsi`**: Run `npm install` again to re-apply patches; upgrade to Xcode 26.4+ if possible.
- **Fastlane signing**: Open `ios/Nayl.xcworkspace` in Xcode once and confirm automatic signing + team.
- **Pod install iOS 16.4 warnings**: Expected for Expo SDK 57; deployment target is 16.4 in `Podfile.properties.json`.
