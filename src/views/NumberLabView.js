// NumberLabView — the tool zone. Two friendly tools:
//   1. Friendly Calculator (Little Mode: + -, Explorer Mode: + - × ÷)
//   2. Number Builder (shows ways to build a number 1..20)
// The active Number Lab mode comes from settings (Grownups Corner).

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  appendDigit,
  appendOperator,
  clearExpression,
  deleteLast,
  calculateResult,
  buildNumberWays,
  FRIENDLY_ERROR,
} from '../core/calculatorCore';
import { getLabMode } from '../core/settingsService';
import { useAppState } from '../core/appStateService';
import { getTheme, palette } from '../theme/palette';
import { spacing, radius, shadow } from '../theme/layout';
import { typography } from '../theme/typography';
import DinoButton from '../ui/DinoButton';
import SoftPanel from '../ui/SoftPanel';

function Tab({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tab, active && styles.tabActive]}
      accessibilityRole="button"
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

/* ----------------------- Friendly Calculator ----------------------- */

function CalcKey({ label, onPress, kind = 'digit', wide }) {
  const bg =
    kind === 'op' ? palette.volcano : kind === 'action' ? palette.sand : palette.white;
  const color = kind === 'op' ? palette.white : palette.text;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.key,
        shadow.soft,
        { backgroundColor: bg },
        wide && styles.keyWide,
        pressed && styles.keyPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[styles.keyText, { color }]}>{label}</Text>
    </Pressable>
  );
}

function FriendlyCalculator({ mode }) {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const operators = mode === 'little' ? ['+', '-'] : ['+', '-', '×', '÷'];

  const onDigit = (d) => {
    setError(null);
    setResult(null);
    setExpression((e) => appendDigit(e, d));
  };
  const onOp = (op) => {
    setError(null);
    setResult(null);
    setExpression((e) => appendOperator(e, op, mode));
  };
  const onClear = () => {
    setExpression(clearExpression());
    setResult(null);
    setError(null);
  };
  const onBack = () => {
    setError(null);
    setResult(null);
    setExpression((e) => deleteLast(e));
  };
  const onEquals = () => {
    if (!expression) return;
    const r = calculateResult(expression);
    if (r.ok) {
      setResult(r.value);
      setError(null);
    } else {
      setResult(null);
      setError(r.error || FRIENDLY_ERROR);
    }
  };

  return (
    <View>
      <SoftPanel color={palette.cream} style={styles.display}>
        <Text style={styles.expression} numberOfLines={1}>
          {expression || '0'}
        </Text>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <Text style={styles.resultText}>{result !== null ? `= ${result}` : ' '}</Text>
        )}
      </SoftPanel>

      <View style={styles.opsRow}>
        {operators.map((op) => (
          <CalcKey key={op} label={op} kind="op" onPress={() => onOp(op)} />
        ))}
      </View>

      <View style={styles.keypad}>
        {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map((d) => (
          <CalcKey key={d} label={d} onPress={() => onDigit(d)} />
        ))}
        <CalcKey label="⌫" kind="action" onPress={onBack} />
        <CalcKey label="0" onPress={() => onDigit('0')} />
        <CalcKey label="C" kind="action" onPress={onClear} />
      </View>

      <DinoButton label="=  Show answer" color={palette.jungle} variant="primary" onPress={onEquals} style={{ marginTop: spacing.md }} />
      <Text style={styles.modeNote}>
        {mode === 'little' ? 'Little Mode: add and subtract' : 'Explorer Mode: add, subtract, multiply, divide'}
      </Text>
    </View>
  );
}

/* ----------------------- Number Builder ----------------------- */

function NumberBuilder({ mode }) {
  const [target, setTarget] = useState(8);
  const ways = buildNumberWays(target, mode);

  const numbers = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <View>
      <Text style={styles.builderLead}>Pick a number and see how to build it.</Text>

      <View style={styles.numberGrid}>
        {numbers.map((n) => {
          const active = n === target;
          return (
            <Pressable
              key={n}
              onPress={() => setTarget(n)}
              style={[styles.numberChip, active && styles.numberChipActive]}
              accessibilityRole="button"
              accessibilityLabel={`Build the number ${n}`}
            >
              <Text style={[styles.numberChipText, active && styles.numberChipTextActive]}>{n}</Text>
            </Pressable>
          );
        })}
      </View>

      <SoftPanel color={palette.white} style={styles.waysPanel}>
        <Text style={styles.waysTitle}>Ways to build {target}</Text>
        {ways.length === 0 ? (
          <Text style={styles.wayText}>Pick a number from 1 to 20.</Text>
        ) : (
          ways.map((w) => (
            <Text key={w} style={styles.wayText}>
              • {w}
            </Text>
          ))
        )}
        <Text style={styles.modeNote}>
          {mode === 'little'
            ? 'Little Mode shows adding and subtracting.'
            : 'Explorer Mode can also show multiplying.'}
        </Text>
      </SoftPanel>
    </View>
  );
}

/* ----------------------- screen ----------------------- */

export default function NumberLabView({ navigation }) {
  const { state } = useAppState();
  const theme = getTheme(state.islandTheme);
  const labMode = getLabMode(state.numberLabMode).id;
  const [tab, setTab] = useState('calculator');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <DinoButton label="← Map" variant="ghost" onPress={() => navigation.goBack()} style={styles.backBtn} textStyle={styles.backText} />
        <Text style={styles.headerTitle}>Number Lab</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.tabs}>
        <Tab label="Friendly Calculator" active={tab === 'calculator'} onPress={() => setTab('calculator')} />
        <Tab label="Number Builder" active={tab === 'builder'} onPress={() => setTab('builder')} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {tab === 'calculator' ? (
          <FriendlyCalculator mode={labMode} />
        ) : (
          <NumberBuilder mode={labMode} />
        )}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const KEY_SIZE = '30%';

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
    color: palette.text,
  },
  backBtn: {
    minHeight: 40,
    width: 88,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  backText: { ...typography.label },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    backgroundColor: palette.white,
  },
  tabActive: {
    backgroundColor: palette.softBrown,
  },
  tabText: {
    ...typography.label,
    color: palette.text,
  },
  tabTextActive: {
    color: palette.white,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },

  // calculator
  display: {
    marginBottom: spacing.md,
    minHeight: 96,
    justifyContent: 'center',
  },
  expression: {
    ...typography.numeric,
    color: palette.text,
    textAlign: 'right',
  },
  resultText: {
    ...typography.heading,
    color: palette.jungle,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.bodyStrong,
    color: palette.wrong,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  opsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  key: {
    width: KEY_SIZE,
    aspectRatio: 1.6,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  keyWide: {
    width: '64%',
  },
  keyPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  keyText: {
    ...typography.title,
  },
  modeNote: {
    ...typography.caption,
    color: palette.muted,
    marginTop: spacing.md,
    textAlign: 'center',
  },

  // number builder
  builderLead: {
    ...typography.body,
    color: palette.text,
    marginBottom: spacing.md,
  },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  numberChip: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadow.soft,
  },
  numberChipActive: {
    backgroundColor: palette.river,
  },
  numberChipText: {
    ...typography.bodyStrong,
    color: palette.text,
  },
  numberChipTextActive: {
    color: palette.white,
  },
  waysPanel: {},
  waysTitle: {
    ...typography.heading,
    color: palette.text,
    marginBottom: spacing.sm,
  },
  wayText: {
    ...typography.body,
    color: palette.text,
    marginBottom: spacing.xs,
  },
});
