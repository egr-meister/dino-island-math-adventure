// PrivacyNoteView — a plain-language privacy note for children and families.

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppState } from '../core/appStateService';
import { getTheme, palette } from '../theme/palette';
import { spacing } from '../theme/layout';
import { typography } from '../theme/typography';
import SoftPanel from '../ui/SoftPanel';
import DinoButton from '../ui/DinoButton';

const PARAGRAPHS = [
  'Dino Island Math Adventure is designed for children and families. The app does not collect, store, or share personal information. It does not use advertising, analytics, purchases, or account registration.',
  'Progress and settings are stored only on the user’s device.',
  'The app works offline and is made for safe learning.',
];

export default function PrivacyNoteView({ navigation }) {
  const { state } = useAppState();
  const theme = getTheme(state.islandTheme);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <DinoButton label="← Back" variant="ghost" onPress={() => navigation.goBack()} style={styles.backBtn} textStyle={styles.backText} />
        <Text style={styles.headerTitle}>Privacy Note</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SoftPanel color={palette.white}>
          <Text style={styles.title}>Privacy Note</Text>
          {PARAGRAPHS.map((p, i) => (
            <Text key={i} style={styles.paragraph}>
              {p}
            </Text>
          ))}
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
  title: {
    ...typography.title,
    color: palette.text,
    marginBottom: spacing.md,
  },
  paragraph: {
    ...typography.body,
    color: palette.text,
    lineHeight: 26,
    marginBottom: spacing.md,
  },
});
