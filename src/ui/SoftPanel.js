// SoftPanel — a rounded, softly shadowed card container.

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { palette } from '../theme/palette';
import { radius, spacing, shadow } from '../theme/layout';

export default function SoftPanel({ children, color, style, padded = true }) {
  return (
    <View
      style={[
        styles.panel,
        shadow.soft,
        { backgroundColor: color || palette.white },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: radius.lg,
  },
  padded: {
    padding: spacing.lg,
  },
});
