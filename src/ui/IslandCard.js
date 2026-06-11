// IslandCard — a big, tappable card representing one zone on the island map.
// Shows a simple SVG glyph, the zone name, a short description, and a
// progress indicator (completed missions in that zone).

import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Rect, Polygon } from 'react-native-svg';

import { palette } from '../theme/palette';
import { radius, spacing, shadow } from '../theme/layout';
import { typography } from '../theme/typography';

// A tiny illustrative glyph drawn with react-native-svg. Friendly, no faces.
function ZoneGlyph({ icon, color }) {
  return (
    <Svg width={46} height={46} viewBox="0 0 46 46">
      <Circle cx={23} cy={23} r={22} fill={color} opacity={0.18} />
      {icon === 'leaf' && (
        <Path
          d="M14 30 C14 18 24 12 34 12 C34 24 26 32 14 32 Z"
          fill={color}
        />
      )}
      {icon === 'volcano' && (
        <>
          <Polygon points="23,12 34,34 12,34" fill={color} />
          <Path d="M19 12 L23 6 L27 12 Z" fill={palette.wrong} opacity={0.8} />
        </>
      )}
      {icon === 'river' && (
        <>
          <Path d="M10 20 Q18 14 23 20 T36 20" stroke={color} strokeWidth={4} fill="none" />
          <Path d="M10 28 Q18 22 23 28 T36 28" stroke={color} strokeWidth={4} fill="none" />
        </>
      )}
      {icon === 'star' && (
        <Polygon
          points="23,9 27,19 38,19 29,26 32,37 23,30 14,37 17,26 8,19 19,19"
          fill={color}
        />
      )}
      {icon === 'lab' && (
        <>
          <Rect x={18} y={12} width={10} height={6} rx={2} fill={color} />
          <Path d="M20 18 L16 32 H30 L26 18 Z" fill={color} opacity={0.7} />
        </>
      )}
    </Svg>
  );
}

function ProgressBar({ value, color }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

export default function IslandCard({ zone, completed = 0, progressPercent = 0, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        shadow.soft,
        { backgroundColor: zone.soft },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${zone.name}. ${zone.description}`}
    >
      <View style={styles.row}>
        <View style={[styles.glyphWrap, { backgroundColor: palette.white }]}>
          <ZoneGlyph icon={zone.icon} color={zone.color} />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.name, { color: palette.text }]}>{zone.name}</Text>
          <Text style={styles.desc}>{zone.description}</Text>
        </View>
      </View>

      {zone.kind === 'mission' ? (
        <View style={styles.progressWrap}>
          <ProgressBar value={progressPercent} color={zone.color} />
          <Text style={styles.progressLabel}>
            {completed === 0 ? 'New trail' : `${completed} missions done`}
          </Text>
        </View>
      ) : (
        <View style={styles.progressWrap}>
          <Text style={[styles.toolLabel, { color: zone.color }]}>Tools • Calculator & Number Builder</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  glyphWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textWrap: {
    flex: 1,
  },
  name: {
    ...typography.heading,
    marginBottom: 2,
  },
  desc: {
    ...typography.caption,
    color: palette.muted,
  },
  progressWrap: {
    marginTop: spacing.md,
  },
  track: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: palette.trackBg,
    overflow: 'hidden',
  },
  fill: {
    height: 10,
    borderRadius: radius.pill,
  },
  progressLabel: {
    ...typography.caption,
    color: palette.muted,
    marginTop: spacing.xs,
  },
  toolLabel: {
    ...typography.label,
  },
});
