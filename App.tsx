// App.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { InspectionProvider } from './native_assignment/context/InspectionContext';
import AppNavigator from './native_assignment/navigation/AppNavigator';

export default function App() {
  return (
    <InspectionProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </InspectionProvider>
  );
}