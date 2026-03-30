import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { deleteTracker, insertTracker } from './db';
import StackCard from './components/StackCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HEIGHT = 140;
const PEEK_HEIGHT = 52;

const STACK_TRANSFORMS = [
  { scale: 1.0,   translateY: 0, rotate: '0deg',   elevation: 6 },
  { scale: 0.985, translateY: 4, rotate: '0.3deg',  elevation: 4 },
  { scale: 0.970, translateY: 8, rotate: '-0.3deg', elevation: 2 },
];

const C = {
  bg: '#F7F3ED',
  surface: '#EDE8E0',
  ink: '#1C1917',
  inkMuted: '#78716C',
  border: '#D6CFC4',
};

const TYPE_OPTIONS = [
  { key: 'number', label: 'Number' },
  { key: 'monetary', label: 'Monetary' },
  { key: 'percentage', label: 'Percentage' },
];

export default function StackScreen({ trackers, onCardOpen, refreshTrackers }) {
  const [fabModalVisible, setFabModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('number');

  function handleAddTracker() {
    const name = newName.trim() || 'NEW TRACKER';
    insertTracker(name, newType);
    refreshTrackers();
    setNewName('');
    setNewType('number');
    setFabModalVisible(false);
  }

  function handleDeleteTracker(tracker) {
    Alert.alert(
      'Delete Tracker',
      `Remove "${tracker.name}" and all its actions?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTracker(tracker.id);
            refreshTrackers();
          },
        },
      ]
    );
  }

  const stackHeight =
    trackers.length > 0
      ? CARD_HEIGHT + (trackers.length - 1) * PEEK_HEIGHT
      : CARD_HEIGHT;

  return (
    <View style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {trackers.length === 0 ? (
          <Text style={styles.emptyText}>
            Tap + to create your first tracker
          </Text>
        ) : (
          <View style={[styles.stackContainer, { height: stackHeight }]}>
            {trackers.map((tracker, index) => {
              const transformIndex = Math.min(trackers.length - 1 - index, STACK_TRANSFORMS.length - 1);
              const t = STACK_TRANSFORMS[transformIndex];
              return (
                <View
                  key={tracker.id}
                  style={[
                    styles.cardWrapper,
                    {
                      height: CARD_HEIGHT,
                      top: index * PEEK_HEIGHT,
                      transform: [
                        { scale: t.scale },
                        { translateY: t.translateY },
                        { rotate: t.rotate },
                      ],
                      zIndex: index + 1,
                      elevation: t.elevation,
                    },
                  ]}
                >
                  <StackCard
                    tracker={tracker}
                    onPress={() => onCardOpen(tracker.id)}
                    onLongPress={() => handleDeleteTracker(tracker)}
                    style={{ height: CARD_HEIGHT }}
                    isPeeking={index < trackers.length - 1}
                  />
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.75 : 1 }]}
        onPress={() => setFabModalVisible(true)}
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>

      {/* New tracker modal */}
      <Modal
        visible={fabModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFabModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>New Tracker</Text>

            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. VACATION FUND"
              placeholderTextColor={C.inkMuted}
              value={newName}
              onChangeText={setNewName}
              autoCapitalize="characters"
              returnKeyType="done"
              onSubmitEditing={handleAddTracker}
              autoFocus
            />

            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Type</Text>
            <View style={styles.typeRow}>
              {TYPE_OPTIONS.map(({ key, label }) => (
                <Pressable
                  key={key}
                  style={[styles.typePill, newType === key && styles.typePillActive]}
                  onPress={() => setNewType(key)}
                >
                  <Text style={[styles.typePillText, newType === key && styles.typePillTextActive]}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => {
                  setNewName('');
                  setNewType('number');
                  setFabModalVisible(false);
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleAddTracker}>
                <Text style={styles.saveText}>Create</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollContent: {
    paddingTop: 32,
    paddingBottom: 120,
  },
  heading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: C.inkMuted,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: C.inkMuted,
    fontSize: 14,
    marginTop: 40,
    lineHeight: 22,
    paddingHorizontal: 24,
  },
  stackContainer: {
    position: 'relative',
    width: SCREEN_WIDTH,
  },
  cardWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 28,
    color: '#F7F3ED',
    lineHeight: 32,
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(28,25,23,0.4)',
  },
  modalSheet: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
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
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  typePill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    backgroundColor: C.surface,
  },
  typePillActive: {
    backgroundColor: C.ink,
    borderColor: C.ink,
  },
  typePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.inkMuted,
  },
  typePillTextActive: {
    color: '#F7F3ED',
  },
  modalActions: {
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
