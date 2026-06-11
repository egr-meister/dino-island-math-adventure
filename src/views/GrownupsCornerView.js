// GrownupsCornerView — the settings screen, framed as a calm corner for
// grown-ups. Controls learning level, Number Lab mode, sound, haptics,
// island theme, and links to the Privacy Note and App Info.

import React from 'react';
import { View, Text, ScrollView, Pressable, Switch, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppState } from '../core/appStateService';
import { LEARNING_LEVELS, NUMBER_LAB_MODES } from '../core/settingsService';
import { islandThemes, getTheme, palette } from '../theme/palette';
import { spacing, radius } from '../theme/layout';
import { typography } from '../theme/typography';
import SoftPanel from '../ui/SoftPanel';
import DinoButton from '../ui/DinoButton';

function OptionRow({ label, hint, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.option, active && styles.optionActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <View style={styles.optionTextWrap}>
        <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{label}</Text>
        {hint ? <Text style={[styles.optionHint, active && styles.optionHintActive]}>{hint}</Text> : null}
      </View>
      <View style={[styles.radio, active && styles.radioActive]}>
        {active ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

function Section({ title, children }) {
  return (
    <SoftPanel color={palette.white} style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </SoftPanel>
  );
}

export default function GrownupsCornerView({ navigation }) {
  const { state, actions } = useAppState();
  const theme = getTheme(state.islandTheme);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <DinoButton label="← Map" variant="ghost" onPress={() => navigation.goBack()} style={styles.backBtn} textStyle={styles.backText} />
        <Text style={styles.headerTitle}>Grownups Corner</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Section title="Learning Level">
          {Object.values(LEARNING_LEVELS).map((lvl) => (
            <OptionRow
              key={lvl.id}
              label={lvl.label}
              hint={lvl.hint}
              active={state.learningLevel === lvl.id}
              onPress={() => actions.updateSettings({ learningLevel: lvl.id })}
            />
          ))}
        </Section>

        <Section title="Number Lab Mode">
          {Object.values(NUMBER_LAB_MODES).map((m) => (
            <OptionRow
              key={m.id}
              label={m.label}
              hint={m.operators.join('  ')}
              active={state.numberLabMode === m.id}
              onPress={() => actions.updateSettings({ numberLabMode: m.id })}
            />
          ))}
        </Section>

        <Section title="Sound & Haptics">
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Sound</Text>
            <Switch
              value={state.soundEnabled}
              onValueChange={(v) => actions.updateSettings({ soundEnabled: v })}
              trackColor={{ true: palette.jungle, false: palette.trackBg }}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Gentle Haptics</Text>
            <Switch
              value={state.hapticsEnabled}
              onValueChange={(v) => actions.updateSettings({ hapticsEnabled: v })}
              trackColor={{ true: palette.jungle, false: palette.trackBg }}
            />
          </View>
        </Section>

        <Section title="Island Theme">
          {Object.values(islandThemes).map((t) => (
            <OptionRow
              key={t.id}
              label={t.label}
              active={state.islandTheme === t.id}
              onPress={() => actions.updateSettings({ islandTheme: t.id })}
            />
          ))}
        </Section>

        <DinoButton label="Privacy Note" variant="soft" onPress={() => navigation.navigate('PrivacyNote')} style={styles.linkBtn} />
        <DinoButton label="App Info" variant="soft" onPress={() => navigation.navigate('AppInfo')} style={styles.linkBtn} />

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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading,
    color: palette.text,
    marginBottom: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
    backgroundColor: palette.cream,
  },
  optionActive: {
    backgroundColor: palette.leaf,
  },
  optionTextWrap: { flex: 1, paddingRight: spacing.sm },
  optionLabel: { ...typography.bodyStrong, color: palette.text },
  optionLabelActive: { color: palette.text },
  optionHint: { ...typography.caption, color: palette.muted, marginTop: 2 },
  optionHintActive: { color: palette.text },
  radio: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: palette.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: palette.text,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: palette.text,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  switchLabel: { ...typography.body, color: palette.text },
  linkBtn: {
    marginBottom: spacing.sm,
  },
});
