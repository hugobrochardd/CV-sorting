import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'data.db');

let wrapper;

// Thin adapter that mimics the better-sqlite3 API on top of sql.js
class DBWrapper {
  constructor(sqlDb) {
    this.db = sqlDb;
  }

  prepare(sql) {
    return new StmtWrapper(this.db, sql, this);
  }

  exec(sql) {
    this.db.run(sql);
    this._save();
  }

  _save() {
    const data = this.db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }
}

class StmtWrapper {
  constructor(db, sql, dbWrapper) {
    this.db = db;
    this.sql = sql;
    this.dbWrapper = dbWrapper;
  }

  run(...params) {
    this.db.run(this.sql, params);
    const idRow = this.db.exec('SELECT last_insert_rowid() as id');
    const chRow = this.db.exec('SELECT changes() as c');
    this.dbWrapper._save();
    return {
      lastInsertRowid: idRow[0]?.values[0]?.[0],
      changes: chRow[0]?.values[0]?.[0],
    };
  }

  get(...params) {
    const stmt = this.db.prepare(this.sql);
    stmt.bind(params);
    let row = null;
    if (stmt.step()) {
      row = stmt.getAsObject();
    }
    stmt.free();
    return row || null;
  }

  all(...params) {
    const stmt = this.db.prepare(this.sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  }
}

export function getDB() {
  if (!wrapper) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return wrapper;
}

export async function initDB() {
  const SQL = await initSqlJs();

  let db;
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  wrapper = new DBWrapper(db);

  wrapper.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      required_skills TEXT NOT NULL DEFAULT '[]',
      preferred_skills TEXT NOT NULL DEFAULT '[]',
      min_experience INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  wrapper.exec(`
    CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      raw_text TEXT NOT NULL,
      extracted_data TEXT,
      score INTEGER,
      score_justification TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  wrapper.exec(`
    CREATE TABLE IF NOT EXISTS decisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id INTEGER NOT NULL,
      decision TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (candidate_id) REFERENCES candidates(id)
    )
  `);

  console.log('Database initialized.');
}
