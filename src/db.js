import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';

let db;

function getDB() {
  if (!db) {
    db = SQLite.openDatabaseSync('counter.db');
  }
  return db;
}

export async function initDB() {
  runMigrations(getDB());
}

// ─── Trackers ────────────────────────────────────────────────────────────────

export function getTrackers() {
  return getDB().getAllSync(`
    SELECT t.*,
           COALESCE(a.cnt, 0) AS action_count
    FROM trackers t
    LEFT JOIN (
      SELECT tracker_id, COUNT(*) AS cnt
      FROM actions
      GROUP BY tracker_id
    ) a ON a.tracker_id = t.id
    ORDER BY t.sort_order ASC, t.id ASC;
  `);
}

export function insertTracker(name) {
  const database = getDB();
  database.runSync(
    'INSERT INTO trackers (name, value, sort_order) VALUES (?, 0, (SELECT COALESCE(MAX(sort_order),0)+1 FROM trackers));',
    [name || 'NEW TRACKER']
  );
  return database.getFirstSync('SELECT last_insert_rowid() as id;').id;
}

export function deleteTracker(id) {
  const database = getDB();
  database.runSync('DELETE FROM actions WHERE tracker_id = ?;', [id]);
  database.runSync('DELETE FROM trackers WHERE id = ?;', [id]);
}

export function updateTrackerValue(id, val) {
  getDB().runSync('UPDATE trackers SET value = ? WHERE id = ?;', [val, id]);
}

export function updateTrackerName(id, name) {
  getDB().runSync('UPDATE trackers SET name = ? WHERE id = ?;', [name, id]);
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export function getActionsForTracker(trackerId) {
  return getDB().getAllSync(
    'SELECT * FROM actions WHERE tracker_id = ? ORDER BY id ASC;',
    [trackerId]
  );
}

export function insertActionForTracker(trackerId, label, amount) {
  getDB().runSync(
    'INSERT INTO actions (label, amount, tracker_id) VALUES (?, ?, ?);',
    [label, amount, trackerId]
  );
}

export function deleteAction(id) {
  getDB().runSync('DELETE FROM actions WHERE id = ?;', [id]);
}

// ─── History Log ─────────────────────────────────────────────────────────────

export function insertHistoryEntry(trackerId, label, amount) {
  getDB().runSync(
    'INSERT INTO history_log (tracker_id, label, amount, created_at) VALUES (?, ?, ?, ?);',
    [trackerId, label, amount, Date.now()]
  );
}

export function getHistoryForTracker(trackerId) {
  return getDB().getAllSync(
    'SELECT * FROM history_log WHERE tracker_id = ? ORDER BY created_at DESC;',
    [trackerId]
  );
}

export function clearHistoryForTracker(trackerId) {
  getDB().runSync('DELETE FROM history_log WHERE tracker_id = ?;', [trackerId]);
}

// ─── Legacy exports (unused but kept to avoid import errors during transition) ─

export function getCounter() {
  return getDB().getFirstSync('SELECT value, name FROM counter WHERE id = 1;');
}

export function setCounter(val) {
  getDB().runSync('UPDATE counter SET value = ? WHERE id = 1;', [val]);
}

export function setCounterName(name) {
  getDB().runSync('UPDATE counter SET name = ? WHERE id = 1;', [name]);
}

export function getActions() {
  return getDB().getAllSync('SELECT * FROM actions ORDER BY id ASC;');
}

export function insertAction(label, amount) {
  getDB().runSync(
    'INSERT INTO actions (label, amount) VALUES (?, ?);',
    [label, amount]
  );
}
