// Central color palette for Dino Island Math Adventure.
// Bright, soft and friendly — no harsh or "scary" tones.

export const palette = {
  jungle: '#7BC950',
  leaf: '#A8E063',
  sky: '#7EC8E3',
  river: '#5DADEC',
  volcano: '#FFB067',
  sand: '#F6E7B4',
  cream: '#FFF9E8',
  text: '#2F3A3D',
  softBrown: '#A87945',

  // Helper tones derived from the base palette.
  white: '#FFFFFF',
  shadow: 'rgba(47, 58, 61, 0.12)',
  correct: '#7BC950',
  wrong: '#FF8A80',
  muted: '#8A9499',
  trackBg: '#EAE2C6',
};

// Island themes selectable in the Grownups Corner.
// Each theme controls the overall background wash of the app.
export const islandThemes = {
  soft_jungle: {
    id: 'soft_jungle',
    label: 'Soft Jungle',
    background: '#EFF8E2',
    accent: palette.jungle,
  },
  sunny_volcano: {
    id: 'sunny_volcano',
    label: 'Sunny Volcano',
    background: '#FFF1E0',
    accent: palette.volcano,
  },
  calm_river: {
    id: 'calm_river',
    label: 'Calm River',
    background: '#E8F4FB',
    accent: palette.river,
  },
  blue_sky: {
    id: 'blue_sky',
    label: 'Blue Sky',
    background: '#E9F6FB',
    accent: palette.sky,
  },
};

export function getTheme(themeId) {
  return islandThemes[themeId] || islandThemes.soft_jungle;
}
