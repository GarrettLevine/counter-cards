import * as SQLite from 'expo-sqlite';

let db;

function getDB() {
  if (!db) {
    db = SQLite.openDatabaseSync('counter.db');
  }
  return db;
}

export async function initDB() {
  const database = getDB();

  // Ensure legacy + new tables exist (safe no-ops if already present)
  database.execSync(`
    CREATE TABLE IF NOT EXISTS counter (
      id    INTEGER PRIMARY KEY,
      value REAL DEFAULT 0,
      name  TEXT DEFAULT 'TOTAL SAVED'
    );

    CREATE TABLE IF NOT EXISTS actions (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      label  TEXT NOT NULL,
      amount REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meta (version INTEGER);

    CREATE TABLE IF NOT EXISTS trackers (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT DEFAULT 'NEW TRACKER',
      value      REAL DEFAULT 0,
      sort_order INTEGER DEFAULT 0
    );
  `);

  // Read schema version
  const metaRow = database.getFirstSync('SELECT version FROM meta WHERE rowid = 1;');
  const version = metaRow ? metaRow.version : 0;

  if (version < 2) {
    // Seed legacy counter row if missing (fresh install path)
    const legacyRow = database.getFirstSync('SELECT id FROM counter WHERE id = 1;');
    if (!legacyRow) {
      database.runSync(
        "INSERT INTO counter (id, value, name) VALUES (1, 0, 'TOTAL SAVED');"
      );
    }

    // Copy legacy counter into trackers (preserving id=1)
    database.runSync(
      'INSERT OR IGNORE INTO trackers (id, name, value) SELECT id, name, value FROM counter WHERE id = 1;'
    );

    // Seed default tracker if trackers is still empty
    const trackerCount = database.getFirstSync('SELECT COUNT(*) as cnt FROM trackers;');
    if (!trackerCount || trackerCount.cnt === 0) {
      database.runSync(
        "INSERT INTO trackers (id, name, value, sort_order) VALUES (1, 'TOTAL SAVED', 0, 0);"
      );
    }

    // Add tracker_id column to actions (back-fills existing rows to tracker 1)
    try {
      database.execSync(
        'ALTER TABLE actions ADD COLUMN tracker_id INTEGER DEFAULT 1;'
      );
    } catch (_) {
      // Column already exists — safe to ignore
    }

    // Mark migration complete
    database.runSync(
      'INSERT OR REPLACE INTO meta (rowid, version) VALUES (1, 2);'
    );
  }
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
