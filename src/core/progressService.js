// progressService
// Pure functions for ranks, success rate, favorite zone, and folding a
// finished mission into the saved progress state. No storage here.

import { MISSION_ZONE_IDS, getZone } from '../adventure/islandZones';

export const RANKS = [
  { id: 'tiny_dino_starter', label: 'Tiny Dino Starter', min: 0, max: 10 },
  { id: 'leaf_counter', label: 'Leaf Counter', min: 11, max: 30 },
  { id: 'trail_explorer', label: 'Trail Explorer', min: 31, max: 60 },
  { id: 'dino_thinker', label: 'Dino Thinker', min: 61, max: 100 },
  { id: 'island_math_hero', label: 'Island Math Hero', min: 101, max: Infinity },
];

export function computeRank(totalCorrect) {
  const n = totalCorrect || 0;
  return (
    RANKS.find((r) => n >= r.min && n <= r.max) || RANKS[0]
  );
}

export function computeSuccessRate(correct, wrong) {
  const total = (correct || 0) + (wrong || 0);
  if (total === 0) {
    return 0;
  }
  return Math.round(((correct || 0) / total) * 100);
}

// Which mission zone has the most correct answers? Returns a friendly name.
export function favoriteZone(zoneStats) {
  if (!zoneStats) {
    return 'None yet';
  }
  let best = null;
  let bestCorrect = -1;
  MISSION_ZONE_IDS.forEach((id) => {
    const stat = zoneStats[id];
    if (stat && stat.correct > bestCorrect) {
      bestCorrect = stat.correct;
      best = id;
    }
  });
  if (!best || bestCorrect <= 0) {
    return 'None yet';
  }
  const zone = getZone(best);
  return zone ? zone.name : 'None yet';
}

// Fold a finished mission result into a fresh copy of the progress state.
// result: { zoneId, correct, wrong, score, badgeId }
export function applyMissionResult(state, result) {
  const next = JSON.parse(JSON.stringify(state));
  const { zoneId, correct, wrong, score, badgeId } = result;

  next.completedMissions = (next.completedMissions || 0) + 1;
  next.totalCorrect = (next.totalCorrect || 0) + correct;
  next.totalWrong = (next.totalWrong || 0) + wrong;
  next.bestMissionScore = Math.max(next.bestMissionScore || 0, score);

  if (!next.zoneStats[zoneId]) {
    next.zoneStats[zoneId] = { completed: 0, correct: 0, wrong: 0 };
  }
  const zs = next.zoneStats[zoneId];
  zs.completed += 1;
  zs.correct += correct;
  zs.wrong += wrong;

  if (badgeId && !next.earnedBadges.includes(badgeId)) {
    next.earnedBadges = [...next.earnedBadges, badgeId];
  }

  return next;
}

// Friendly closing messages shown on the result screen.
export const FRIENDLY_MESSAGES = [
  'Great exploring!',
  'Your dino brain is growing!',
  'You helped the island today!',
  'Try another trail when you are ready!',
];

export function pickFriendlyMessage(successRate) {
  if (successRate >= 80) return 'Your dino brain is growing!';
  if (successRate >= 60) return 'You helped the island today!';
  if (successRate >= 40) return 'Great exploring!';
  return 'Try another trail when you are ready!';
}
