
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

export default function DriverDashboard() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>CampusConnect</Text>
        <Text style={styles.subtitle}>Driver Dashboard</Text>
      </View>

      <View style={styles.welcomeCard}>
        <Text style={styles.welcome}>Welcome, Driver!</Text>
        <Text style={styles.description}>
          Manage your rides and help students travel safely.
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>Create a Ride</Text>
          <Text style={styles.actionDescription}>
            Publish a new ride for students.
          </Text>
        </View>

        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>Ride Requests</Text>
          <Text style={styles.actionDescription}>
            View and manage student booking requests.
          </Text>
        </View>

        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>My Rides</Text>
          <Text style={styles.actionDescription}>
            Manage your scheduled and completed rides.
          </Text>
        </View>
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
