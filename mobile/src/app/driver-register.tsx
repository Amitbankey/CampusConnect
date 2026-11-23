
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

const vehicleOptions = [
  { label: 'Auto Rickshaw', value: 'AUTO' },
  { label: 'Cab (Sedan / Hatchback / SUV)', value: 'CAB' },
] as const;

export default function DriverRegister() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [license, setLicense] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<'AUTO' | 'CAB'>('AUTO');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !license.trim() ||
      !vehicleNumber.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert('Missing Details', 'Please fill in all fields.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      Alert.alert('Invalid Phone', 'Enter a valid 10-digit phone number.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must have at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Your passwords do not match.');
      return;
    }

    Alert.alert(
      'Registration Details Validated',
      'Your driver details are ready. Driver account creation and document verification will be connected to our backend next.',
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
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back to Login</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>CC</Text>
            </View>
            <Text style={styles.brand}>CampusConnect</Text>
            <Text style={styles.tagline}>
              Join as a verified campus driver
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Driver Registration</Text>
            <Text style={styles.subtitle}>
              Enter your details to register as a driver.
            </Text>

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
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

            <Text style={styles.label}>Driving Licence Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter driving licence number"
              placeholderTextColor="#94A3B8"
              value={license}
              onChangeText={setLicense}
              autoCapitalize="characters"
            />

            <Text style={styles.label}>Vehicle Registration Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Example: UP16AB1234"
              placeholderTextColor="#94A3B8"
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
              autoCapitalize="characters"
            />

            <Text style={styles.label}>Vehicle Type</Text>

            <View style={styles.vehicleContainer}>
              {vehicleOptions.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.vehicleButton,
                    vehicleType === item.value && styles.selectedVehicle,
                  ]}
                  onPress={() => setVehicleType(item.value)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.vehicleText,
                      vehicleType === item.value &&
                        styles.selectedVehicleText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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
                Create Driver Account
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
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: '#F3F7FC' },
  container: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingVertical: 20,
  },
  backButton: { alignSelf: 'flex-start', paddingVertical: 10 },
  backText: { color: '#1769AA', fontSize: 15, fontWeight: '600' },
  header: { alignItems: 'center', marginVertical: 20 },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: '#1769AA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: { color: '#FFFFFF', fontSize: 23, fontWeight: 'bold' },
  brand: { color: '#102B50', fontSize: 26, fontWeight: 'bold' },
  tagline: { color: '#64748B', fontSize: 14, marginTop: 5 },
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
  title: { color: '#102B50', fontSize: 24, fontWeight: 'bold' },
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
  vehicleContainer: { gap: 10 },
  vehicleButton: {
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    alignItems: 'center',
  },
  selectedVehicle: {
    backgroundColor: '#E7F2FF',
    borderColor: '#1769AA',
  },
  vehicleText: {
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedVehicleText: { color: '#1769AA' },
  passwordContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: { flex: 1, color: '#102B50', fontSize: 14 },
  showText: { color: '#1769AA', fontWeight: '600' },
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
  loginText: { color: '#64748B', fontSize: 13 },
  loginLink: { color: '#1769AA', fontWeight: 'bold', fontSize: 13 },
  footer: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 25,
  },
});
