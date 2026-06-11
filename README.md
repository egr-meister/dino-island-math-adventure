# Dino Island Math Adventure 🦕

A friendly, offline math-learning app for kids. Children explore a dinosaur
island, choose a zone on the island **map**, and solve short math **missions**.
The Number Lab offers two safe tools: a Friendly Calculator and a Number
Builder. Progress and badges are stored only on the device.

> Safe by design: **no ads, no purchases, no accounts, no analytics, no data
> collection, no gambling mechanics.** The app works fully offline.

---

## Project description

The main screen is not a plain menu — it is the **Dino Island map**. Each zone
is an adventure:

| Zone | What you do |
| --- | --- |
| **Jungle Counting** | Count leaves, eggs, and tiny dinos. |
| **Volcano Numbers** | Solve warm number puzzles near the volcano. |
| **River Logic** | Help dinos cross the river with smart answers. |
| **Sky Shapes** | Learn shapes and simple patterns with flying dinos. |
| **Number Lab** | Use friendly tools (Calculator + Number Builder). |

Each mission is **5 questions**, each with **3 answer choices**. Finishing a
mission shows correct/wrong counts, success rate, a friendly message, and a
safe educational **badge**.

## Features

- 🗺️ **Island map** home screen with per-zone progress
- 🧩 **Mission engine** that generates fresh tasks for every zone and level
- 🧮 **Friendly Calculator** (no `eval`, safe division, friendly errors)
- 🔢 **Number Builder** — shows ways to build a number (e.g. `8 = 4 + 4`)
- 📖 **Trail Book** — stats, badges, favorite zone, and a learning rank
- 🛠️ **Grownups Corner** — learning level, lab mode, sound, haptics, theme
- 💾 Local-only storage via AsyncStorage; **works offline**
- 📱 Portrait-only, Android 8+ (minSdk via Expo defaults)

## Architecture

```
src/
  adventure/   missionEngine, dinoTaskFactory, islandZones, badgeRules
  core/        calculatorCore, appStateService, progressService, settingsService
  ui/          DinoButton, IslandCard, MissionChoice, DinoBadge, SoftPanel, ResultBubble
  views/       DinoIslandView, ZoneMissionView, NumberLabView, TrailBookView,
               GrownupsCornerView, PrivacyNoteView, AppInfoView
  navigation/  RootNavigator
  theme/       palette, typography, layout
```

The native Android project is **not committed**. It is generated on demand with
`expo prebuild`; an Expo config plugin (`plugins/withDinoAndroidRelease.js`)
adds release signing, ProGuard/minify, resource shrinking, and the
`proguard-rules.pro` file during prebuild.

---

## How to run locally

```bash
npm install
npx expo start            # open in Expo Go / emulator
# or build & run the native app on a device/emulator:
npx expo run:android
```

## How to build Android (locally)

```bash
# 1. Generate the native android/ project
npx expo prebuild --platform android --no-install

# 2. Provide signing credentials as environment variables
export ANDROID_KEYSTORE_PATH="$(pwd)/android/app/release.keystore"
export ANDROID_KEYSTORE_PASSWORD="your-store-password"
export ANDROID_KEY_ALIAS="dino_island_key"
export ANDROID_KEY_PASSWORD="your-key-password"

# 3. Build
cd android
./gradlew assembleRelease   # -> app/build/outputs/apk/release/app-release.apk
./gradlew bundleRelease     # -> app/build/outputs/bundle/release/app-release.aab
```

If no keystore env vars are present, the release config is skipped — use a
debug build (`./gradlew assembleDebug`) for quick local testing.

## How to generate a keystore

```bash
keytool -genkeypair -v \
  -keystore dino-island-release-key.keystore \
  -alias dino_island_key \
  -keyalg RSA -keysize 2048 -validity 10000
```

Keep this file private. **Never commit it** — it is already in `.gitignore`.

Convert it to base64 (for the GitHub Secret):

```bash
# macOS / Linux — copy straight to clipboard
base64 -i dino-island-release-key.keystore | pbcopy

# or write it to a file
base64 dino-island-release-key.keystore > keystore-base64.txt
```

## How to add GitHub Secrets

In your repo: **Settings → Secrets and variables → Actions → New repository
secret**. Add:

| Secret | Value |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | the base64 string of your keystore |
| `ANDROID_KEYSTORE_PASSWORD` | the keystore (store) password |
| `ANDROID_KEY_ALIAS` | `dino_island_key` (or your alias) |
| `ANDROID_KEY_PASSWORD` | the key password |

## How the GitHub Actions build works

`.github/workflows/android-build.yml` runs on every push to `main` (and via
**Run workflow**). It:

1. Checks out the code
2. Installs Node.js 18, JDK 17, and the Android SDK
3. `npm install`
4. `npx expo prebuild --platform android --no-install` (generates `android/`)
5. Decodes `ANDROID_KEYSTORE_BASE64` into `android/app/release.keystore`
6. Builds the release **APK** (`./gradlew assembleRelease`)
7. Builds the release **AAB** (`./gradlew bundleRelease`)
8. Uploads both as workflow artifacts:
   - `dino-island-release.apk`
   - `dino-island-release.aab`

Download them from the workflow run's **Artifacts** section.

## Privacy and child safety notes

Dino Island Math Adventure is designed for children and families. The app does
**not** collect, store, or share personal information. It does not use
advertising, analytics, purchases, or account registration. Progress and
settings are stored **only on the user's device**. The app works offline and is
made for safe learning.

There are no coins, chests, jackpots, spins, roulette, or other gambling-style
mechanics anywhere in the app. Badges are simple, non-tradable encouragement
tokens.

## Notes on app icons

The PNGs in `assets/` are minimal placeholders so the project builds out of the
box. Replace `icon.png`, `splash.png`, and `adaptive-icon.png` with real
1024×1024 artwork before publishing.
