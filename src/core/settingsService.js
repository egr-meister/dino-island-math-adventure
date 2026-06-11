// Settings model + helpers. Pure logic only — persistence lives in
// appStateService. These helpers translate child-friendly setting choices
// into concrete rules used by the task factory and the Number Lab.

export const LEARNING_LEVELS = {
  little_explorer: {
    id: 'little_explorer',
    label: 'Little Explorer',
    hint: 'Simple tasks up to 10',
    maxNumber: 10,
    allowMultiplication: false,
    allowDivision: false,
  },
  brave_explorer: {
    id: 'brave_explorer',
    label: 'Brave Explorer',
    hint: 'Tasks up to 20',
    maxNumber: 20,
    allowMultiplication: true,
    allowDivision: false,
  },
  super_explorer: {
    id: 'super_explorer',
    label: 'Super Explorer',
    hint: 'Up to 50, with simple × and ÷',
    maxNumber: 50,
    allowMultiplication: true,
    allowDivision: true,
  },
};

export const NUMBER_LAB_MODES = {
  little: { id: 'little', label: 'Little Mode', operators: ['+', '-'] },
  explorer: { id: 'explorer', label: 'Explorer Mode', operators: ['+', '-', '×', '÷'] },
};

export const DEFAULT_SETTINGS = {
  learningLevel: 'little_explorer',
  numberLabMode: 'little',
  soundEnabled: true,
  hapticsEnabled: true,
  islandTheme: 'soft_jungle',
};

export function getLevelConfig(learningLevel) {
  return LEARNING_LEVELS[learningLevel] || LEARNING_LEVELS.little_explorer;
}

export function getLabMode(numberLabMode) {
  return NUMBER_LAB_MODES[numberLabMode] || NUMBER_LAB_MODES.little;
}

// Keep only known settings keys with valid values when loading from storage.
export function sanitizeSettings(raw = {}) {
  return {
    learningLevel: LEARNING_LEVELS[raw.learningLevel]
      ? raw.learningLevel
      : DEFAULT_SETTINGS.learningLevel,
    numberLabMode: NUMBER_LAB_MODES[raw.numberLabMode]
      ? raw.numberLabMode
      : DEFAULT_SETTINGS.numberLabMode,
    soundEnabled:
      typeof raw.soundEnabled === 'boolean' ? raw.soundEnabled : DEFAULT_SETTINGS.soundEnabled,
    hapticsEnabled:
      typeof raw.hapticsEnabled === 'boolean'
        ? raw.hapticsEnabled
        : DEFAULT_SETTINGS.hapticsEnabled,
    islandTheme: raw.islandTheme || DEFAULT_SETTINGS.islandTheme,
  };
}
