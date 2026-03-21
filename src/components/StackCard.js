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

  const actionCount = tracker.action_count ?? 0;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.card, style, { opacity: pressed ? 0.85 : 1 }]}
    >
      {/* Left accent strip */}
      <View style={styles.accentStrip} />

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {tracker.name || 'NEW TRACKER'}
        </Text>
        <Text style={[styles.value, isNegative && { color: '#DC2626' }]}>
          {formattedValue}
        </Text>
        <Text style={styles.actionCount}>
          {actionCount === 1 ? '1 action' : `${actionCount} actions`}
        </Text>
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
    paddingVertical: 22,
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
    fontSize: 42,
    fontWeight: '300',
    color: C.ink,
    letterSpacing: -1.5,
    lineHeight: 48,
  },
  actionCount: {
    fontSize: 12,
    color: C.inkMuted,
    marginTop: 8,
    textAlign: 'right',
  },
});
