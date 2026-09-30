// native_assignment/navigation/RecordsStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RecordsStackParamList } from '../types/navigation';

import RecordsScreen from '../screens/RecordsScreen';
import InspectionDetailsScreen from '../screens/InspectionDetailsScreen';
const Stack = createNativeStackNavigator<RecordsStackParamList>();

export default function RecordsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#1F2937',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen 
        name="RecordsList" 
        component={RecordsScreen} 
        options={{ title: 'Inspection Records' }} 
      />
      <Stack.Screen 
        name="InspectionDetails" 
        component={InspectionDetailsScreen} 
        options={{ title: 'Inspection Details' }} 
      />
    </Stack.Navigator>
  );
}