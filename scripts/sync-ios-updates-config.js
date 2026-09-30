#!/usr/bin/env node
/**
 * Copies the OTA update settings from app.json into ios/Nayl/Supporting/Expo.plist.
 * The iOS project is committed (no prebuild), so expo-updates reads only Expo.plist.
 * Fastlane runs this before every build; it fails if app.json has no updates.url
 * (run `eas init` first so the build doesn't ship with OTA silently broken).
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const { expo } = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
const url = expo.updates && expo.updates.url;
const runtimeVersion = expo.runtimeVersion;
const channel = process.env.EXPO_UPDATES_CHANNEL || 'production';

if (!url) {
  console.error('app.json has no expo.updates.url. Run `eas init` to link the EAS project first.');
  process.exit(1);
}
if (typeof runtimeVersion !== 'string') {
  console.error('app.json expo.runtimeVersion must be a fixed string for the bare iOS project.');
  process.exit(1);
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>EXUpdatesCheckOnLaunch</key>
    <string>ALWAYS</string>
    <key>EXUpdatesEnabled</key>
    <true/>
    <key>EXUpdatesLaunchWaitMs</key>
    <integer>0</integer>
    <key>EXUpdatesRequestHeaders</key>
    <dict>
      <key>expo-channel-name</key>
      <string>${esc(channel)}</string>
    </dict>
    <key>EXUpdatesRuntimeVersion</key>
    <string>${esc(runtimeVersion)}</string>
    <key>EXUpdatesURL</key>
    <string>${esc(url)}</string>
  </dict>
</plist>
`;

fs.writeFileSync(path.join(root, 'ios/Nayl/Supporting/Expo.plist'), plist);
console.log(`Expo.plist: updates on, channel ${channel}, runtime ${runtimeVersion}, ${url}`);
