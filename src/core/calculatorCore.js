// calculatorCore
// A small, SAFE arithmetic engine for the Friendly Calculator and the
// Number Builder tool inside the Number Lab.
//
// No `eval` and no `Function` constructor are used anywhere. Expressions are
// tokenized and evaluated by hand with a two-pass (×/÷ then +/-) algorithm.
//
// Operators use the friendly symbols "×" and "÷" in the UI. Internally we
// also accept "*" and "/".

export const FRIENDLY_ERROR = 'Oops! Try another number.';

const OPERATORS = ['+', '-', '×', '÷'];

/* ------------------------------------------------------------------ */
/* expression editing                                                 */
/* ------------------------------------------------------------------ */

function isOperator(ch) {
  return OPERATORS.includes(ch);
}

// Append a single digit (0-9). Prevents leading-zero numbers like "007".
export function appendDigit(expression, digit) {
  const d = String(digit);
  if (!/^[0-9]$/.test(d)) {
    return expression;
  }
  // Find the current number being typed (after the last operator).
  const lastOpIndex = Math.max(
    ...OPERATORS.map((op) => expression.lastIndexOf(op))
  );
  const current = expression.slice(lastOpIndex + 1);
  if (current === '0') {
    // Replace a lone leading zero.
    return expression.slice(0, lastOpIndex + 1) + d;
  }
  return expression + d;
}

// Append an operator. Mode controls which operators are allowed
// ('little' => + and - only, 'explorer' => + - × ÷).
export function appendOperator(expression, op, mode = 'explorer') {
  const allowed = mode === 'little' ? ['+', '-'] : OPERATORS;
  if (!allowed.includes(op)) {
    return expression;
  }
  if (expression.length === 0) {
    // Don't allow an expression to start with an operator.
    return expression;
  }
  const last = expression[expression.length - 1];
  if (isOperator(last)) {
    // Replace a trailing operator instead of stacking them.
    return expression.slice(0, -1) + op;
  }
  return expression + op;
}

export function clearExpression() {
  return '';
}

export function deleteLast(expression) {
  return expression.slice(0, -1);
}

/* ------------------------------------------------------------------ */
/* tokenizer + evaluator                                              */
/* ------------------------------------------------------------------ */

function tokenize(expression) {
  const tokens = [];
  let numberBuffer = '';

  for (const ch of expression) {
    if (/[0-9]/.test(ch)) {
      numberBuffer += ch;
    } else if (isOperator(ch) || ch === '*' || ch === '/') {
      if (numberBuffer === '') {
        return null; // operator with no preceding number
      }
      tokens.push(Number(numberBuffer));
      numberBuffer = '';
      tokens.push(ch === '*' ? '×' : ch === '/' ? '÷' : ch);
    } else {
      return null; // unexpected character
    }
  }

  if (numberBuffer === '') {
    return null; // trailing operator or empty
  }
  tokens.push(Number(numberBuffer));
  return tokens;
}

// Evaluate tokens. Returns { ok, value } or { ok:false, error }.
function evaluateTokens(tokens) {
  // Pass 1: handle × and ÷.
  const pass1 = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const t = tokens[i];
    if (t === '×' || t === '÷') {
      const left = pass1.pop();
      const right = tokens[i + 1];
      i += 1;
      if (typeof left !== 'number' || typeof right !== 'number') {
        return { ok: false };
      }
      if (t === '÷') {
        if (right === 0 || left % right !== 0) {
          // No division by zero and no remainder answers for kids.
          return { ok: false };
        }
        pass1.push(left / right);
      } else {
        pass1.push(left * right);
      }
    } else {
      pass1.push(t);
    }
  }

  // Pass 2: handle + and -.
  let result = pass1[0];
  if (typeof result !== 'number') {
    return { ok: false };
  }
  for (let i = 1; i < pass1.length; i += 2) {
    const op = pass1[i];
    const right = pass1[i + 1];
    if (typeof right !== 'number') {
      return { ok: false };
    }
    if (op === '+') result += right;
    else if (op === '-') result -= right;
    else return { ok: false };
  }

  return { ok: true, value: result };
}

// Calculate the result of an expression string.
// Returns { ok:true, value } or { ok:false, error: FRIENDLY_ERROR }.
export function calculateResult(expression) {
  const tokens = tokenize(expression);
  if (!tokens) {
    return { ok: false, error: FRIENDLY_ERROR };
  }
  const result = evaluateTokens(tokens);
  if (!result.ok || !Number.isFinite(result.value)) {
    return { ok: false, error: FRIENDLY_ERROR };
  }
  return { ok: true, value: result.value };
}

/* ------------------------------------------------------------------ */
/* Number Builder                                                     */
/* ------------------------------------------------------------------ */

// Show friendly ways to "build" a target number.
// mode 'little'   => addition & subtraction only
// mode 'explorer' => also includes a multiplication way when available
//
// buildNumberWays(8, 'explorer') ->
//   ["4 + 4 = 8", "5 + 3 = 8", "10 - 2 = 8", "2 × 4 = 8"]
export function buildNumberWays(target, mode = 'little') {
  const n = Math.floor(Number(target));
  if (!Number.isFinite(n) || n < 1 || n > 20) {
    return [];
  }

  const ways = [];

  // Addition: a balanced split and an off-balance split.
  const half = Math.floor(n / 2);
  if (half >= 1 && n - half >= 1) {
    ways.push(`${half} + ${n - half} = ${n}`);
  }
  if (n >= 4) {
    const a = Math.max(1, half - 1);
    const b = n - a;
    if (b >= 1 && `${a} + ${b} = ${n}` !== ways[0]) {
      ways.push(`${a} + ${b} = ${n}`);
    }
  }

  // Subtraction: a near-by tens / bigger number minus a small one.
  const bigger = n + 2;
  if (bigger <= 22) {
    ways.push(`${bigger} - 2 = ${n}`);
  } else {
    ways.push(`${n + 1} - 1 = ${n}`);
  }

  // Multiplication: only in explorer mode, only when a clean factor exists.
  if (mode === 'explorer') {
    for (let f = 2; f <= Math.sqrt(n); f += 1) {
      if (n % f === 0) {
        ways.push(`${f} × ${n / f} = ${n}`);
        break;
      }
    }
  }

  // De-duplicate while keeping order.
  return Array.from(new Set(ways));
}
