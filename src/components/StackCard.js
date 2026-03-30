import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { pastelForTracker } from '../pastelColors';
import { formatValue } from '../formatValue';

const C = {
  ink: '#1C1917',
  inkMuted: '#78716C',
};

export default function StackCard({ tracker, onPress, onLongPress, style, isPeeking }) {
  const value = tracker.value ?? 0;
  const isNegative = value < 0;
  const formattedValue = formatValue(value, tracker.type);

  const bgColor = pastelForTracker(tracker);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.card, { backgroundColor: bgColor, opacity: pressed ? 0.85 : 1 }, style]}
    >
      <View style={styles.topRow}>
        <Text style={styles.name} numberOfLines={1}>
          {tracker.name || 'NEW TRACKER'}
        </Text>
        {isPeeking && (
          <Text style={[styles.peekValue, isNegative && { color: '#DC2626' }]}>
            {formattedValue}
          </Text>
        )}
      </View>
      {!isPeeking && (
        <Text style={[styles.value, isNegative && { color: '#DC2626' }]}>
          {formattedValue}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 0,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28,25,23,0.08)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: C.inkMuted,
  },
  peekValue: {
    fontSize: 16,
    fontWeight: '500',
    color: C.ink,
    letterSpacing: -0.5,
  },
  value: {
    fontSize: 40,
    fontWeight: '300',
    color: C.ink,
    letterSpacing: -1.5,
    marginTop: 8,
  },
});
