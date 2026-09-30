import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useLogin } from '../apis/hooks';
import { useAppSelector } from '../hooks/typedHooks';
import { authStyles } from './styles';

export const LoginScreen = ({ navigation }: any) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLogin();
  const { isLoading, isAuthenticated, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('User authenticated, navigating to Home');
      navigation.replace('Home');
    }
  }, [isAuthenticated, navigation]);

  useEffect(() => {
    if (error) {
      Alert.alert('Login Failed', error);
    }
  }, [error]);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      console.log('Attempting login for:', identifier);
      await loginMutation.mutateAsync({ identifier, password });
      // Navigation will happen via useEffect when isAuthenticated becomes true
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={authStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={authStyles.scrollContainer}>
        <View style={authStyles.formContainer}>
          <Text style={authStyles.title}>Welcome Back</Text>
          <Text style={authStyles.subtitle}>Sign in to continue</Text>

          <View style={authStyles.inputContainer}>
            <Text style={authStyles.label}>Email or Username</Text>
            <TextInput
              style={authStyles.input}
              placeholder="Enter your email or username"
              placeholderTextColor="#666666"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!isLoading}
            />
          </View>

          <View style={authStyles.inputContainer}>
            <Text style={authStyles.label}>Password</Text>
            <TextInput
              style={authStyles.input}
              placeholder="Enter your password"
              placeholderTextColor="#666666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[authStyles.loginButton, isLoading && authStyles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={authStyles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={authStyles.registerLink}
            onPress={() => navigation.navigate('Register')}
            disabled={isLoading}
          >
            <Text style={authStyles.registerLinkText}>
              Don't have an account? <Text style={authStyles.registerLinkBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};