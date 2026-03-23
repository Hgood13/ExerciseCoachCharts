/*
  db.js — Exercise Coach Charts Database Schema
  =============================================

  Hierarchy:
    clients            (top-level collection)
      └─ client        (one per person)
           ├─ id, name, pin, goals, injuries, protocol
           └─ charts   (one per chart card; grows over time)
                ├─ id, clientId, recordNumber, createdAt
                └─ chartData
                     ├─ sessions  (up to 7 per chart: { date, trainer, routine })
                     └─ exercises (up to 14 per chart: { nameA, nameB, results[] })

  Storage key: "ecc_db"
  The entire database object is serialised as JSON and stored in localStorage
  under this key so that all pages share the same data.
*/

/* ─────────────────────────────────────────────
   SCHEMA SHAPES  (documented with JSDoc)
───────────────────────────────────────────── */

/**
 * @typedef {Object} Session
 * One column of session metadata (up to 7 per chart).
 * @property {string} date    - Display date, e.g. "1/6/26"
 * @property {string} trainer - Trainer name, e.g. "Megan"
 * @property {string} routine - Routine letter, e.g. "A" or "B"
 */

/**
 * @typedef {Object} ExerciseRow
 * One exercise row in the workout grid (up to 14 per chart).
 * @property {string}   nameA   - Abbreviation for the Routine-A exercise
 * @property {string}   nameB   - Abbreviation for the Routine-B exercise
 * @property {string[]} results - Per-session result cell (index matches session index)
 */

/**
 * @typedef {Object} ChartData
 * The full data payload for one chart card.
 * @property {Session[]}     sessions  - Up to 7 session columns
 * @property {ExerciseRow[]} exercises - Up to 14 exercise rows
 */

/**
 * @typedef {Object} Chart
 * One workout chart card for a client.
 * @property {number}    id           - Unique chart identifier
 * @property {number}    clientId     - FK → client.id
 * @property {number}    recordNumber - Sequential chart number for this client
 * @property {string}    createdAt    - ISO 8601 timestamp of chart creation
 * @property {ChartData} chartData    - The actual workout grid data
 */

/**
 * @typedef {Object} Client
 * One client record.
 * @property {number}  id        - Unique client identifier
 * @property {string}  name      - Full name, e.g. "David Hobgood"
 * @property {string}  pin       - Client PIN (numeric string)
 * @property {string}  goals     - Fitness goals text
 * @property {string}  injuries  - Injuries / limitations text
 * @property {string}  protocol  - Protocol notes text
 * @property {Chart[]} charts    - All chart cards for this client (chronological)
 */

/**
 * @typedef {Object} Database
 * The root database object stored in localStorage.
 * @property {Client[]} clients - All client records
 */

/* ─────────────────────────────────────────────
   FACTORY FUNCTIONS
───────────────────────────────────────────── */

/**
 * Create an empty ChartData object (14 exercise rows, 0 sessions).
 * @returns {ChartData}
 */
function createChartData() {
  const exercises = [];
  for (let i = 0; i < 14; i++) {
    exercises.push({ nameA: "", nameB: "", results: [] });
  }
  return { sessions: [], exercises };
}

/**
 * Create a new Chart record.
 * @param {number} clientId
 * @param {number} recordNumber
 * @param {ChartData} [chartData]
 * @returns {Chart}
 */
function createChart(clientId, recordNumber, chartData) {
  return {
    id: Date.now(),
    clientId,
    recordNumber,
    createdAt: new Date().toISOString(),
    chartData: chartData || createChartData()
  };
}

/**
 * Create a new Client record (with no charts yet).
 * @param {number} id
 * @param {string} name
 * @param {string} [pin]
 * @param {string} [goals]
 * @param {string} [injuries]
 * @param {string} [protocol]
 * @returns {Client}
 */
function createClient(id, name, pin, goals, injuries, protocol) {
  return {
    id,
    name: name || "",
    pin: pin || "",
    goals: goals || "",
    injuries: injuries || "",
    protocol: protocol || "",
    charts: []
  };
}

/* ─────────────────────────────────────────────
   LOCALSTORAGE PERSISTENCE
───────────────────────────────────────────── */

const DB_KEY = "ecc_db";

/**
 * Load the database from localStorage.
 * Returns the seed database if nothing has been saved yet.
 * @returns {Database}
 */
function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse database from localStorage:", e);
  }
  return buildSeedDB();
}

/**
 * Persist the database to localStorage.
 * @param {Database} db
 */
function saveDB(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Failed to save database to localStorage:", e);
  }
}

/* ─────────────────────────────────────────────
   CLIENT HELPERS
───────────────────────────────────────────── */

/**
 * Return all clients, sorted by last name then first name.
 * @param {Database} db
 * @returns {Client[]}
 */
function getClients(db) {
  return db.clients.slice().sort((a, b) => {
    const aParts = a.name.trim().split(" ");
    const bParts = b.name.trim().split(" ");
    const aLast = aParts[aParts.length - 1].toLowerCase();
    const bLast = bParts[bParts.length - 1].toLowerCase();
    if (aLast !== bLast) return aLast.localeCompare(bLast);
    return aParts[0].toLowerCase().localeCompare(bParts[0].toLowerCase());
  });
}

/**
 * Find a single client by id.
 * @param {Database} db
 * @param {number} id
 * @returns {Client|undefined}
 */
function getClientById(db, id) {
  return db.clients.find(c => c.id === id);
}

/**
 * Add a new client to the database and persist.
 * @param {Database} db
 * @param {string} name
 * @param {string} [pin]
 * @param {string} [goals]
 * @param {string} [injuries]
 * @param {string} [protocol]
 * @returns {Client} The newly created client
 */
function addClient(db, name, pin, goals, injuries, protocol) {
  const maxId = db.clients.reduce((m, c) => Math.max(m, c.id), 0);
  const client = createClient(maxId + 1, name, pin, goals, injuries, protocol);
  db.clients.push(client);
  saveDB(db);
  return client;
}

/* ─────────────────────────────────────────────
   CHART HELPERS
───────────────────────────────────────────── */

/**
 * Return all charts for a client in chronological order.
 * @param {Client} client
 * @returns {Chart[]}
 */
function getChartsForClient(client) {
  return client.charts.slice().sort((a, b) => a.recordNumber - b.recordNumber);
}

/**
 * Return the most recent chart for a client, or null if none.
 * @param {Client} client
 * @returns {Chart|null}
 */
function getLatestChart(client) {
  if (!client.charts.length) return null;
  return client.charts.reduce((latest, c) =>
    c.recordNumber > latest.recordNumber ? c : latest
  );
}

/**
 * Append a new blank chart to a client and persist.
 * @param {Database} db
 * @param {Client} client
 * @returns {Chart} The newly created chart
 */
function addChartToClient(db, client) {
  const nextRecord = client.charts.length
    ? getLatestChart(client).recordNumber + 1
    : 1;
  const chart = createChart(client.id, nextRecord);
  client.charts.push(chart);
  saveDB(db);
  return chart;
}

/**
 * Update (replace) the chartData on an existing chart and persist.
 * @param {Database} db
 * @param {Client}   client
 * @param {number}   chartId
 * @param {ChartData} chartData
 */
function updateChartData(db, client, chartId, chartData) {
  const chart = client.charts.find(c => c.id === chartId);
  if (chart) {
    chart.chartData = chartData;
    saveDB(db);
  }
}

/* ─────────────────────────────────────────────
   SEED DATA
   Pre-populates the database with the initial
   client roster and the two demo chart records.
───────────────────────────────────────────── */

function buildSeedDB() {
  /** @type {Database} */
  const db = { clients: [] };

  /* ── Seed client list ── */
  const seedClients = [
    { id: 1,  name: "Sarah Johnson" },
    { id: 2,  name: "Mike Thompson" },
    { id: 3,  name: "Emily Davis" },
    { id: 4,  name: "David Hobgood" },
    { id: 5,  name: "Jessica Martinez" },
    { id: 6,  name: "Robert Anderson" },
    { id: 7,  name: "Lisa Chen" },
    { id: 8,  name: "James Wilson" },
    { id: 9,  name: "Amanda Brown" },
    { id: 10, name: "Christopher Lee" },
    { id: 11, name: "Michelle Garcia" },
    { id: 12, name: "Daniel Rodriguez" },
    { id: 13, name: "Rachel Taylor" },
    { id: 14, name: "Kevin Moore" },
    { id: 15, name: "Maria Sanchez" },
    { id: 16, name: "Brandon Jackson" },
    { id: 17, name: "Jennifer White" },
    { id: 18, name: "Matthew Harris" },
    { id: 19, name: "Lauren Clark" },
    { id: 20, name: "Joshua Lewis" }
  ];

  seedClients.forEach(sc => {
    db.clients.push(createClient(sc.id, sc.name));
  });

  /* ── Demo chart: David Hobgood (id 4) ── */
  const hobgood = getClientById(db, 4);
  hobgood.pin      = "1234";
  hobgood.goals    = "Improve upper body strength and increase power output";
  hobgood.injuries = "Previous lower back strain - monitor form during RDLs and squats";
  hobgood.protocol = "ECCS-Best";

  const hobgoodChart = createChart(4, 22, {
    sessions: [
      { date: "1/6/26",  trainer: "Megan", routine: "A" },
      { date: "1/8/26",  trainer: "Megan", routine: "B" },
      { date: "1/13/26", trainer: "Aaron", routine: "A" }
    ],
    exercises: [
      { nameA: "PL",       nameB: "W Row",   results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "MTri Kik", nameB: "TGP P6",  results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "BSS W15",  nameB: "DBCP 15", results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "DBC Fly",  nameB: "MR Fly",  results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "Gob Sqt",  nameB: "#30s",    results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "#25s",     nameB: "DB Crl 5",results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "MBs Fac",  nameB: "WN OHP",  results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "Awy 30s",  nameB: "RDLs 20s",results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "Rpw",      nameB: "Flr Abs", results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "MPO 5",    nameB: "Ball #10",results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "NCP",      nameB: "#10",     results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "TT P15",   nameB: "MP0 8",   results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "ABD 5s",   nameB: "RLP",     results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "ADD 5s",   nameB: "LLP",     results: ["X", "X", "X", "", "", "", ""] }
    ]
  });
  hobgood.charts.push(hobgoodChart);

  /* ── Demo chart: Brandon Jackson (id 16) ── */
  const jackson = getClientById(db, 16);
  jackson.pin      = "1234";
  jackson.goals    = "";
  jackson.injuries = "";
  jackson.protocol = "";

  const jacksonChart = createChart(16, 22, {
    sessions: [
      { date: "1/6/26",  trainer: "Megan", routine: "A" },
      { date: "1/8/26",  trainer: "Megan", routine: "B" },
      { date: "1/13/26", trainer: "Aaron", routine: "A" }
    ],
    exercises: [
      { nameA: "", nameB: "", results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "", nameB: "", results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "", nameB: "", results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "", nameB: "", results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "", nameB: "", results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "", nameB: "", results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "", nameB: "", results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "", nameB: "", results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "", nameB: "", results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "", nameB: "", results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "", nameB: "", results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "", nameB: "", results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "", nameB: "", results: ["X", "X", "X", "", "", "", ""] },
      { nameA: "", nameB: "", results: ["X", "X", "X", "", "", "", ""] }
    ]
  });
  jackson.charts.push(jacksonChart);

  return db;
}

/* ─────────────────────────────────────────────
   EXPORTS (global, for use by other scripts)
───────────────────────────────────────────── */

window.ECC = {
  /* Schema factories */
  createClient,
  createChart,
  createChartData,

  /* Persistence */
  loadDB,
  saveDB,

  /* Client helpers */
  getClients,
  getClientById,
  addClient,

  /* Chart helpers */
  getChartsForClient,
  getLatestChart,
  addChartToClient,
  updateChartData
};
