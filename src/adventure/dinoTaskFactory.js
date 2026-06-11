// dinoTaskFactory
// Generates one math task at a time for a given zone + level configuration.
//
// Guarantees enforced here:
//   * always exactly 3 distinct answer choices
//   * the correct answer is always among the choices
//   * no negative answers on simple levels
//   * no division with a remainder
//   * prompt text is varied so the same wording does not repeat constantly
//
// Each task: { prompt, choices: [a, b, c], correctChoice, visualHint, explanation }
// missionEngine is responsible for shuffling the choices.

import { ZONE_IDS } from './islandZones';

/* ------------------------------------------------------------------ */
/* small helpers                                                      */
/* ------------------------------------------------------------------ */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Build 3 numeric choices: the correct value + 2 unique, non-negative
// distractors that are reasonably close to the answer.
function numericChoices(correct, { min = 0, max = 99 } = {}) {
  const choices = new Set([correct]);
  let guard = 0;
  while (choices.size < 3 && guard < 50) {
    guard += 1;
    const delta = pick([-3, -2, -1, 1, 2, 3, 4]);
    const candidate = correct + delta;
    if (candidate >= min && candidate <= max && candidate !== correct) {
      choices.add(candidate);
    }
  }
  // Fallback in the rare case the loop could not find distractors.
  let extra = max;
  while (choices.size < 3) {
    if (extra !== correct && extra >= min) {
      choices.add(extra);
    }
    extra -= 1;
    if (extra < min) break;
  }
  return Array.from(choices);
}

/* ------------------------------------------------------------------ */
/* Jungle Counting — counting, addition & subtraction (no negatives)  */
/* ------------------------------------------------------------------ */

function makeJungleTask(level) {
  // Jungle stays gentle regardless of level: numbers 1..10.
  const cap = Math.min(level.maxNumber, 10);
  const type = pick(['add', 'sub', 'count']);

  if (type === 'add') {
    const a = randInt(1, Math.max(2, cap - 2));
    const b = randInt(1, Math.max(1, cap - a));
    const correct = a + b;
    const creature = pick(['baby dinos', 'tiny dinos', 'leaf bugs']);
    return {
      prompt: `${cap2(numberWord(a))} ${creature} are playing. ${numberWord(b)} more join them. How many ${creature} are playing now?`,
      choices: numericChoices(correct, { min: 0, max: 20 }),
      correctChoice: correct,
      visualHint: 'baby_dinos',
      explanation: `${a} + ${b} = ${correct}`,
    };
  }

  if (type === 'sub') {
    const total = randInt(3, cap);
    const gone = randInt(1, total - 1);
    const correct = total - gone;
    return {
      prompt: `There are ${total} dino eggs in a nest. ${gone} eggs hatch. How many eggs are left?`,
      choices: numericChoices(correct, { min: 0, max: 20 }),
      correctChoice: correct,
      visualHint: 'eggs',
      explanation: `${total} - ${gone} = ${correct}`,
    };
  }

  // count
  const leaves = randInt(2, cap);
  const more = randInt(1, Math.max(1, cap - leaves));
  const correct = leaves + more;
  return {
    prompt: `A little dino picks ${leaves} leaves, then finds ${more} more. How many leaves in all?`,
    choices: numericChoices(correct, { min: 0, max: 20 }),
    correctChoice: correct,
    visualHint: 'leaves',
    explanation: `${leaves} + ${more} = ${correct}`,
  };
}

/* ------------------------------------------------------------------ */
/* Volcano Numbers — add/sub up to cap + simple multiplication        */
/* ------------------------------------------------------------------ */

function makeVolcanoTask(level) {
  const cap = level.maxNumber;
  const types = ['add', 'sub'];
  if (level.allowMultiplication) types.push('mul', 'groups');
  const type = pick(types);

  if (type === 'add') {
    const a = randInt(2, Math.max(3, Math.floor(cap / 2)));
    const b = randInt(2, Math.max(3, cap - a));
    const correct = a + b;
    return {
      prompt: `A dino warms ${a} stones, then warms ${b} more by the volcano. How many warm stones now?`,
      choices: numericChoices(correct, { min: 0, max: cap + 10 }),
      correctChoice: correct,
      visualHint: 'stones',
      explanation: `${a} + ${b} = ${correct}`,
    };
  }

  if (type === 'sub') {
    const total = randInt(Math.floor(cap / 2), cap);
    const gone = randInt(1, total - 1);
    const correct = total - gone;
    return {
      prompt: `A dino finds ${total} warm stones and gives ${gone} to a friend. How many stones are left?`,
      choices: numericChoices(correct, { min: 0, max: cap + 10 }),
      correctChoice: correct,
      visualHint: 'stones',
      explanation: `${total} - ${gone} = ${correct}`,
    };
  }

  // multiplication / equal groups
  const rows = randInt(2, 4);
  const each = randInt(2, level.id === 'super_explorer' ? 6 : 4);
  const correct = rows * each;
  if (type === 'groups') {
    return {
      prompt: `There are ${each} lava rocks in each row. There are ${rows} rows. How many lava rocks are there?`,
      choices: numericChoices(correct, { min: 0, max: correct + 10 }),
      correctChoice: correct,
      visualHint: 'lava_rocks',
      explanation: `${rows} × ${each} = ${correct}`,
    };
  }
  return {
    prompt: `${rows} dino friends each carry ${each} warm stones. How many stones together?`,
    choices: numericChoices(correct, { min: 0, max: correct + 10 }),
    correctChoice: correct,
    visualHint: 'stones',
    explanation: `${rows} × ${each} = ${correct}`,
  };
}

/* ------------------------------------------------------------------ */
/* River Logic — compare, sequences, missing number, simple logic     */
/* ------------------------------------------------------------------ */

function makeRiverTask(level) {
  const cap = level.maxNumber;
  const type = pick(['bigger', 'smaller', 'sequence', 'missing']);

  if (type === 'bigger' || type === 'smaller') {
    const nums = new Set();
    while (nums.size < 3) nums.add(randInt(1, cap));
    const arr = Array.from(nums);
    const correct = type === 'bigger' ? Math.max(...arr) : Math.min(...arr);
    return {
      prompt: type === 'bigger' ? 'Which number is bigger?' : 'Which number is smaller?',
      choices: arr,
      correctChoice: correct,
      visualHint: 'compare',
      explanation:
        type === 'bigger'
          ? `${correct} is the biggest number here.`
          : `${correct} is the smallest number here.`,
    };
  }

  if (type === 'sequence') {
    const step = pick([1, 2, 2, 3, 5]);
    const start = randInt(1, Math.max(2, Math.floor(cap / 3)));
    const seq = [start, start + step, start + step * 2];
    const correct = start + step * 3;
    return {
      prompt: `What comes next? ${seq.join(', ')}, ?`,
      choices: numericChoices(correct, { min: 0, max: cap + 10 }),
      correctChoice: correct,
      visualHint: 'sequence',
      explanation: `The numbers go up by ${step}, so next is ${correct}.`,
    };
  }

  // missing number — "can carry" style logic puzzle
  const capacity = randInt(4, Math.min(cap, 10));
  const has = randInt(1, capacity - 1);
  const correct = capacity - has;
  return {
    prompt: `A dino can carry ${capacity} leaves. He already has ${has} leaves. How many more can he carry?`,
    choices: numericChoices(correct, { min: 0, max: 20 }),
    correctChoice: correct,
    visualHint: 'leaves',
    explanation: `${capacity} - ${has} = ${correct}`,
  };
}

/* ------------------------------------------------------------------ */
/* Sky Shapes — shapes, sides, patterns                               */
/* ------------------------------------------------------------------ */

const SHAPES = [
  { name: 'Circle', sides: 0 },
  { name: 'Triangle', sides: 3 },
  { name: 'Square', sides: 4 },
  { name: 'Rectangle', sides: 4 },
  { name: 'Star', sides: 5 },
];

function makeSkyTask() {
  const type = pick(['which_sides', 'count_sides', 'pattern']);

  if (type === 'which_sides') {
    const target = pick([
      { sides: 3, answer: 'Triangle' },
      { sides: 4, answer: 'Square' },
    ]);
    const wrong = SHAPES.filter((s) => s.name !== target.answer);
    const distractors = shuffleSmall(wrong).slice(0, 2).map((s) => s.name);
    return {
      prompt: `Which shape has ${target.sides} sides?`,
      choices: [target.answer, ...distractors],
      correctChoice: target.answer,
      visualHint: 'shape',
      explanation: `A ${target.answer.toLowerCase()} has ${target.sides} sides.`,
    };
  }

  if (type === 'count_sides') {
    const shape = pick([
      { name: 'square', sides: 4 },
      { name: 'triangle', sides: 3 },
      { name: 'rectangle', sides: 4 },
    ]);
    const correct = shape.sides;
    const distractors = [correct - 1, correct + 1].filter((n) => n >= 0);
    return {
      prompt: `How many sides does a ${shape.name} have?`,
      choices: [correct, ...distractors].slice(0, 3),
      correctChoice: correct,
      visualHint: 'shape',
      explanation: `A ${shape.name} has ${correct} sides.`,
    };
  }

  // simple AB pattern
  const a = pick(['Circle', 'Square', 'Triangle', 'Star']);
  let b = pick(['Circle', 'Square', 'Triangle', 'Star']);
  while (b === a) b = pick(['Circle', 'Square', 'Triangle', 'Star']);
  // pattern: a, b, a, b, ? -> a
  const correct = a;
  const others = ['Circle', 'Square', 'Triangle', 'Star'].filter((s) => s !== a);
  const distractor = pick(others);
  const distractor2 = pick(others.filter((s) => s !== distractor));
  return {
    prompt: `What comes next? ${a}, ${b}, ${a}, ${b}, ?`,
    choices: [correct, distractor, distractor2],
    correctChoice: correct,
    visualHint: 'pattern',
    explanation: `The pattern repeats ${a}, ${b}. Next is ${correct}.`,
  };
}

/* ------------------------------------------------------------------ */
/* word / formatting helpers                                          */
/* ------------------------------------------------------------------ */

const WORDS = ['zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

function numberWord(n) {
  return WORDS[n] || String(n);
}

function cap2(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function shuffleSmall(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ------------------------------------------------------------------ */
/* public factory                                                     */
/* ------------------------------------------------------------------ */

export function createTask(zoneId, levelConfig) {
  switch (zoneId) {
    case ZONE_IDS.JUNGLE:
      return makeJungleTask(levelConfig);
    case ZONE_IDS.VOLCANO:
      return makeVolcanoTask(levelConfig);
    case ZONE_IDS.RIVER:
      return makeRiverTask(levelConfig);
    case ZONE_IDS.SKY:
      return makeSkyTask(levelConfig);
    default:
      return makeJungleTask(levelConfig);
  }
}
