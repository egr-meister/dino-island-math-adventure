// MissionChoice — one large answer option (A / B / C) inside a mission.
// Shows neutral, correct, or wrong styling after the child answers.

import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';

import { palette } from '../theme/palette';
import { radius, spacing, shadow } from '../theme/layout';
import { typography } from '../theme/typography';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function MissionChoice({ index, value, state = 'idle', disabled, onPress }) {
  // state: 'idle' | 'correct' | 'wrong' | 'muted'
  const isCorrect = state === 'correct';
  const isWrong = state === 'wrong';
  const isMuted = state === 'muted';

  const bg = isCorrect
    ? palette.correct
    : isWrong
    ? palette.wrong
    : palette.white;

  const textColor = isCorrect || isWrong ? palette.white : palette.text;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.choice,
        shadow.soft,
        { backgroundColor: bg },
        isMuted && styles.dim,
        pressed && !disabled && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Answer ${LETTERS[index]}: ${value}`}
    >
      <View style={[styles.letterWrap, { backgroundColor: isCorrect || isWrong ? 'rgba(255,255,255,0.3)' : palette.sand }]}>
        <Text style={[styles.letter, { color: isCorrect || isWrong ? palette.white : palette.softBrown }]}>
          {LETTERS[index]}
        </Text>
      </View>
      <Text style={[styles.value, { color: textColor }]}>{String(value)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  dim: {
    opacity: 0.5,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  letterWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  letter: {
    ...typography.bodyStrong,
  },
  value: {
    ...typography.title,
  },
});
