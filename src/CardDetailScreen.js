import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  PanResponder,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  clearHistoryForTracker,
  deleteAction,
  getActionsForTracker,
  getHistoryForTracker,
  insertActionForTracker,
  insertHistoryEntry,
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
  const [menuVisible, setMenuVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyEntries, setHistoryEntries] = useState([]);
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
    insertHistoryEntry(tracker.id, action.label, action.amount);
  }

  function handleUndo() {
    const prev = history[history.length - 1];
    updateTrackerValue(tracker.id, prev);
    setValue(prev);
    setHistory(h => h.slice(0, -1));
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
          clearHistoryForTracker(tracker.id);
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
      <View style={styles.safe}>
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
            <View style={styles.totalSpacer} />
            <Text style={[styles.total, isNegative && { color: '#DC2626' }]}>
              {isNegative ? '−' : ''}{formattedValue}
            </Text>
            <Pressable
              onPress={() => setMenuVisible(true)}
              style={styles.menuBtn}
            >
              <Text style={styles.menuBtnText}>⋯</Text>
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
      </View>

      <ButtonModal
        visible={modalVisible}
        onSave={handleSaveAction}
        onCancel={() => setModalVisible(false)}
      />

      {/* Context menu modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuSheet}>
            <Pressable
              style={[styles.menuRow, history.length === 0 && styles.menuRowDisabled]}
              onPress={() => {
                if (history.length === 0) return;
                setMenuVisible(false);
                handleUndo();
              }}
            >
              <Text style={[styles.menuRowText, history.length === 0 && styles.menuRowTextDisabled]}>
                Undo
              </Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable
              style={styles.menuRow}
              onPress={() => {
                setMenuVisible(false);
                handleClear();
              }}
            >
              <Text style={[styles.menuRowText, { color: '#DC2626' }]}>Clear</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable
              style={styles.menuRow}
              onPress={() => {
                setHistoryEntries(getHistoryForTracker(tracker.id));
                setMenuVisible(false);
                setHistoryVisible(true);
              }}
            >
              <Text style={styles.menuRowText}>History</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* History modal */}
      <Modal
        visible={historyVisible}
        animationType="slide"
        onRequestClose={() => setHistoryVisible(false)}
      >
        <SafeAreaView style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>HISTORY</Text>
            <Pressable onPress={() => setHistoryVisible(false)} style={styles.historyClose}>
              <Text style={styles.historyCloseText}>×</Text>
            </Pressable>
          </View>
          <FlatList
            data={historyEntries}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={historyEntries.length === 0 && styles.historyEmptyContainer}
            ListEmptyComponent={
              <Text style={styles.historyEmptyText}>No actions recorded yet</Text>
            }
            renderItem={({ item }) => {
              const isPos = item.amount >= 0;
              const absAmt = Math.abs(item.amount);
              const formatted =
                (isPos ? '+' : '−') +
                '$' +
                absAmt.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
              const d = new Date(item.created_at);
              const timestamp = d.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              }).replace(',', ' ·');
              return (
                <View style={styles.historyRow}>
                  <View style={styles.historyRowLeft}>
                    <Text style={styles.historyRowLabel}>{item.label}</Text>
                    <Text style={[styles.historyRowAmount, { color: isPos ? '#16A34A' : '#DC2626' }]}>
                      {formatted}
                    </Text>
                  </View>
                  <Text style={styles.historyRowTime}>{timestamp}</Text>
                </View>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
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
    width: '100%',
    paddingHorizontal: 16,
  },
  totalSpacer: {
    width: 44,
  },
  menuBtn: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginLeft: 'auto',
  },
  menuBtnText: {
    fontSize: 28,
    color: C.ink,
    letterSpacing: 2,
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
    flex: 1,
    fontSize: 64,
    fontWeight: '300',
    color: C.ink,
    letterSpacing: -2,
    lineHeight: 72,
    textAlign: 'center',
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
  // Context menu
  menuOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  menuSheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
    paddingTop: 8,
  },
  menuRow: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  menuRowDisabled: {
    opacity: 0.4,
  },
  menuRowText: {
    fontSize: 17,
    color: C.ink,
  },
  menuRowTextDisabled: {
    color: C.inkMuted,
  },
  menuDivider: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 16,
  },
  // History modal
  historyContainer: {
    flex: 1,
    backgroundColor: C.bg,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  historyTitle: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: C.inkMuted,
  },
  historyClose: {
    padding: 8,
  },
  historyCloseText: {
    fontSize: 24,
    color: C.ink,
    lineHeight: 28,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  historyRowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyRowLabel: {
    fontSize: 15,
    color: C.ink,
  },
  historyRowAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  historyRowTime: {
    fontSize: 12,
    color: C.inkMuted,
  },
  historyEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyEmptyText: {
    fontSize: 15,
    color: C.inkMuted,
    textAlign: 'center',
    marginTop: 60,
  },
});
