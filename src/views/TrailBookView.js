// TrailBookView — the journey book. Shows the child's overall progress,
// badges, favorite zone, learning rank, and per-zone trail progress.
// Includes "Reset Trail Book" with a confirmation prompt.

import React from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppState } from '../core/appStateService';
import {
  computeRank,
  computeSuccessRate,
  favoriteZone,
} from '../core/progressService';
import { ALL_BADGES } from '../adventure/badgeRules';
import { MISSION_ZONE_IDS, getZone } from '../adventure/islandZones';
import { getTheme, palette } from '../theme/palette';
import { spacing, radius } from '../theme/layout';
import { typography } from '../theme/typography';
import DinoButton from '../ui/DinoButton';
import DinoBadge from '../ui/DinoBadge';
import SoftPanel from '../ui/SoftPanel';

function StatRow({ label, value }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function ZoneProgressCard({ zoneId, stat }) {
  const zone = getZone(zoneId);
  const total = stat.correct + stat.wrong;
  const rate = total === 0 ? 0 : Math.round((stat.correct / total) * 100);
  return (
    <SoftPanel color={zone.soft} style={styles.zoneCard}>
      <Text style={[styles.zoneName, { color: zone.color }]}>{zone.name}</Text>
      <Text style={styles.zoneStat}>
        {stat.completed} missions • {stat.correct} correct • {rate}%
      </Text>
    </SoftPanel>
  );
}

export default function TrailBookView({ navigation }) {
  const { state, actions } = useAppState();
  const theme = getTheme(state.islandTheme);

  const rank = computeRank(state.totalCorrect);
  const rate = computeSuccessRate(state.totalCorrect, state.totalWrong);
  const fav = favoriteZone(state.zoneStats);

  const confirmReset = () => {
    Alert.alert(
      'Reset Trail Book',
      'Are you sure you want to reset your trail book?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => actions.resetTrailBook() },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <DinoButton label="← Map" variant="ghost" onPress={() => navigation.goBack()} style={styles.backBtn} textStyle={styles.backText} />
        <Text style={styles.headerTitle}>Trail Book</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SoftPanel color={palette.cream} style={styles.rankPanel}>
          <Text style={styles.rankLabel}>Current learning rank</Text>
          <Text style={styles.rankValue}>{rank.label}</Text>
          <Text style={styles.rankHint}>{state.totalCorrect} correct answers so far</Text>
        </SoftPanel>

        <SoftPanel color={palette.white} style={styles.section}>
          <Text style={styles.sectionTitle}>Your journey</Text>
          <StatRow label="Completed missions" value={state.completedMissions} />
          <StatRow label="Total correct answers" value={state.totalCorrect} />
          <StatRow label="Total wrong answers" value={state.totalWrong} />
          <StatRow label="Success rate" value={`${rate}%`} />
          <StatRow label="Best mission score" value={`${state.bestMissionScore} / 5`} />
          <StatRow label="Favorite zone" value={fav} />
        </SoftPanel>

        <Text style={styles.groupTitle}>Badges earned</Text>
        <View style={styles.badgeWrap}>
          {ALL_BADGES.map((badge) => (
            <DinoBadge key={badge.id} badge={badge} earned={state.earnedBadges.includes(badge.id)} />
          ))}
        </View>

        <Text style={styles.groupTitle}>Zone progress</Text>
        {MISSION_ZONE_IDS.map((zoneId) => (
          <ZoneProgressCard key={zoneId} zoneId={zoneId} stat={state.zoneStats[zoneId]} />
        ))}

        <View style={{ height: spacing.lg }} />
        <DinoButton label="Reset Trail Book" color={palette.wrong} variant="primary" onPress={confirmReset} />
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
  rankPanel: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rankLabel: { ...typography.label, color: palette.muted },
  rankValue: { ...typography.title, color: palette.softBrown, marginVertical: spacing.xs },
  rankHint: { ...typography.caption, color: palette.muted },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading,
    color: palette.text,
    marginBottom: spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.trackBg,
  },
  statLabel: { ...typography.body, color: palette.text },
  statValue: { ...typography.bodyStrong, color: palette.text },
  groupTitle: {
    ...typography.heading,
    color: palette.text,
    marginBottom: spacing.sm,
  },
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  zoneCard: {
    marginBottom: spacing.sm,
  },
  zoneName: { ...typography.bodyStrong },
  zoneStat: { ...typography.caption, color: palette.text, marginTop: 2 },
});
