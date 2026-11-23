
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function StudentRegister() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [collegeEmail, setCollegeEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = () => {
    if (
      !fullName.trim() ||
      !collegeEmail.trim() ||
      !studentId.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert('Missing Details', 'Please fill in all the fields.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(collegeEmail.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid college email.');
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Your passwords do not match.');
      return;
    }

    Alert.alert(
      'Registration Details Validated',
      'Your details are ready. Account creation and student verification will be connected to our backend next.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>← Back to Login</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>CC</Text>
            </View>

            <Text style={styles.brand}>CampusConnect</Text>
            <Text style={styles.tagline}>
              Join your campus community
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Student Registration</Text>
            <Text style={styles.subtitle}>
              Create your student account to get started.
            </Text>

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#94A3B8"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />

            <Text style={styles.label}>College Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your college email"
              placeholderTextColor="#94A3B8"
              value={collegeEmail}
              onChangeText={setCollegeEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Student ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your student ID"
              placeholderTextColor="#94A3B8"
              value={studentId}
              onChangeText={setStudentId}
              autoCapitalize="characters"
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit phone number"
              placeholderTextColor="#94A3B8"
              value={phone}
              onChangeText={(value) =>
                setPhone(value.replace(/\D/g, '').slice(0, 10))
              }
              keyboardType="phone-pad"
              maxLength={10}
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Create a password"
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

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              placeholderTextColor="#94A3B8"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              activeOpacity={0.8}
            >
              <Text style={styles.registerButtonText}>
                Create Student Account
              </Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.loginLink}>Login</Text>
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
  container: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingVertical: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
  },
  backText: {
    color: '#1769AA',
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: '#1769AA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: 'bold',
  },
  brand: {
    color: '#102B50',
    fontSize: 26,
    fontWeight: 'bold',
  },
  tagline: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  title: {
    color: '#102B50',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 7,
    marginBottom: 15,
  },
  label: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 13,
    color: '#102B50',
    fontSize: 14,
  },
  passwordContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
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
  registerButton: {
    height: 52,
    backgroundColor: '#1769AA',
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 27,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
    flexWrap: 'wrap',
  },
  loginText: {
    color: '#64748B',
    fontSize: 13,
  },
  loginLink: {
    color: '#1769AA',
    fontWeight: 'bold',
    fontSize: 13,
  },
  footer: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 25,
  },
});
