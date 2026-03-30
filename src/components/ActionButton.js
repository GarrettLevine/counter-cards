import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { formatActionAmount } from '../formatValue';

const C = {
  surface: '#EDE8E0',
  ink: '#1C1917',
  inkMuted: '#78716C',
  accentAdd: '#16A34A',
  accentSub: '#DC2626',
};

export default function ActionButton({ label, amount, onPress, onLongPress, type }) {
  const isAdd = amount >= 0;
  const accent = isAdd ? C.accentAdd : C.accentSub;
  const formatted = formatActionAmount(amount, type);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.tile,
        { borderColor: accent, opacity: pressed ? 0.65 : 1 },
      ]}
    >
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
      <Text style={[styles.amount, { color: accent }]}>
        {formatted}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    margin: 6,
    padding: 14,
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    minHeight: 80,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    color: C.ink,
    fontWeight: '500',
    lineHeight: 17,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
  },
});
