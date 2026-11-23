
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [role, setRole] = useState<'Student' | 'Driver'>('Student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Please enter your email and password.');
      return;
    }

    Alert.alert(
      'CampusConnect',
      'Login screen is working! Authentication will be connected to our backend next.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoIcon}>CC</Text>
            </View>

            <Text style={styles.brand}>CampusConnect</Text>
            <Text style={styles.tagline}>
              Your Campus. Your Community.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.heading}>Welcome back!</Text>
            <Text style={styles.subtitle}>
              Sign in to continue your journey.
            </Text>

            <Text style={styles.label}>I am a</Text>

            <View style={styles.roleContainer}>
              {(['Student', 'Driver'] as const).map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.roleButton,
                    role === item && styles.selectedRole,
                  ]}
                  onPress={() => setRole(item)}
                >
                  <Text
                    style={[
                      styles.roleText,
                      role === item && styles.selectedRoleText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>
              {role === 'Student' ? 'College Email / Student ID' : 'Email / Driver ID'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your email or ID"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Password</Text>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />

              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.showText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotButton}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    'Registration',
                    'Student and driver registration will be added next.'
                  )
                }
              >
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footer}>
            Connecting campus communities, one ride at a time.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F7FC',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#1769AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoIcon: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: 'bold',
  },
  brand: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#102B50',
  },
  tagline: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 23,
    elevation: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  heading: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#102B50',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 7,
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 9,
    marginTop: 13,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  selectedRole: {
    backgroundColor: '#E7F2FF',
    borderColor: '#1769AA',
  },
  roleText: {
    color: '#64748B',
    fontWeight: '600',
  },
  selectedRoleText: {
    color: '#1769AA',
  },
  input: {
    height: 51,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 11,
    paddingHorizontal: 14,
    color: '#102B50',
    fontSize: 14,
  },
  passwordContainer: {
    height: 51,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    color: '#102B50',
    fontSize: 14,
  },
  showText: {
    color: '#1769AA',
    fontWeight: '600',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 13,
  },
  forgotText: {
    color: '#1769AA',
    fontSize: 13,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#1769AA',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 23,
    flexWrap: 'wrap',
  },
  registerText: {
    color: '#64748B',
    fontSize: 13,
  },
  registerLink: {
    color: '#1769AA',
    fontWeight: 'bold',
    fontSize: 13,
  },
  footer: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 25,
  },
});
