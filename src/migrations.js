// Each entry runs exactly once, in order. Index 0 = version 1.
// Never edit existing entries — add new ones at the end.
const migrations = [
  // v1 — baseline schema
  (db) => {
    db.execSync(`
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

      CREATE TABLE IF NOT EXISTS trackers (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT DEFAULT 'NEW TRACKER',
        value      REAL DEFAULT 0,
        sort_order INTEGER DEFAULT 0
      );
    `);
  },

  // v2 — multi-tracker support: seed legacy data + tracker_id on actions
  (db) => {
    db.execSync(
      "INSERT OR IGNORE INTO counter (id, value, name) VALUES (1, 0, 'TOTAL SAVED');"
    );
    db.execSync(
      'INSERT OR IGNORE INTO trackers (id, name, value, sort_order) SELECT id, name, value, 0 FROM counter WHERE id = 1;'
    );
    db.execSync(
      "INSERT OR IGNORE INTO trackers (id, name, value, sort_order) VALUES (1, 'TOTAL SAVED', 0, 0);"
    );
    try {
      db.execSync('ALTER TABLE actions ADD COLUMN tracker_id INTEGER DEFAULT 1;');
    } catch (_) {
      // Column already exists on installs that ran this migration before
    }
  },

  // v3 — persistent action history
  (db) => {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS history_log (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        tracker_id INTEGER NOT NULL,
        label      TEXT NOT NULL,
        amount     REAL NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);
  },

  // v4 — per-tracker pastel colour
  (db) => {
    try {
      db.execSync('ALTER TABLE trackers ADD COLUMN color TEXT;');
    } catch (_) {}
  },

  // v5 — tracker type (number | monetary | percentage)
  (db) => {
    try {
      db.execSync("ALTER TABLE trackers ADD COLUMN type TEXT DEFAULT 'monetary';");
    } catch (_) {}
  },
];

export function runMigrations(database) {
  database.execSync('CREATE TABLE IF NOT EXISTS meta (version INTEGER);');

  const row = database.getFirstSync('SELECT version FROM meta WHERE rowid = 1;');
  let version = row ? row.version : 0;

  for (let i = version; i < migrations.length; i++) {
    migrations[i](database);
    database.runSync(
      'INSERT OR REPLACE INTO meta (rowid, version) VALUES (1, ?);',
      [i + 1]
    );
  }
}
