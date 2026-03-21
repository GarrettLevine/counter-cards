import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  PanResponder,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  deleteAction,
  getActionsForTracker,
  insertActionForTracker,
  updateTrackerName,
  updateTrackerValue,
} from './db';
import ActionButton from './components/ActionButton';
import ButtonModal from './components/ButtonModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const C = {
  bg: '#F7F3ED',
  surface: '#EDE8E0',
  ink: '#1C1917',
  inkMuted: '#78716C',
  border: '#D6CFC4',
  fab: '#1C1917',
};

export default function CardDetailScreen({ tracker, onClose, refreshTrackers }) {
  const [value, setValue] = useState(tracker.value);
  const [trackerName, setTrackerName] = useState(tracker.name || 'NEW TRACKER');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [actions, setActions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [history, setHistory] = useState([]);
  const nameInputRef = useRef(null);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const loadActions = useCallback(() => {
    setActions(getActionsForTracker(tracker.id));
  }, [tracker.id]);

  useEffect(() => {
    loadActions();
    Animated.spring(slideAnim, {
      toValue: 0,
      damping: 22,
      stiffness: 180,
      useNativeDriver: true,
    }).start();
  }, []);

  function dismiss() {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 280,
      useNativeDriver: true,
    }).start(() => onClose());
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 8 && gs.vy >= 0,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) slideAnim.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 120 || gs.vy > 0.5) {
          Animated.timing(slideAnim, {
            toValue: SCREEN_HEIGHT,
            duration: 220,
            useNativeDriver: true,
          }).start(() => onClose());
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            damping: 22,
            stiffness: 180,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  function handleActionPress(action) {
    setHistory(prev => [...prev, value]);
    const newVal = value + action.amount;
    updateTrackerValue(tracker.id, newVal);
    setValue(newVal);
  }

  function handleUndo() {
    Alert.alert('Undo', 'Revert the last action?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Undo',
        onPress: () => {
          const prev = history[history.length - 1];
          updateTrackerValue(tracker.id, prev);
          setValue(prev);
          setHistory(h => h.slice(0, -1));
        },
      },
    ]);
  }

  function handleClear() {
    Alert.alert('Clear Total', 'Reset the total to $0.00?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          updateTrackerValue(tracker.id, 0);
          setValue(0);
          setHistory([]);
        },
      },
    ]);
  }

  function handleActionLongPress(action) {
    Alert.alert('Delete Action', `Remove "${action.label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteAction(action.id);
          loadActions();
        },
      },
    ]);
  }

  function handleNamePress() {
    setNameInput(trackerName);
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  }

  function handleNameSubmit() {
    const trimmed = nameInput.trim();
    const newName = trimmed || 'NEW TRACKER';
    updateTrackerName(tracker.id, newName);
    setTrackerName(newName);
    setEditingName(false);
  }

  function handleSaveAction(label, amount) {
    insertActionForTracker(tracker.id, label, amount);
    loadActions();
    setModalVisible(false);
  }

  const absValue = Math.abs(value);
  const formattedValue =
    '$' +
    absValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const isNegative = value < 0;

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
    >
      <SafeAreaView style={styles.safe}>
        {/* Header strip — drag handle + name + total */}
        <View {...panResponder.panHandlers} style={styles.header}>
          <View style={styles.dragHandle} />

          {editingName ? (
            <TextInput
              ref={nameInputRef}
              style={styles.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              onBlur={handleNameSubmit}
              onSubmitEditing={handleNameSubmit}
              returnKeyType="done"
              autoCapitalize="characters"
              selectTextOnFocus
            />
          ) : (
            <Pressable onPress={handleNamePress}>
              <Text style={styles.trackerName}>{trackerName}</Text>
            </Pressable>
          )}

          <View style={styles.totalRow}>
            <Pressable
              onPress={handleUndo}
              disabled={history.length === 0}
              style={styles.headerBtn}
            >
              <Text
                style={[
                  styles.headerBtnText,
                  history.length === 0 && styles.headerBtnDisabled,
                ]}
              >
                ↩
              </Text>
            </Pressable>
            <Text style={[styles.total, isNegative && { color: '#DC2626' }]}>
              {isNegative ? '−' : ''}{formattedValue}
            </Text>
            <Pressable onPress={handleClear} style={styles.headerBtn}>
              <Text style={styles.headerBtnText}>⊘</Text>
            </Pressable>
          </View>
        </View>

        {/* Actions grid */}
        <FlatList
          data={actions}
          keyExtractor={item => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.grid}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Tap + to add your first action button
            </Text>
          }
          renderItem={({ item }) => (
            <ActionButton
              label={item.label}
              amount={item.amount}
              onPress={() => handleActionPress(item)}
              onLongPress={() => handleActionLongPress(item)}
            />
          )}
        />

        {/* FAB */}
        <Pressable
          style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.75 : 1 }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.fabIcon}>+</Text>
        </Pressable>

        {/* Back button */}
        <Pressable
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.75 : 1 }]}
          onPress={dismiss}
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
      </SafeAreaView>

      <ButtonModal
        visible={modalVisible}
        onSave={handleSaveAction}
        onCancel={() => setModalVisible(false)}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.bg,
    zIndex: 10,
  },
  safe: {
    flex: 1,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    padding: 12,
  },
  headerBtnText: {
    fontSize: 32,
    color: C.ink,
  },
  headerBtnDisabled: {
    color: C.inkMuted,
  },
  trackerName: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: C.inkMuted,
    marginBottom: 10,
  },
  nameInput: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: C.inkMuted,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingVertical: 2,
    paddingHorizontal: 8,
    minWidth: 120,
    textAlign: 'center',
  },
  total: {
    fontSize: 64,
    fontWeight: '300',
    color: C.ink,
    letterSpacing: -2,
    lineHeight: 72,
  },
  grid: {
    padding: 10,
    paddingBottom: 100,
  },
  emptyText: {
    textAlign: 'center',
    color: C.inkMuted,
    fontSize: 14,
    marginTop: 40,
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.fab,
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
  backBtn: {
    position: 'absolute',
    bottom: 28,
    left: 24,
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
  backIcon: {
    fontSize: 22,
    color: '#F7F3ED',
    lineHeight: 26,
  },
});
