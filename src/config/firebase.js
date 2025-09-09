/**
 * Firebase Configuration
 * This file contains the Firebase configuration and initialization
 */

// Environment-specific configuration
const CONFIG = {
  // Firebase project configuration
  firebase: {

  },
  
  // Application settings
  app: {
    name: "Event Map",
    version: "1.0.0",
    debugMode: false
  }
};

/**
 * Initialize Firebase Application
 */
function initializeFirebase() {
  try {
    firebase.initializeApp(CONFIG.firebase);
    console.log("[FIREBASE] Successfully initialized app:", firebase.apps[0].name);
    return true;
  } catch (error) {
    console.error("[FIREBASE] Initialization failed:", error);
    return false;
  }
}

// Initialize Firebase when the script loads
const firebaseInitialized = initializeFirebase();

// Export Firebase services for use in other modules
const auth = firebase.auth();
const db = firebase.database();

/**
 * Log admin actions for audit trail (non-blocking)
 * @param {string} action - The action performed
 * @param {string} targetId - The booth/tent ID that was changed
 * @param {string} oldValue - Previous status
 * @param {string} newValue - New status
 * @param {string} adminEmail - Email of the admin who made the change
 */
function logAdminAction(action, targetId, oldValue, newValue, adminEmail = null) {
  // Check if logging is enabled and Firebase is initialized
  if (!window.LOGGING_ENABLED || !firebaseInitialized) return;
  
  // Use setTimeout to make logging completely non-blocking
  setTimeout(() => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      action,
      targetId,
      oldValue,
      newValue,
      adminEmail: adminEmail || 'unknown'
    };
    
    // Log to Firebase under logs with auto-generated key
    // This runs completely independently of the main booth update
    firebase.database().ref('logs').push(logEntry)
      .then(() => {
        console.log(`[AUDIT] Logged: ${adminEmail} changed ${targetId} from ${oldValue} to ${newValue}`);
      })
      .catch(error => {
        // Silent fail - don't let logging errors affect user experience
        console.warn('[AUDIT] Failed to log action (non-critical):', error);
      });
  }, 0); // Execute on next tick, completely non-blocking
}

/**
 * Get or create a session ID for tracking admin sessions
 */
function getSessionId() {
  let sessionId = sessionStorage.getItem('adminSessionId');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('adminSessionId', sessionId);
  }
  return sessionId;
}

// Batch logging to reduce Firebase calls during rapid changes
let logBatch = [];
let batchTimeout = null;

/**
 * Flush batched logs to Firebase
 */
function flushLogBatch() {
  if (logBatch.length === 0) return;
  
  const updates = {};
  logBatch.forEach(logEntry => {
    const logKey = firebase.database().ref('logs').push().key;
    updates[`logs/${logKey}`] = logEntry;
  });
  
  firebase.database().ref().update(updates)
    .then(() => {
      console.log(`[AUDIT] Batched ${logBatch.length} log entries`);
    })
    .catch(error => {
      console.warn('[AUDIT] Failed to batch log entries (non-critical):', error);
    });
  
  logBatch = [];
}

/**
 * Add entry to batch (used for rapid changes like tent master toggle)
 * @param {Object} logEntry - The log entry object
 */
function addToBatch(logEntry) {
  logBatch.push(logEntry);
  
  // Clear existing timeout and set new one
  clearTimeout(batchTimeout);
  batchTimeout = setTimeout(flushLogBatch, 1000); // Batch for 1 second
}

/**
 * Get recent admin activity logs
 * @param {number} limit - Number of recent logs to fetch (default: 50)
 * @returns {Promise} Promise that resolves with log data
 */
function getRecentLogs(limit = 50) {
  return firebase.database().ref('logs')
    .orderByChild('timestamp')
    .limitToLast(limit)
    .once('value')
    .then(snapshot => {
      const logs = [];
      snapshot.forEach(child => {
        logs.push({
          id: child.key,
          ...child.val()
        });
      });
      return logs.reverse(); // Most recent first
    });
}

/**
 * Display admin logs in console (for testing/debugging)
 */
function showRecentLogs() {
  getRecentLogs(20).then(logs => {
    console.log('\n=== RECENT ADMIN ACTIVITY ===');
    logs.forEach(log => {
      const time = new Date(log.timestamp).toLocaleString();
      const action = log.action.replace('_', ' ').toUpperCase();
      console.log(`[${time}] ${log.adminEmail}: ${action} ${log.targetId} (${log.oldValue} → ${log.newValue})`);
    });
    console.log('==============================\n');
  }).catch(error => {
    console.error('Failed to fetch logs:', error);
  });
}

// Export configuration for other modules
window.APP_CONFIG = CONFIG;
window.logAdminAction = logAdminAction;
window.getRecentLogs = getRecentLogs;
window.showRecentLogs = showRecentLogs;

// Optional: Disable logging completely if needed for performance
// Set this to false to turn off all logging
window.LOGGING_ENABLED = true;
