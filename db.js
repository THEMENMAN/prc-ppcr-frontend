// ============================================================
// PRC PPCR - IndexedDB Wrapper
// Handles offline storage of PPCR reports
// ============================================================

const DB_NAME = 'prc_ppcr_db';
const DB_VERSION = 1;
const STORE_REPORTS = 'reports';
const STORE_PENDING = 'pending_sync';

let _db = null;

// ------------------------------------------------------------
// Open / initialize the database
// ------------------------------------------------------------
function openDB() {
  return new Promise((resolve, reject) => {
    if (_db) return resolve(_db);

    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = event.target.result;
      console.log('📦 Upgrading IndexedDB to version', DB_VERSION);

      // Reports store
      if (!db.objectStoreNames.contains(STORE_REPORTS)) {
        const store = db.createObjectStore(STORE_REPORTS, { keyPath: 'client_uuid' });
        store.createIndex('synced', 'synced', { unique: false });
        store.createIndex('created_at', 'created_at', { unique: false });
        store.createIndex('serial_no', 'serial_no', { unique: false });
      }

      // Pending sync queue
      if (!db.objectStoreNames.contains(STORE_PENDING)) {
        db.createObjectStore(STORE_PENDING, { keyPath: 'client_uuid' });
      }
    };

    req.onsuccess = (event) => {
      _db = event.target.result;
      console.log('✅ IndexedDB opened:', DB_NAME);
      resolve(_db);
    };

    req.onerror = () => {
      console.error('❌ IndexedDB error:', req.error);
      reject(req.error);
    };
  });
}

// ------------------------------------------------------------
// Save a report (always works, even offline)
// ------------------------------------------------------------
async function saveReport(report) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_REPORTS, 'readwrite');
    const store = tx.objectStore(STORE_REPORTS);
    store.put(report);
    tx.oncomplete = () => {
      console.log('💾 Report saved to IndexedDB:', report.client_uuid);
      resolve(report);
    };
    tx.onerror = () => reject(tx.error);
  });
}

// ------------------------------------------------------------
// Get a single report by UUID
// ------------------------------------------------------------
async function getReport(uuid) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_REPORTS, 'readonly');
    const req = tx.objectStore(STORE_REPORTS).get(uuid);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ------------------------------------------------------------
// Get all reports (newest first)
// ------------------------------------------------------------
async function getAllReports() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_REPORTS, 'readonly');
    const req = tx.objectStore(STORE_REPORTS).getAll();
    req.onsuccess = () => {
      const reports = req.result || [];
      reports.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      resolve(reports);
    };
    req.onerror = () => reject(req.error);
  });
}

// ------------------------------------------------------------
// Get reports that haven't been synced to server yet
// ------------------------------------------------------------
async function getUnsyncedReports() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_REPORTS, 'readonly');
    const index = tx.objectStore(STORE_REPORTS).index('synced');
    const req = index.getAll(IDBKeyRange.only(false));
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

// ------------------------------------------------------------
// Mark a report as synced
// ------------------------------------------------------------
async function markSynced(uuid) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_REPORTS, 'readwrite');
    const store = tx.objectStore(STORE_REPORTS);
    const getReq = store.get(uuid);
    getReq.onsuccess = () => {
      const report = getReq.result;
      if (report) {
        report.synced = true;
        report.synced_at = new Date().toISOString();
        store.put(report);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ------------------------------------------------------------
// Delete a report
// ------------------------------------------------------------
async function deleteReport(uuid) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_REPORTS, 'readwrite');
    tx.objectStore(STORE_REPORTS).delete(uuid);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ------------------------------------------------------------
// Count of unsynced reports
// ------------------------------------------------------------
async function countUnsynced() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_REPORTS, 'readonly');
    const index = tx.objectStore(STORE_REPORTS).index('synced');
    const req = index.count(IDBKeyRange.only(false));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ------------------------------------------------------------
// Clear all local data (danger!)
// ------------------------------------------------------------
async function clearAllLocalData() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_REPORTS, 'readwrite');
    tx.objectStore(STORE_REPORTS).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ------------------------------------------------------------
// Generate a UUID v4
// ------------------------------------------------------------
function uuidv4() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Expose globals
window.openDB = openDB;
window.saveReportToDB = saveReport;
window.getReportFromDB = getReport;
window.getAllReportsFromDB = getAllReports;
window.getUnsyncedReports = getUnsyncedReports;
window.markReportSynced = markSynced;
window.deleteReportFromDB = deleteReport;
window.countUnsynced = countUnsynced;
window.clearAllLocalData = clearAllLocalData;
window.uuidv4 = uuidv4;

console.log('📦 db.js loaded');