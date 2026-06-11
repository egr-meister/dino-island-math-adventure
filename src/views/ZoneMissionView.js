// ZoneMissionView — runs one 5-question mission for a chosen zone, then
// shows the ResultBubble with stats and any earned badge.

import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { createMission, QUESTIONS_PER_MISSION } from '../adventure/missionEngine';
import { evaluateBadge } from '../adventure/badgeRules';
import { getZone } from '../adventure/islandZones';
import { useAppState } from '../core/appStateService';
import { computeSuccessRate, pickFriendlyMessage } from '../core/progressService';
import { getTheme, palette } from '../theme/palette';
import { spacing, radius } from '../theme/layout';
import { typography } from '../theme/typography';

import MissionChoice from '../ui/MissionChoice';
import ResultBubble from '../ui/ResultBubble';
import DinoButton from '../ui/DinoButton';
import SoftPanel from '../ui/SoftPanel';

function ScreenHeader({ title, onBack, color }) {
  return (
    <View style={styles.header}>
      <DinoButton label="← Map" variant="ghost" onPress={onBack} style={styles.backBtn} textStyle={styles.backText} />
      <Text style={[styles.headerTitle, { color }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.backBtn} />
    </View>
  );
}

export default function ZoneMissionView({ route, navigation }) {
  const { zoneId } = route.params;
  const { state, actions } = useAppState();
  const theme = getTheme(state.islandTheme);
  const zone = getZone(zoneId);

  // Build the mission once per mount (or when "play again" remounts via key).
  const [mission, setMission] = useState(() => createMission(zoneId, state.learningLevel));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [recorded, setRecorded] = useState(false);

  const question = mission.questions[index];

  const buzz = useCallback(
    (type) => {
      if (!state.hapticsEnabled) return;
      try {
        if (type === 'good') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      } catch (e) {
        // Haptics are optional; ignore failures.
      }
    },
    [state.hapticsEnabled]
  );

  const handleSelect = (choice) => {
    if (selected !== null) return; // already answered this question
    setSelected(choice);
    const isCorrect = choice === question.correctChoice;
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      buzz('good');
    } else {
      buzz('bad');
    }
  };

  const handleNext = () => {
    if (index + 1 < mission.questions.length) {
      setIndex((i) => i + 1);
      setSelected(null);
    } else {
      finishMission();
    }
  };

  const finishMission = () => {
    if (recorded) return;
    const wrong = QUESTIONS_PER_MISSION - correctCount;
    const badge = evaluateBadge(zoneId, correctCount, QUESTIONS_PER_MISSION);
    actions.recordMission({
      zoneId,
      correct: correctCount,
      wrong,
      score: correctCount,
      badgeId: badge ? badge.id : null,
    });
    setRecorded(true);
    setFinished(true);
  };

  const playAgain = () => {
    setMission(createMission(zoneId, state.learningLevel));
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setFinished(false);
    setRecorded(false);
  };

  const choiceState = (choice) => {
    if (selected === null) return 'idle';
    if (choice === question.correctChoice) return 'correct';
    if (choice === selected) return 'wrong';
    return 'muted';
  };

  /* ----------------------- result screen ----------------------- */
  if (finished) {
    const wrong = QUESTIONS_PER_MISSION - correctCount;
    const rate = computeSuccessRate(correctCount, wrong);
    const badge = evaluateBadge(zoneId, correctCount, QUESTIONS_PER_MISSION);
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
        <ScreenHeader title={mission.title} onBack={() => navigation.navigate('DinoIsland')} color={zone.color} />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ResultBubble
            correct={correctCount}
            wrong={wrong}
            successRate={rate}
            badge={badge}
            message={pickFriendlyMessage(rate)}
          />
          <View style={{ height: spacing.lg }} />
          <DinoButton label="Play this trail again" color={zone.color} variant="primary" onPress={playAgain} />
          <View style={{ height: spacing.sm }} />
          <DinoButton label="Back to the island" variant="soft" onPress={() => navigation.navigate('DinoIsland')} />
          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ----------------------- question screen --------------------- */
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <ScreenHeader title={mission.title} onBack={() => navigation.goBack()} color={zone.color} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.counter}>
          Question {index + 1} of {QUESTIONS_PER_MISSION}
        </Text>

        <SoftPanel color={palette.white} style={styles.promptPanel}>
          <Text style={styles.prompt}>{question.prompt}</Text>
        </SoftPanel>

        <View style={styles.choices}>
          {question.choices.map((choice, i) => (
            <MissionChoice
              key={`${question.id}_${i}`}
              index={i}
              value={choice}
              state={choiceState(choice)}
              disabled={selected !== null}
              onPress={() => handleSelect(choice)}
            />
          ))}
        </View>

        {selected !== null && (
          <SoftPanel color={palette.cream} style={styles.explainPanel}>
            <Text style={styles.explainTitle}>
              {selected === question.correctChoice ? 'Nice work! 🎉' : 'Good try!'}
            </Text>
            <Text style={styles.explainText}>{question.explanation}</Text>
          </SoftPanel>
        )}

        {selected !== null && (
          <DinoButton
            label={index + 1 < QUESTIONS_PER_MISSION ? 'Next question' : 'See my results'}
            color={zone.color}
            variant="primary"
            onPress={handleNext}
          />
        )}

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
  headerTitle: {
    ...typography.heading,
    flex: 1,
    textAlign: 'center',
  },
  backBtn: {
    minHeight: 40,
    width: 88,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  backText: {
    ...typography.label,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  counter: {
    ...typography.label,
    color: palette.muted,
    marginBottom: spacing.sm,
  },
  promptPanel: {
    marginBottom: spacing.lg,
  },
  prompt: {
    ...typography.heading,
    color: palette.text,
    lineHeight: 28,
  },
  choices: {
    marginBottom: spacing.sm,
  },
  explainPanel: {
    marginBottom: spacing.lg,
  },
  explainTitle: {
    ...typography.bodyStrong,
    color: palette.softBrown,
    marginBottom: spacing.xs,
  },
  explainText: {
    ...typography.body,
    color: palette.text,
  },
});
