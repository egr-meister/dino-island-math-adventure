// RootNavigator — a native stack tying every view together.
// Headers are hidden because each view renders its own friendly header.

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DinoIslandView from '../views/DinoIslandView';
import ZoneMissionView from '../views/ZoneMissionView';
import NumberLabView from '../views/NumberLabView';
import TrailBookView from '../views/TrailBookView';
import GrownupsCornerView from '../views/GrownupsCornerView';
import PrivacyNoteView from '../views/PrivacyNoteView';
import AppInfoView from '../views/AppInfoView';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="DinoIsland"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#FFF9E8' },
      }}
    >
      <Stack.Screen name="DinoIsland" component={DinoIslandView} />
      <Stack.Screen name="ZoneMission" component={ZoneMissionView} />
      <Stack.Screen name="NumberLab" component={NumberLabView} />
      <Stack.Screen name="TrailBook" component={TrailBookView} />
      <Stack.Screen name="GrownupsCorner" component={GrownupsCornerView} />
      <Stack.Screen name="PrivacyNote" component={PrivacyNoteView} />
      <Stack.Screen name="AppInfo" component={AppInfoView} />
    </Stack.Navigator>
  );
}
