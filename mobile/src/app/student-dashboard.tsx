
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function StudentDashboard() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>CampusConnect</Text>
        <Text style={styles.subtitle}>Student Dashboard</Text>
      </View>

      <View style={styles.welcomeCard}>
        <Text style={styles.welcome}>Welcome, Student!</Text>
        <Text style={styles.description}>
          Your campus. Your community. Your journey.
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        {/* Find a Ride */}
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={() => router.push('/find-ride')}
        >
          <Text style={styles.actionTitle}>Find a Ride</Text>
          <Text style={styles.actionDescription}>
            Search for available campus rides.
          </Text>
        </TouchableOpacity>

        {/* My Bookings */}
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={() => router.push('/my-bookings')}
        >
          <Text style={styles.actionTitle}>My Bookings</Text>
          <Text style={styles.actionDescription}>
            View your ride bookings and history.
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F7FC',
  },

  header: {
    paddingHorizontal: 22,
    paddingVertical: 20,
  },

  brand: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#102B50',
  },

  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 5,
  },

  welcomeCard: {
    backgroundColor: '#1769AA',
    marginHorizontal: 22,
    padding: 23,
    borderRadius: 18,
  },

  welcome: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },

  description: {
    color: '#E7F2FF',
    fontSize: 14,
    marginTop: 8,
  },

  content: {
    padding: 22,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#102B50',
    marginBottom: 15,
  },

  actionCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 14,
    marginBottom: 14,
    elevation: 2,
  },

  actionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1769AA',
  },

  actionDescription: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
  },
});
