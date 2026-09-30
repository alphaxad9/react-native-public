// src/navigation/AppNavigator.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ChatRoomScreen } from '../screens/chatting_screens/ChatRoomScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { useAppSelector, useAppDispatch } from '../hooks/typedHooks';
import { useCheckAuth } from '../apis/hooks';
import { setAuthCheckComplete } from '../store/authSlice';

// ── NEW IMPORT ──
import { usePresenceSocket } from '../websocket/presence_websocket/usePresenceSocket';

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007aff" />
    </View>
  );
}

export default function AppNavigator() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isCheckingAuth } = useAppSelector((state) => state.auth);
  const { data: user, isLoading, error } = useCheckAuth();

  // ── NEW: Connect/Disconnect Presence Socket based on Auth State ──
  // This ensures the socket lives for the entire authenticated session.
  usePresenceSocket(isAuthenticated);

  // Update auth state when checkAuth completes
  useEffect(() => {
    if (!isLoading && !isCheckingAuth) {
      dispatch(setAuthCheckComplete());
    }
  }, [isLoading, isCheckingAuth, dispatch]);

  // Show loading while checking auth
  if (isCheckingAuth || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});