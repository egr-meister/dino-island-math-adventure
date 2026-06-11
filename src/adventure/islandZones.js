// Definition of every zone on Dino Island.
// The map (DinoIslandView) and the mission flow both read from here.

import { palette } from '../theme/palette';

export const ZONE_IDS = {
  JUNGLE: 'jungle',
  VOLCANO: 'volcano',
  RIVER: 'river',
  SKY: 'sky',
  NUMBER_LAB: 'number_lab',
};

// Mission zones (everything except the Number Lab, which is a tool zone).
export const MISSION_ZONE_IDS = [
  ZONE_IDS.JUNGLE,
  ZONE_IDS.VOLCANO,
  ZONE_IDS.RIVER,
  ZONE_IDS.SKY,
];

export const islandZones = [
  {
    id: ZONE_IDS.JUNGLE,
    name: 'Jungle Counting',
    description: 'Count leaves, eggs, and tiny dinos.',
    color: palette.jungle,
    soft: '#E4F4D2',
    icon: 'leaf',
    trailTitle: 'Jungle Counting Trail',
    kind: 'mission',
  },
  {
    id: ZONE_IDS.VOLCANO,
    name: 'Volcano Numbers',
    description: 'Solve warm number puzzles near the volcano.',
    color: palette.volcano,
    soft: '#FFE7CF',
    icon: 'volcano',
    trailTitle: 'Volcano Numbers Trail',
    kind: 'mission',
  },
  {
    id: ZONE_IDS.RIVER,
    name: 'River Logic',
    description: 'Help dinos cross the river with smart answers.',
    color: palette.river,
    soft: '#D6ECFA',
    icon: 'river',
    trailTitle: 'River Logic Trail',
    kind: 'mission',
  },
  {
    id: ZONE_IDS.SKY,
    name: 'Sky Shapes',
    description: 'Learn shapes and simple patterns with flying dinos.',
    color: palette.sky,
    soft: '#DCF0F7',
    icon: 'star',
    trailTitle: 'Sky Shapes Trail',
    kind: 'mission',
  },
  {
    id: ZONE_IDS.NUMBER_LAB,
    name: 'Number Lab',
    description: 'Use friendly tools to explore numbers.',
    color: palette.softBrown,
    soft: '#EFE0CC',
    icon: 'lab',
    kind: 'tool',
  },
];

export function getZone(zoneId) {
  return islandZones.find((z) => z.id === zoneId) || null;
}
