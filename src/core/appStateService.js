// appStateService
// The single source of truth for persisted app data: settings + progress.
// Wraps AsyncStorage and exposes a React context (AppStateProvider /
// useAppState) so views can read state and dispatch actions reactively.
//
// Everything is stored locally on the device. No network, no accounts.

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_SETTINGS, sanitizeSettings } from './settingsService';
import { applyMissionResult } from './progressService';

const STORAGE_KEY = 'dino_island_state_v1';

// The full default state shape (settings + progress combined).
export const DEFAULT_STATE = {
  // settings
  learningLevel: DEFAULT_SETTINGS.learningLevel,
  numberLabMode: DEFAULT_SETTINGS.numberLabMode,
  soundEnabled: DEFAULT_SETTINGS.soundEnabled,
  hapticsEnabled: DEFAULT_SETTINGS.hapticsEnabled,
  islandTheme: DEFAULT_SETTINGS.islandTheme,
  // progress
  completedMissions: 0,
  totalCorrect: 0,
  totalWrong: 0,
  earnedBadges: [],
  zoneStats: {
    jungle: { completed: 0, correct: 0, wrong: 0 },
    volcano: { completed: 0, correct: 0, wrong: 0 },
    river: { completed: 0, correct: 0, wrong: 0 },
    sky: { completed: 0, correct: 0, wrong: 0 },
  },
  bestMissionScore: 0,
};

const DEFAULT_PROGRESS = {
  completedMissions: 0,
  totalCorrect: 0,
  totalWrong: 0,
  earnedBadges: [],
  zoneStats: {
    jungle: { completed: 0, correct: 0, wrong: 0 },
    volcano: { completed: 0, correct: 0, wrong: 0 },
    river: { completed: 0, correct: 0, wrong: 0 },
    sky: { completed: 0, correct: 0, wrong: 0 },
  },
  bestMissionScore: 0,
};

/* ------------------------------------------------------------------ */
/* low-level storage helpers                                          */
/* ------------------------------------------------------------------ */

function mergeWithDefaults(raw) {
  const settings = sanitizeSettings(raw);
  const zoneStats = { ...DEFAULT_STATE.zoneStats };
  if (raw && raw.zoneStats) {
    Object.keys(zoneStats).forEach((id) => {
      const s = raw.zoneStats[id];
      if (s && typeof s === 'object') {
        zoneStats[id] = {
          completed: Number(s.completed) || 0,
          correct: Number(s.correct) || 0,
          wrong: Number(s.wrong) || 0,
        };
      }
    });
  }
  return {
    ...settings,
    completedMissions: Number(raw?.completedMissions) || 0,
    totalCorrect: Number(raw?.totalCorrect) || 0,
    totalWrong: Number(raw?.totalWrong) || 0,
    earnedBadges: Array.isArray(raw?.earnedBadges) ? raw.earnedBadges : [],
    zoneStats,
    bestMissionScore: Number(raw?.bestMissionScore) || 0,
  };
}

export async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_STATE };
    }
    return mergeWithDefaults(JSON.parse(raw));
  } catch (e) {
    return { ...DEFAULT_STATE };
  }
}

export async function saveState(state) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // Storage failures are non-fatal — the app keeps working in memory.
  }
}

/* ------------------------------------------------------------------ */
/* React context                                                      */
/* ------------------------------------------------------------------ */

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [state, setState] = useState(DEFAULT_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadState().then((loaded) => {
      if (mounted) {
        setState(loaded);
        setReady(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const actions = useMemo(() => {
    const persist = (next) => {
      setState(next);
      saveState(next);
    };

    return {
      // Update one or more settings fields.
      updateSettings(patch) {
        const merged = sanitizeSettings({ ...state, ...patch });
        persist({ ...state, ...merged });
      },

      // Record a finished mission.
      recordMission(result) {
        const next = applyMissionResult(state, result);
        persist(next);
      },

      // Wipe progress but keep settings (Reset Trail Book).
      resetTrailBook() {
        persist({
          learningLevel: state.learningLevel,
          numberLabMode: state.numberLabMode,
          soundEnabled: state.soundEnabled,
          hapticsEnabled: state.hapticsEnabled,
          islandTheme: state.islandTheme,
          ...JSON.parse(JSON.stringify(DEFAULT_PROGRESS)),
        });
      },
    };
  }, [state]);

  const value = useMemo(() => ({ state, ready, actions }), [state, ready, actions]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used inside an AppStateProvider');
  }
  return ctx;
}
