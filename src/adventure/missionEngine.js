// missionEngine
// Builds a complete mission (5 questions) for a zone + learning level.
// Uses dinoTaskFactory for each task, shuffles the answer choices, and tries
// to avoid two identical prompts back-to-back within one mission.

import { createTask } from './dinoTaskFactory';
import { getLevelConfig } from '../core/settingsService';
import { getZone } from './islandZones';

export const QUESTIONS_PER_MISSION = 5;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.floor(Math.random() * 100000).toString(36)}`;
}

export function createMission(zoneId, learningLevel) {
  const levelConfig = getLevelConfig(learningLevel);
  const zone = getZone(zoneId);

  const questions = [];
  let lastPrompt = null;
  let safety = 0;

  while (questions.length < QUESTIONS_PER_MISSION && safety < 60) {
    safety += 1;
    const task = createTask(zoneId, levelConfig);

    // Avoid an immediate repeat of the exact same prompt.
    if (task.prompt === lastPrompt) {
      continue;
    }
    lastPrompt = task.prompt;

    questions.push({
      id: makeId('task'),
      prompt: task.prompt,
      choices: shuffle(task.choices),
      correctChoice: task.correctChoice,
      visualHint: task.visualHint,
      explanation: task.explanation,
    });
  }

  return {
    missionId: makeId('mission'),
    zoneId,
    title: zone ? zone.trailTitle : 'Dino Trail',
    questions,
  };
}
