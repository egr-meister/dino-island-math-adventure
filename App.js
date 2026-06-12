// App entry point for Dino Island Math Adventure.
// Wires up safe-area handling, persisted app state, and navigation.

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppStateProvider, useAppState } from './src/core/appStateService';
import RootNavigator from './src/navigation/RootNavigator';
import { getTheme, palette } from './src/theme/palette';

// Keep the navigator from flashing default colors before state loads.
function NavigationRoot() {
  const { state, ready } = useAppState();
  const theme = getTheme(state.islandTheme);

  if (!ready) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={palette.jungle} />
      </View>
    );
  }

  const navTheme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      ...DefaultTheme.colors,
      primary: palette.jungle,
      background: theme.background,
      card: palette.white,
      text: palette.text,
      border: palette.trackBg,
      notification: palette.volcano,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style="dark" />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <NavigationRoot />
      </AppStateProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
