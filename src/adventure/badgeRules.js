// Safe, educational badges. No coins, chests, jackpots or spins — just
// friendly tokens that recognise effort on each trail.

import { ZONE_IDS } from './islandZones';

export const BADGES = {
  [ZONE_IDS.JUNGLE]: { id: 'dino_leaf', label: 'Dino Leaf Badge', emoji: '🍃' },
  [ZONE_IDS.VOLCANO]: { id: 'volcano_solver', label: 'Volcano Solver Badge', emoji: '🌋' },
  [ZONE_IDS.RIVER]: { id: 'river_thinker', label: 'River Thinker Badge', emoji: '🌊' },
  [ZONE_IDS.SKY]: { id: 'sky_shape', label: 'Sky Shape Badge', emoji: '⭐' },
};

// An extra badge for a strong jungle run with eggs.
export const EGG_HELPER_BADGE = { id: 'egg_helper', label: 'Egg Helper Badge', emoji: '🥚' };

export const ALL_BADGES = [
  BADGES[ZONE_IDS.JUNGLE],
  EGG_HELPER_BADGE,
  BADGES[ZONE_IDS.VOLCANO],
  BADGES[ZONE_IDS.RIVER],
  BADGES[ZONE_IDS.SKY],
];

// A badge is earned when at least 3 of 5 answers are correct.
// (Children should feel encouraged, not gated.)
const BADGE_THRESHOLD = 3;

export function evaluateBadge(zoneId, correctCount, totalQuestions) {
  if (correctCount < BADGE_THRESHOLD) {
    return null;
  }
  const base = BADGES[zoneId];
  if (!base) {
    return null;
  }
  // A perfect jungle run also earns the Egg Helper badge.
  if (zoneId === ZONE_IDS.JUNGLE && correctCount === totalQuestions) {
    return EGG_HELPER_BADGE;
  }
  return base;
}

export function getBadgeById(badgeId) {
  return ALL_BADGES.find((b) => b.id === badgeId) || null;
}
