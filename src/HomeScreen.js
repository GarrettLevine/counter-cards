import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  deleteAction,
  getActions,
  getCounter,
  insertAction,
  setCounter,
  setCounterName,
} from './db';
import ActionButton from './components/ActionButton';
import ButtonModal from './components/ButtonModal';

const C = {
  bg: '#F7F3ED',
  surface: '#EDE8E0',
  ink: '#1C1917',
  inkMuted: '#78716C',
  border: '#D6CFC4',
  fab: '#1C1917',
};

export default function HomeScreen() {
  const [total, setTotal] = useState(0);
  const [trackerName, setTrackerName] = useState('TOTAL SAVED');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [actions, setActions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [history, setHistory] = useState([]);
  const nameInputRef = useRef(null);

  const loadData = useCallback(() => {
    const counter = getCounter();
    if (counter) {
      setTotal(counter.value);
      setTrackerName(counter.name || 'TOTAL SAVED');
    }
    setActions(getActions());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleActionPress(action) {
    setHistory(prev => [...prev, total]);
    const newVal = total + action.amount;
    setCounter(newVal);
    setTotal(newVal);
  }

  function handleUndo() {
    Alert.alert('Undo', 'Revert the last action?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Undo',
        onPress: () => {
          const prev = history[history.length - 1];
          setCounter(prev);
          setTotal(prev);
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
          setCounter(0);
          setTotal(0);
          setHistory([]);
        },
      },
    ]);
  }

  function handleActionLongPress(action) {
    Alert.alert(
      'Delete Action',
      `Remove "${action.label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteAction(action.id);
            setActions(getActions());
          },
        },
      ]
    );
  }

  function handleNamePress() {
    setNameInput(trackerName);
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  }

  function handleNameSubmit() {
    const trimmed = nameInput.trim();
    const newName = trimmed || 'TOTAL SAVED';
    setCounterName(newName);
    setTrackerName(newName);
    setEditingName(false);
  }

  function handleSaveAction(label, amount) {
    insertAction(label, amount);
    setActions(getActions());
    setModalVisible(false);
  }

  const formattedTotal =
    '$' +
    Math.abs(total).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const isNegative = total < 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Counter section */}
        <View style={styles.counterSection}>
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
              <Text style={[styles.headerBtnText, history.length === 0 && styles.headerBtnDisabled]}>
                ↩
              </Text>
            </Pressable>
            <Text style={[styles.total, isNegative && { color: '#DC2626' }]}>
              {isNegative ? '−' : ''}{formattedTotal}
            </Text>
            <Pressable onPress={handleClear} style={styles.headerBtn}>
              <Text style={styles.headerBtnText}>⊘</Text>
            </Pressable>
          </View>
        </View>

        {/* Actions grid */}
        <FlatList
          data={actions}
          keyExtractor={(item) => String(item.id)}
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
      </View>

      <ButtonModal
        visible={modalVisible}
        onSave={handleSaveAction}
        onCancel={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  counterSection: {
    paddingTop: 48,
    paddingBottom: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
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
});
