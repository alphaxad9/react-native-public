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
import { useRegister } from '../apis/hooks';
import { useAppSelector } from '../hooks/typedHooks';
import { authStyles } from './styles';

export const RegisterScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const registerMutation = useRegister();
  const { isLoading, isAuthenticated, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      Alert.alert('Success', 'Account created successfully!');
      navigation.replace('Home');
    }
  }, [isAuthenticated, navigation]);

  useEffect(() => {
    if (error) {
      Alert.alert('Registration Failed', error);
    }
  }, [error]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.password2) {
      newErrors.password2 = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await registerMutation.mutateAsync(formData);
      // Navigation will happen via useEffect when isAuthenticated becomes true
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={authStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={authStyles.scrollContainer}>
        <View style={authStyles.formContainer}>
          <Text style={authStyles.title}>Create Account</Text>
          <Text style={authStyles.subtitle}>Sign up to get started</Text>

          <View style={authStyles.inputContainer}>
            <Text style={authStyles.label}>Username</Text>
            <TextInput
              style={[authStyles.input, errors.username && authStyles.inputError]}
              placeholder="Choose a username"
              placeholderTextColor="#666666"
              value={formData.username}
              onChangeText={(text) => {
                setFormData({ ...formData, username: text });
                setErrors({ ...errors, username: '' });
              }}
              autoCapitalize="none"
              editable={!isLoading}
            />
            {errors.username && <Text style={authStyles.errorText}>{errors.username}</Text>}
          </View>

          <View style={authStyles.inputContainer}>
            <Text style={authStyles.label}>Email</Text>
            <TextInput
              style={[authStyles.input, errors.email && authStyles.inputError]}
              placeholder="Enter your email"
              placeholderTextColor="#666666"
              value={formData.email}
              onChangeText={(text) => {
                setFormData({ ...formData, email: text });
                setErrors({ ...errors, email: '' });
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
            {errors.email && <Text style={authStyles.errorText}>{errors.email}</Text>}
          </View>

          <View style={authStyles.inputContainer}>
            <Text style={authStyles.label}>Password</Text>
            <TextInput
              style={[authStyles.input, errors.password && authStyles.inputError]}
              placeholder="Create a password"
              placeholderTextColor="#666666"
              value={formData.password}
              onChangeText={(text) => {
                setFormData({ ...formData, password: text });
                setErrors({ ...errors, password: '' });
              }}
              secureTextEntry
              editable={!isLoading}
            />
            {errors.password && <Text style={authStyles.errorText}>{errors.password}</Text>}
          </View>

          <View style={authStyles.inputContainer}>
            <Text style={authStyles.label}>Confirm Password</Text>
            <TextInput
              style={[authStyles.input, errors.password2 && authStyles.inputError]}
              placeholder="Confirm your password"
              placeholderTextColor="#666666"
              value={formData.password2}
              onChangeText={(text) => {
                setFormData({ ...formData, password2: text });
                setErrors({ ...errors, password2: '' });
              }}
              secureTextEntry
              editable={!isLoading}
            />
            {errors.password2 && <Text style={authStyles.errorText}>{errors.password2}</Text>}
          </View>

          <TouchableOpacity
            style={[authStyles.registerButton, isLoading && authStyles.disabledButton]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={authStyles.registerButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={authStyles.loginLink}
            onPress={() => navigation.navigate('Login')}
            disabled={isLoading}
          >
            <Text style={authStyles.loginLinkText}>
              Already have an account? <Text style={authStyles.loginLinkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};