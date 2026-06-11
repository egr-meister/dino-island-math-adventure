// DinoButton — a large, rounded, friendly pressable button.

import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

import { palette } from '../theme/palette';
import { radius, spacing, shadow } from '../theme/layout';
import { typography } from '../theme/typography';

export default function DinoButton({
  label,
  onPress,
  variant = 'primary',
  color,
  disabled = false,
  style,
  textStyle,
}) {
  const bg =
    color ||
    (variant === 'primary'
      ? palette.jungle
      : variant === 'soft'
      ? palette.sand
      : palette.white);

  const txtColor =
    variant === 'primary' ? palette.white : palette.text;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        variant !== 'ghost' && shadow.soft,
        { backgroundColor: bg },
        variant === 'ghost' && styles.ghost,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[styles.text, { color: txtColor }, textStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    borderWidth: 2,
    borderColor: palette.trackBg,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...typography.bodyStrong,
  },
});
