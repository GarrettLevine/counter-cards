import React, { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { initDB, getTrackers } from './src/db';
import StackScreen from './src/StackScreen';
import CardDetailScreen from './src/CardDetailScreen';

const C = {
  bg: '#F7F3ED',
  ink: '#1C1917',
  border: '#D6CFC4',
};

export default function App() {
  const [ready, setReady] = useState(false);
  const [trackers, setTrackers] = useState([]);
  const [openTrackerId, setOpenTrackerId] = useState(null);

  const refreshTrackers = useCallback(() => {
    setTrackers(getTrackers());
  }, []);

  useEffect(() => {
    initDB().then(() => {
      refreshTrackers();
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <SafeAreaProvider>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#1C1917" />
        </View>
      </SafeAreaProvider>
    );
  }

  const openTracker = openTrackerId !== null
    ? trackers.find(t => t.id === openTrackerId) ?? null
    : null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>MyCounters</Text>
        </View>
        <View style={styles.content}>
          <StackScreen
            trackers={trackers}
            onCardOpen={setOpenTrackerId}
            refreshTrackers={refreshTrackers}
          />
          {openTracker !== null && (
            <CardDetailScreen
              tracker={openTracker}
              onClose={() => {
                refreshTrackers();
                setOpenTrackerId(null);
              }}
              refreshTrackers={refreshTrackers}
            />
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.bg,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: C.ink,
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
  },
});
