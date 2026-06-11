// AppInfoView — app name, version, and a short friendly description.

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

import { useAppState } from '../core/appStateService';
import { getTheme, palette } from '../theme/palette';
import { spacing } from '../theme/layout';
import { typography } from '../theme/typography';
import SoftPanel from '../ui/SoftPanel';
import DinoButton from '../ui/DinoButton';

const APP_NAME = 'Dino Island Math Adventure';
const DESCRIPTION =
  'Dino Island Math Adventure is a friendly learning app where kids explore a dinosaur island, solve math missions, use number tools, and collect safe educational badges.';

export default function AppInfoView({ navigation }) {
  const { state } = useAppState();
  const theme = getTheme(state.islandTheme);
  const version =
    (Constants.expoConfig && Constants.expoConfig.version) ||
    (Constants.manifest && Constants.manifest.version) ||
    '1.0.0';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <DinoButton label="← Back" variant="ghost" onPress={() => navigation.goBack()} style={styles.backBtn} textStyle={styles.backText} />
        <Text style={styles.headerTitle}>App Info</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SoftPanel color={palette.cream} style={styles.hero}>
          <Text style={styles.emoji}>🦕</Text>
          <Text style={styles.appName}>{APP_NAME}</Text>
          <Text style={styles.version}>Version {version}</Text>
        </SoftPanel>

        <SoftPanel color={palette.white} style={styles.descPanel}>
          <Text style={styles.descTitle}>About this app</Text>
          <Text style={styles.description}>{DESCRIPTION}</Text>
        </SoftPanel>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerTitle: { ...typography.heading, color: palette.text },
  backBtn: {
    minHeight: 40,
    width: 88,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  backText: { ...typography.label },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emoji: { fontSize: 56, marginBottom: spacing.sm },
  appName: {
    ...typography.title,
    color: palette.text,
    textAlign: 'center',
  },
  version: {
    ...typography.label,
    color: palette.muted,
    marginTop: spacing.xs,
  },
  descPanel: {},
  descTitle: {
    ...typography.heading,
    color: palette.text,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: palette.text,
    lineHeight: 26,
  },
});
