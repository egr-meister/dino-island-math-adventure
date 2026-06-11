// DinoBadge — a friendly badge chip. Shown earned (bright) or locked (faded).

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { palette } from '../theme/palette';
import { radius, spacing, shadow } from '../theme/layout';
import { typography } from '../theme/typography';

export default function DinoBadge({ badge, earned = true, size = 'md' }) {
  const big = size === 'lg';
  return (
    <View
      style={[
        styles.badge,
        earned ? shadow.soft : null,
        big && styles.big,
        { backgroundColor: earned ? palette.sand : palette.trackBg },
        !earned && styles.locked,
      ]}
    >
      <Text style={[styles.emoji, big && styles.emojiBig]}>{badge.emoji}</Text>
      <Text style={[styles.label, !earned && styles.lockedText]} numberOfLines={2}>
        {badge.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 110,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    margin: spacing.xs,
  },
  big: {
    width: 150,
    paddingVertical: spacing.lg,
  },
  locked: {
    opacity: 0.6,
  },
  emoji: {
    fontSize: 30,
    marginBottom: spacing.xs,
  },
  emojiBig: {
    fontSize: 44,
  },
  label: {
    ...typography.caption,
    color: palette.text,
    textAlign: 'center',
  },
  lockedText: {
    color: palette.muted,
  },
});
