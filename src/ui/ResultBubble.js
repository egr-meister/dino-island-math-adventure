// ResultBubble — the mission result summary card: correct/wrong counts,
// success rate, earned badge, and a friendly closing message.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { palette } from '../theme/palette';
import { radius, spacing, shadow } from '../theme/layout';
import { typography } from '../theme/typography';
import DinoBadge from './DinoBadge';

function StatPill({ label, value, color }) {
  return (
    <View style={[styles.pill, { backgroundColor: color }]}>
      <Text style={styles.pillValue}>{value}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

export default function ResultBubble({ correct, wrong, successRate, badge, message }) {
  return (
    <View style={[styles.card, shadow.lifted]}>
      <Text style={styles.title}>Trail Complete!</Text>

      <View style={styles.statsRow}>
        <StatPill label="Correct" value={correct} color={palette.leaf} />
        <StatPill label="Wrong" value={wrong} color={palette.sand} />
        <StatPill label="Success" value={`${successRate}%`} color={palette.sky} />
      </View>

      {badge ? (
        <View style={styles.badgeWrap}>
          <Text style={styles.earnedLabel}>You earned a badge!</Text>
          <DinoBadge badge={badge} earned size="lg" />
        </View>
      ) : (
        <Text style={styles.tryLabel}>Get 3 right to earn a badge next time.</Text>
      )}

      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.cream,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...typography.title,
    color: palette.text,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.md,
  },
  pill: {
    flex: 1,
    marginHorizontal: spacing.xs,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  pillValue: {
    ...typography.title,
    color: palette.text,
  },
  pillLabel: {
    ...typography.caption,
    color: palette.text,
  },
  badgeWrap: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  earnedLabel: {
    ...typography.label,
    color: palette.softBrown,
    marginBottom: spacing.xs,
  },
  tryLabel: {
    ...typography.body,
    color: palette.muted,
    marginVertical: spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...typography.heading,
    color: palette.jungle,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
