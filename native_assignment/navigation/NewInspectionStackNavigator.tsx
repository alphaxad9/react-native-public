// native_assignment/navigation/NewInspectionStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NewInspectionStackParamList } from '../types/navigation';

import NewInspectionScreen from '../screens/NewInspectionScreen';
import AddEvidenceScreen from '../screens/AddEvidenceScreen';
import ReviewInspectionScreen from '../screens/ReviewInspectionScreen';
import SaveSuccessScreen from '../screens/SaveSuccessScreen';

const Stack = createNativeStackNavigator<NewInspectionStackParamList>();

export default function NewInspectionStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NewInspectionForm" component={NewInspectionScreen} />
      <Stack.Screen name="AddEvidence" component={AddEvidenceScreen} />
      <Stack.Screen name="ReviewInspection" component={ReviewInspectionScreen} />
      <Stack.Screen name="SaveSuccess" component={SaveSuccessScreen} />
    </Stack.Navigator>
  );
}