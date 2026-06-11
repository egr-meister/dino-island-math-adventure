// Expo config plugin: withDinoAndroidRelease
//
// Runs automatically during `expo prebuild`. It makes the generated Android
// project produce a proper, optimized, signed release build without us having
// to commit the whole /android folder.
//
// It does three things:
//   1. Turns on ProGuard (minify) + resource shrinking via gradle properties.
//      (Expo SDK 51's app/build.gradle already reads these flags.)
//   2. Injects a `release` signing config that reads credentials from
//      environment variables (provided by GitHub Actions secrets in CI).
//   3. Writes android/app/proguard-rules.pro with safe keep rules.
//
// No real passwords or keystores live in the repo — only env lookups.

const {
  withGradleProperties,
  withAppBuildGradle,
  withDangerousMod,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/* ----------------------------------------------------------------- */
/* 1. Enable ProGuard + shrinkResources for release builds.          */
/* ----------------------------------------------------------------- */

function setGradleProperty(config, key, value) {
  const existing = config.modResults.find(
    (item) => item.type === 'property' && item.key === key
  );
  if (existing) {
    existing.value = value;
  } else {
    config.modResults.push({ type: 'property', key, value });
  }
  return config;
}

function withReleaseGradleProperties(config) {
  return withGradleProperties(config, (cfg) => {
    setGradleProperty(cfg, 'android.enableProguardInReleaseBuilds', 'true');
    setGradleProperty(cfg, 'android.enableShrinkResourcesInReleaseBuilds', 'true');
    return cfg;
  });
}

/* ----------------------------------------------------------------- */
/* 2. Inject the release signing config into app/build.gradle.       */
/* ----------------------------------------------------------------- */

const RELEASE_SIGNING_BLOCK = `        release {
            if (System.getenv("ANDROID_KEYSTORE_PASSWORD") != null) {
                storeFile file(System.getenv("ANDROID_KEYSTORE_PATH") ?: "release.keystore")
                storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
                keyAlias System.getenv("ANDROID_KEY_ALIAS")
                keyPassword System.getenv("ANDROID_KEY_PASSWORD")
            }
        }
`;

function withReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    let gradle = cfg.modResults.contents;

    // Add a `release` entry inside signingConfigs { ... } (once).
    if (!gradle.includes('storeFile file(System.getenv("ANDROID_KEYSTORE_PATH")')) {
      gradle = gradle.replace(
        /signingConfigs\s*\{/,
        `signingConfigs {\n${RELEASE_SIGNING_BLOCK}`
      );
    }

    // Point the release buildType at signingConfigs.release. We anchor on
    // buildTypes { ... release { ... signingConfig signingConfigs.debug } } so
    // the debug block above is left untouched.
    gradle = gradle.replace(
      /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?signingConfig\s+)signingConfigs\.debug/,
      '$1signingConfigs.release'
    );

    cfg.modResults.contents = gradle;
    return cfg;
  });
}

/* ----------------------------------------------------------------- */
/* 3. Write a sensible proguard-rules.pro.                           */
/* ----------------------------------------------------------------- */

const PROGUARD_RULES = `# Dino Island Math Adventure — ProGuard rules
# Standard production optimization for the release build.

# --- React Native core ---
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.react.**

# --- Expo modules ---
-keep class expo.modules.** { *; }
-keep class com.swmansion.** { *; }

# --- react-native-svg ---
-keep public class com.horcrux.svg.** { *; }

# --- Keep annotations / native methods ---
-keepattributes *Annotation*
-keepclassmembers class * {
    native <methods>;
}
`;

function withProguardRulesFile(config) {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const file = path.join(
        cfg.modRequest.platformProjectRoot,
        'app',
        'proguard-rules.pro'
      );
      fs.writeFileSync(file, PROGUARD_RULES, 'utf8');
      return cfg;
    },
  ]);
}

/* ----------------------------------------------------------------- */

module.exports = function withDinoAndroidRelease(config) {
  config = withReleaseGradleProperties(config);
  config = withReleaseSigning(config);
  config = withProguardRulesFile(config);
  return config;
};
