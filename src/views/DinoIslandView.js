// DinoIslandView — the main screen. Not a plain menu: it is the island map.
// The child sees the island's zones as big adventure cards and taps one to
// begin. Two small buttons lead to the Trail Book and the Grownups Corner.

import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { islandZones, ZONE_IDS } from '../adventure/islandZones';
import { useAppState } from '../core/appStateService';
import { getTheme } from '../theme/palette';
import { palette } from '../theme/palette';
import { spacing, radius } from '../theme/layout';
import { typography } from '../theme/typography';
import IslandCard from '../ui/IslandCard';

const MISSIONS_FOR_FULL = 5; // completing 5 missions fills a zone's bar

function HeaderButton({ label, emoji, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.headerBtnEmoji}>{emoji}</Text>
      <Text style={styles.headerBtnLabel}>{label}</Text>
    </Pressable>
  );
}

export default function DinoIslandView({ navigation }) {
  const { state } = useAppState();
  const theme = getTheme(state.islandTheme);

  const handleZonePress = (zone) => {
    if (zone.kind === 'tool') {
      navigation.navigate('NumberLab');
    } else {
      navigation.navigate('ZoneMission', { zoneId: zone.id });
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.kicker}>Welcome to</Text>
          <Text style={styles.title}>Dino Island</Text>
        </View>
        <View style={styles.headerActions}>
          <HeaderButton label="Trail Book" emoji="📖" onPress={() => navigation.navigate('TrailBook')} />
          <HeaderButton label="Grownups" emoji="🛠️" onPress={() => navigation.navigate('GrownupsCorner')} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lead}>Pick a place to explore and solve math missions.</Text>

        {islandZones.map((zone) => {
          const stat =
            zone.id === ZONE_IDS.NUMBER_LAB ? null : state.zoneStats[zone.id];
          const completed = stat ? stat.completed : 0;
          const percent = Math.min(100, (completed / MISSIONS_FOR_FULL) * 100);
          return (
            <IslandCard
              key={zone.id}
              zone={zone}
              completed={completed}
              progressPercent={percent}
              onPress={() => handleZonePress(zone)}
            />
          );
        })}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  titleWrap: {
    flexShrink: 1,
  },
  kicker: {
    ...typography.label,
    color: palette.muted,
  },
  title: {
    ...typography.display,
    color: palette.text,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerBtn: {
    alignItems: 'center',
    marginLeft: spacing.sm,
    backgroundColor: palette.white,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    width: 70,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  headerBtnEmoji: {
    fontSize: 22,
  },
  headerBtnLabel: {
    ...typography.caption,
    color: palette.text,
    marginTop: 2,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  lead: {
    ...typography.body,
    color: palette.text,
    marginBottom: spacing.md,
  },
});
