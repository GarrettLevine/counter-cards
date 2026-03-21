import React, { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { initDB, getTrackers } from './src/db';
import StackScreen from './src/StackScreen';
import CardDetailScreen from './src/CardDetailScreen';

const C = {
  bg: '#F7F3ED',
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
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1C1917" />
      </View>
    );
  }

  const openTracker = openTrackerId !== null
    ? trackers.find(t => t.id === openTrackerId) ?? null
    : null;

  return (
    <>
      <StatusBar style="dark" />
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
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
