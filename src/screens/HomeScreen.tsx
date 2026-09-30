// src/screens/HomeScreen.tsx - YOUR WORKING VERSION
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../hooks/typedHooks';
import { useLogout } from '../apis/hooks';

export const HomeScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    console.log('A');

    try {
      console.log('B');

      await logoutMutation.mutateAsync();

      console.log('C');
    } catch (e) {
      console.log('D', e);
    }
  };

  // Show loading indicator while logging out
  if (logoutMutation.isPending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007aff" />
        <Text style={styles.loadingText}>Logging out...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <Text style={styles.logoutText}>
            {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user?.username || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        {user?.first_name && (
          <Text style={styles.userFullName}>
            {user.first_name} {user.last_name}
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  userInfo: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 5,
  },
  userFullName: {
    fontSize: 14,
    color: '#999999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 12,
    color: '#ffffff',
    fontSize: 16,
  },
});