import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { pastelForTracker } from '../pastelColors';

const C = {
  ink: '#1C1917',
  inkMuted: '#78716C',
};

export default function StackCard({ tracker, onPress, onLongPress, style }) {
  const value = tracker.value ?? 0;
  const absValue = Math.abs(value);
  const isNegative = value < 0;
  const formattedValue =
    (isNegative ? '−' : '') +
    '$' +
    absValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const bgColor = pastelForTracker(tracker);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.card, { backgroundColor: bgColor, opacity: pressed ? 0.85 : 1 }, style]}
    >
      <Text style={styles.name} numberOfLines={1}>
        {tracker.name || 'NEW TRACKER'}
      </Text>
      <Text style={[styles.value, isNegative && { color: '#DC2626' }]}>
        {formattedValue}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 0,
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28,25,23,0.08)',
  },
  name: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: C.inkMuted,
    marginBottom: 8,
  },
  value: {
    fontSize: 40,
    fontWeight: '300',
    color: C.ink,
    letterSpacing: -1.5,
  },
});
