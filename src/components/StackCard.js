import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const C = {
  bg: '#EDE8E0',
  ink: '#1C1917',
  inkMuted: '#78716C',
  accent: '#D6CFC4',
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

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.card, style, { opacity: pressed ? 0.85 : 1 }]}
    >
      {/* Left accent strip */}
      <View style={styles.accentStrip} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {tracker.name || 'NEW TRACKER'}
          </Text>
          <Text style={[styles.value, isNegative && { color: '#DC2626' }]}>
            {formattedValue}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.bg,
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  accentStrip: {
    width: 4,
    backgroundColor: C.accent,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: C.inkMuted,
  },
  value: {
    fontSize: 22,
    fontWeight: '600',
    color: C.ink,
    letterSpacing: -0.5,
  },
});
