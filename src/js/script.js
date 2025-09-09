/**
 * Event Map Application - Main Script
 * Handles real-time booth status updates and admin interactions
 */

// Configuration
const BOOTH_IDS = [
  "psc_workshop1", "psc_workshop2",
  "tent1", "tent2", "tent3",
  "plaza", "ultralight_show", "great_hall"
];

// Application state
let realtimeAttached = false;
let lastSnapshotData = {};

/**
 * Apply color/status to a booth element
 * @param {string} id - The booth ID
 * @param {string} color - The color/status ('red' or 'green')
 */
function applyColor(id, color) {
  const el = document.getElementById(id);
  if (!el) return;
  if (color !== "red" && color !== "green") return;
  
  // Update visual state
  el.classList.remove("red", "green");
  el.classList.add(color);
  el.setAttribute("data-status", color);
  
  // Update accessibility attributes
  // Prefer explicit data-name for SVG shapes, fall back to existing aria-label or textContent
  let baseLabel = el.getAttribute("data-name");
  if (!baseLabel) {
    const existing = el.getAttribute("aria-label") || el.textContent || "";
    // strip any existing parenthetical suffix like " (available)"
    baseLabel = existing.replace(/\s*\([^)]*\)\s*$/, '').trim();
  }
  if (el.getAttribute("role") === "status") {
    const stateText = color === "green" ? "available" : "busy";
    const finalLabel = baseLabel ? `${baseLabel} (${stateText})` : `(${stateText})`;
    el.setAttribute("aria-label", finalLabel);
  }
  if (el.getAttribute("role") === "button") {
    el.setAttribute("aria-pressed", color === "red");
  }
}

/**
 * Apply batch updates from Firebase snapshot
 * @param {Object} data - Firebase snapshot data
 */
function applyBatch(data) {
  if (!data) return;
  BOOTH_IDS.forEach(id => {
    if (data[id]) applyColor(id, data[id]);
  });
}

/**
 * Attach real-time Firebase listeners
 */
function attachRealtime() {
  if (realtimeAttached) return;
  realtimeAttached = true;

  const ref = firebase.database().ref("booths");
  console.log("[MAP] Listening:", ref.toString());

  // Debounce full snapshot for large updates (reduced delay for better responsiveness)
  let fullTimer = null;
  ref.on("value", snap => {
    const data = snap.val() || {};
    lastSnapshotData = data;
    clearTimeout(fullTimer);
    fullTimer = setTimeout(() => applyBatch(data), 5); // Reduced from 15ms to 5ms
  });

  // Individual booth changes
  ref.on("child_changed", snap => {
    applyColor(snap.key, snap.val());
  });
  ref.on("child_added", snap => {
    applyColor(snap.key, snap.val());
  });

  // Connection status monitoring with detailed logging
  firebase.database().ref(".info/connected").on("value", s => {
    const connected = s.val();
    console.log("[MAP] Firebase connection status:", connected);
    
    if (connected) {
      console.log("[MAP] ✅ Connected to Firebase Realtime Database");
      // Test latency with a small write/read cycle
      const testRef = firebase.database().ref(".info/serverTimeOffset");
      testRef.once("value").then(snapshot => {
        const offset = snapshot.val() || 0;
        console.log(`[MAP] Server time offset: ${offset}ms`);
      });
    } else {
      console.warn("[MAP] ⚠️  Disconnected from Firebase - using cached data");
    }
  });
}

/**
 * Toggle booth status between available and busy
 * @param {string} id - The booth ID to toggle
 */
function toggleBooth(id) {
  const current = lastSnapshotData[id] || "green";
  const next = current === "green" ? "red" : "green";
  
  console.log(`[ADMIN] Toggling booth ${id}: ${current} -> ${next}`);
  
  // Get current admin user for logging
  const currentUser = firebase.auth().currentUser;
  const adminEmail = currentUser ? currentUser.email : 'anonymous';
  
  // Apply optimistic update for immediate feedback
  applyColor(id, next);
  
  // Update Firebase with error handling and performance monitoring
  const startTime = performance.now();
  firebase.database().ref("booths/" + id).set(next)
    .then(() => {
      const endTime = performance.now();
      console.log(`[ADMIN] Successfully updated ${id} in ${(endTime - startTime).toFixed(2)}ms`);
      
      // Log the admin action for audit trail
      if (typeof logAdminAction === 'function') {
        logAdminAction('booth_toggle', id, current, next, adminEmail);
      }
    })
    .catch((error) => {
      const endTime = performance.now();
      console.error(`[ADMIN] Failed to update ${id} after ${(endTime - startTime).toFixed(2)}ms:`, error);
      
      // Revert optimistic update on error
      applyColor(id, current);
      
      // Show user feedback (if admin interface exists)
      if (document.body.classList.contains("admin-mode")) {
        alert(`Failed to update ${id}. Please try again.`);
      }
    });
}

/**
 * Enable admin interaction features
 */
function enableAdminInteraction() {
  const map = document.getElementById("map");
  if (!map) return;

  // Click delegation for booth toggling
  map.addEventListener("click", e => {
    const target = e.target.closest(".area");
    if (!target || !document.body.classList.contains("admin-mode")) return;
    const id = target.getAttribute("data-id");
    if (id) toggleBooth(id);
  });

  // Keyboard interaction (Enter / Space)
  map.addEventListener("keydown", e => {
    if (!document.body.classList.contains("admin-mode")) return;
    if (e.key !== " " && e.key !== "Enter") return;
    const target = e.target.closest(".area");
    if (!target) return;
    e.preventDefault();
    const id = target.getAttribute("data-id");
    if (id) toggleBooth(id);
  });
}

/**
 * Initialize public interface
 */
function initPublic() {
  console.log("[APP] Initializing public interface");
  attachRealtime();
}

/**
 * Initialize admin interface
 */
function initAdminMode() {
  console.log("[APP] Initializing admin interface");
  attachRealtime();
  enableAdminInteraction();
}

/**
 * Test Firebase write/read latency
 * Call this function in browser console to test latency: testFirebaseLatency()
 */
function testFirebaseLatency() {
  const testId = 'latency_test_' + Date.now();
  const startTime = performance.now();
  
  console.log('[LATENCY TEST] Starting Firebase latency test...');
  
  firebase.database().ref('test/' + testId).set('test_value')
    .then(() => {
      const writeTime = performance.now();
      console.log(`[LATENCY TEST] Write completed in ${(writeTime - startTime).toFixed(2)}ms`);
      
      return firebase.database().ref('test/' + testId).once('value');
    })
    .then(snapshot => {
      const readTime = performance.now();
      console.log(`[LATENCY TEST] Read completed in ${(readTime - startTime).toFixed(2)}ms`);
      console.log(`[LATENCY TEST] Total round-trip: ${(readTime - startTime).toFixed(2)}ms`);
      
      // Clean up test data
      return firebase.database().ref('test/' + testId).remove();
    })
    .then(() => {
      console.log('[LATENCY TEST] Test completed and cleaned up');
    })
    .catch(error => {
      console.error('[LATENCY TEST] Error:', error);
    });
}

// Export functions to global scope for HTML access
window.initPublic = initPublic;
window.initAdminMode = initAdminMode;
window.testFirebaseLatency = testFirebaseLatency;
