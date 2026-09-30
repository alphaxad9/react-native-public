import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { client } from '../apis/client';
import { login } from '../apis/apis';
import { useAppSelector } from '../hooks/typedHooks';

export default function DebugScreen() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user, isCheckingAuth } = useAppSelector((state) => state.auth);

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await login({
        identifier: 'brocode@gmail.com',
        password: '2025New+!'
      });
      setResult({ success: true, data: response });
      console.log('Login response:', response);
    } catch (error: any) {
      setResult({ success: false, error: error.message });
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testCheckAuth = async () => {
    setLoading(true);
    try {
      const response = await client.get('zedvye_one/users/check-auth/');
      setResult({ success: true, data: response.data });
      console.log('Check auth response:', response.data);
    } catch (error: any) {
      setResult({ success: false, error: error.message });
      console.error('Check auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testLogout = async () => {
    setLoading(true);
    try {
      const response = await client.post('zedvye_one/users/logout/');
      setResult({ success: true, data: response.data });
      console.log('Logout response:', response.data);
    } catch (error: any) {
      setResult({ success: false, error: error.message });
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Debug Screen</Text>
        
        <View style={styles.authState}>
          <Text style={styles.label}>Auth State:</Text>
          <Text>isAuthenticated: {isAuthenticated ? 'Yes' : 'No'}</Text>
          <Text>isCheckingAuth: {isCheckingAuth ? 'Yes' : 'No'}</Text>
          {user && (
            <>
              <Text>User: {user.username}</Text>
              <Text>Email: {user.email}</Text>
            </>
          )}
        </View>

        <View style={styles.buttonGroup}>
          <Button title="Test Login" onPress={testLogin} disabled={loading} />
          <Button title="Test Check Auth" onPress={testCheckAuth} disabled={loading} />
          <Button title="Test Logout" onPress={testLogout} disabled={loading} />
        </View>

        {loading && <ActivityIndicator size="large" style={styles.loader} />}

        {result && (
          <View style={styles.result}>
            <Text style={styles.resultTitle}>Result:</Text>
            <Text style={result.success ? styles.success : styles.error}>
              {result.success ? 'Success!' : 'Failed!'}
            </Text>
            <Text style={styles.resultData}>
              {JSON.stringify(result.data || result.error, null, 2)}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  authState: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonGroup: {
    gap: 10,
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  result: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  success: {
    color: 'green',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
  },
  resultData: {
    fontSize: 12,
    marginTop: 10,
    fontFamily: 'monospace',
  },
});