import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const C = {
  bg: '#F7F3ED',
  surface: '#EDE8E0',
  ink: '#1C1917',
  inkMuted: '#78716C',
  border: '#D6CFC4',
  accentAdd: '#16A34A',
  accentSub: '#DC2626',
};

export default function ButtonModal({ visible, onSave, onCancel }) {
  const [label, setLabel] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [isAdd, setIsAdd] = useState(true);

  function handleSave() {
    const parsed = parseFloat(amountStr);
    if (!label.trim() || isNaN(parsed) || parsed <= 0) return;
    const amount = isAdd ? parsed : -parsed;
    onSave(label.trim(), amount);
    reset();
  }

  function handleCancel() {
    reset();
    onCancel();
  }

  function reset() {
    setLabel('');
    setAmountStr('');
    setIsAdd(true);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>New Action</Text>

          <Text style={styles.fieldLabel}>Label</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Solo Starbucks"
            placeholderTextColor={C.inkMuted}
            value={label}
            onChangeText={setLabel}
            returnKeyType="next"
          />

          <Text style={styles.fieldLabel}>Amount ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="4.50"
            placeholderTextColor={C.inkMuted}
            value={amountStr}
            onChangeText={setAmountStr}
            keyboardType="decimal-pad"
            returnKeyType="done"
          />

          <Text style={styles.fieldLabel}>Type</Text>
          <View style={styles.toggleRow}>
            <Pressable
              style={[
                styles.pill,
                isAdd && { backgroundColor: C.accentAdd, borderColor: C.accentAdd },
              ]}
              onPress={() => setIsAdd(true)}
            >
              <Text style={[styles.pillText, isAdd && { color: '#fff' }]}>Add</Text>
            </Pressable>
            <Pressable
              style={[
                styles.pill,
                !isAdd && { backgroundColor: C.accentSub, borderColor: C.accentSub },
              ]}
              onPress={() => setIsAdd(false)}
            >
              <Text style={[styles.pillText, !isAdd && { color: '#fff' }]}>Subtract</Text>
            </Pressable>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(28,25,23,0.4)',
  },
  sheet: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: C.ink,
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.inkMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: C.ink,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    backgroundColor: C.surface,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.inkMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 28,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    backgroundColor: C.surface,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.inkMuted,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: C.ink,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F7F3ED',
  },
});
