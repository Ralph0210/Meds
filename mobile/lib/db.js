import * as SQLite from "expo-sqlite"

import { Platform } from "react-native"

let db

if (Platform.OS !== "web") {
  db = SQLite.openDatabaseSync("medtracker.db")
} else {
  // Mock DB for Web/Storybook to prevent crashes
  db = {
    withTransactionSync: (cb) => cb(),
    execSync: () => {},
    getAllSync: () => [],
    getFirstSync: () => null,
    runSync: () => ({ lastInsertRowId: 0 }),
  }
}

export const initDatabase = () => {
  return db.withTransactionSync(() => {
    // Medications Table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        dosage TEXT,
        frequency TEXT,
        times TEXT, -- JSON array of strings
        color TEXT,
        icon TEXT,
        keys TEXT, -- JSON array of strings (derived keys)
        type TEXT DEFAULT 'daily', -- 'daily', 'prn', 'course', 'cyclic', 'interval', 'emergency'
        config TEXT -- JSON object for type-specific data
      );
    `)

    // Records Table
    db.execSync(`
      CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE,
        data TEXT, -- JSON object: { [medKey]: boolean }
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Migrations: properties for v2
    try {
      db.execSync(
        "ALTER TABLE medications ADD COLUMN type TEXT DEFAULT 'daily'"
      )
      console.log("Migrated: Added 'type' column")
    } catch (e) {
      // Column likely exists
    }
    try {
      db.execSync("ALTER TABLE medications ADD COLUMN config TEXT")
      console.log("Migrated: Added 'config' column")
    } catch (e) {
      // Column likely exists
    }
  })
}

// Data Access Layer

// --- Medications ---

export const getMedications = () => {
  const result = db.getAllSync("SELECT * FROM medications ORDER BY id")
  return result.map((row) => ({
    ...row,
    times: JSON.parse(row.times || "[]"),
    keys: JSON.parse(row.keys || "[]"),
    config: JSON.parse(row.config || "{}"),
  }))
}

export const addMedication = (med) => {
  // keys logic: usually generated based on name/times.
  // For compatibility with old system, we might need to let the caller handle 'keys' generation or do it here.
  // Assuming 'med' comes with 'keys' or we generate them.
  const { name, dosage, frequency, times, color, icon, keys, type, config } =
    med
  const result = db.runSync(
    `INSERT INTO medications (name, dosage, frequency, times, color, icon, keys, type, config) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      dosage,
      frequency,
      JSON.stringify(times),
      color,
      icon,
      JSON.stringify(keys),
      type || "daily",
      JSON.stringify(config || {}),
    ]
  )
  return result.lastInsertRowId
}

export const updateMedication = (med) => {
  const {
    id,
    name,
    dosage,
    frequency,
    times,
    color,
    icon,
    keys,
    type,
    config,
  } = med
  // keys logic is handled by caller or kept same
  db.runSync(
    `UPDATE medications SET name=?, dosage=?, frequency=?, times=?, color=?, icon=?, keys=?, type=?, config=? WHERE id=?`,
    [
      name,
      dosage,
      frequency,
      JSON.stringify(times),
      color,
      icon,
      JSON.stringify(keys),
      type || "daily",
      JSON.stringify(config || {}),
      id,
    ]
  )
}

export const deleteMedication = (id) => {
  db.runSync("DELETE FROM medications WHERE id = ?", [id])
}

// --- Records ---

export const getRecord = (date) => {
  const result = db.getFirstSync("SELECT * FROM records WHERE date = ?", [date])
  if (result) {
    return { ...result, data: JSON.parse(result.data || "{}") }
  }
  return null
}

export const getRecords = (startDate, endDate) => {
  const results = db.getAllSync(
    "SELECT * FROM records WHERE date >= ? AND date <= ?",
    [startDate, endDate]
  )
  const map = {}
  results.forEach((row) => {
    map[row.date] = { ...row, data: JSON.parse(row.data || "{}") }
  })
  return map
}

export const updateRecord = (date, key, value) => {
  // Use a transaction to ensure atomic read-modify-write for the JSON blob
  return db.withTransactionSync(() => {
    let record = db.getFirstSync("SELECT * FROM records WHERE date = ?", [date])
    let data = {}

    if (record) {
      data = JSON.parse(record.data || "{}")
    }

    data[key] = value

    if (record) {
      console.log("Updating existing record:", date, key, value)
      db.runSync("UPDATE records SET data = ? WHERE date = ?", [
        JSON.stringify(data),
        date,
      ])
    } else {
      console.log("Creating new record:", date, key, value)
      db.runSync("INSERT INTO records (date, data) VALUES (?, ?)", [
        date,
        JSON.stringify(data),
      ])
    }
    return data
  })
}

// --- Seed / Utils ---

export const seedDefaults = () => {
  const existing = db.getFirstSync("SELECT COUNT(*) as count FROM medications")
  if (existing.count === 0) {
    // Add some default medications if empty, or leave blank.
    // Let's add the example one from the UI to start.
    const defaultMed = {
      name: "Minoxidil",
      dosage: "5mg",
      frequency: "2x Daily",
      times: ["Morning", "Night"],
      color: "#FF6B6B",
      icon: "Pill",
      keys: ["minoxidil_morning", "minoxidil_night"],
      type: "daily",
      config: {},
    }
    addMedication(defaultMed)
    const secondMed = {
      name: "Vitamin D",
      dosage: "1000IU",
      frequency: "1x Daily",
      times: ["Morning"],
      color: "#4ECDC4",
      icon: "Sun",
      keys: ["vitamind_morning"],
      type: "daily",
      config: {},
    }
    addMedication(secondMed)
  }
}

export const resetDatabase = () => {
  db.execSync("DROP TABLE IF EXISTS medications")
  db.execSync("DROP TABLE IF EXISTS records")
  initDatabase()
  // seedDefaults() // User requested empty DB
}
