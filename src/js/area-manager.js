/**
 * Area Detail Management Module
 * Handles detailed booth management within specific areas
 */

// Area to booth mapping configuration
const AREA_BOOTH_MAPPING = {
  'tentone': {
    title: 'Tent 1',
    booths: [
      // Top row (left to right)
      { id: 'tent1_booth8', name: 'Booth 8' },
      { id: 'tent1_booth9', name: 'Booth 9' },
      { id: 'tent1_booth10', name: 'Booth 10' },
      { id: 'tent1_booth11', name: 'Booth 11' },
      { id: 'tent1_booth12', name: 'Booth 12' },
      { id: 'tent1_booth13', name: 'Booth 13' },
      // Bottom row (left to right)
      { id: 'tent1_booth7', name: 'Booth 7' },
      { id: 'tent1_booth6', name: 'Booth 6' },
      { id: 'tent1_booth5', name: 'Booth 5' },
      { id: 'tent1_booth4', name: 'Booth 4' },
      { id: 'tent1_booth3', name: 'Booth 3' },
      { id: 'tent1_booth2', name: 'Booth 2' }
    ]
  },
  'tenttwo': {
    title: 'Tent 2',
    booths: [
      // Left column (top to bottom)
      { id: 'tent2_booth19', name: 'Booth 19' },
      { id: 'tent2_booth20', name: 'Booth 20' },
      { id: 'tent2_booth21', name: 'Booth 21' },
      { id: 'tent2_booth22', name: 'Booth 22' },
      { id: 'tent2_booth23', name: 'Booth 23' },
      { id: 'tent2_booth24', name: 'Booth 24' },
      // Right column (top to bottom)
      { id: 'tent2_booth18', name: 'Booth 18' },
      { id: 'tent2_booth17', name: 'Booth 17' },
      { id: 'tent2_booth16', name: 'Booth 16' },
      { id: 'tent2_booth15', name: 'Booth 15' },
      { id: 'tent2_booth14', name: 'Booth 14' }
    ]
  },
  'tentthree': {
    title: 'Tent 3',
    booths: [
      // Left column (top to bottom)
      { id: 'tent3_booth30', name: 'Booth 30' },
      { id: 'tent3_booth31', name: 'Booth 31' },
      { id: 'tent3_booth32', name: 'Booth 32' },
      { id: 'tent3_booth33', name: 'Booth 33' },
      { id: 'tent3_booth34', name: 'Booth 34' },
      // Right column (top to bottom)
      { id: 'tent3_booth29', name: 'Booth 29' },
      { id: 'tent3_booth28', name: 'Booth 28' },
      { id: 'tent3_booth27', name: 'Booth 27' },
      { id: 'tent3_booth26', name: 'Booth 26' },
      { id: 'tent3_booth25', name: 'Booth 25' }
    ]
  }
};

/**
 * Area Management Module
 */
const AreaManager = {
  /**
   * Show detailed view of a specific area
   * @param {string} areaKey - The area identifier
   */
  showAreaDetail(areaKey) {
    const areaData = AREA_BOOTH_MAPPING[areaKey];
    if (!areaData) return;

    // Get DOM elements (works for both index.html and admin.html)
    const mapElement = document.getElementById('map');
    const areaDetailElement = document.getElementById('areaDetail');
    const areaTitleElement = document.getElementById('areaTitle');
    
    if (!mapElement || !areaDetailElement || !areaTitleElement) {
      console.error('Required DOM elements not found for area detail view');
      return;
    }

    // Hide map, show area detail
    mapElement.style.display = 'none';
    areaDetailElement.style.display = 'block';
    
    // Update title
    areaTitleElement.textContent = areaData.title;
    
    // Generate booth grid
    this.generateBoothGrid(areaData, areaKey);
    
    // Add event listeners and load statuses
    this.addBoothControlListeners(areaData.booths, areaKey);
    this.loadBoothStatuses(areaData.booths);
  },

  /**
   * Generate HTML for booth grid
   * @param {Object} areaData - Area configuration data
   * @param {string} areaKey - The area identifier key
   */
  generateBoothGrid(areaData, areaKey) {
    const boothGridElement = document.getElementById('boothGrid');
    if (!boothGridElement) {
      console.error('boothGrid element not found');
      return;
    }
    
    // Check if this is a tent area (for tent-level toggle)
    const isTentArea = areaKey && areaKey.startsWith('tent');
    const tentId = isTentArea ? areaKey.replace('tentone', 'tent1').replace('tenttwo', 'tent2').replace('tentthree', 'tent3') : null;
    
    let tentToggleHTML = '';
    if (isTentArea && tentId) {
      tentToggleHTML = `
        <div class="tent-controls-container">
          <div class="tent-master-control">
            <h2>Master ${areaData.title} Control</h2>
            <p>Toggle the entire ${areaData.title.toLowerCase()} and all booths</p>
            <div class="tent-controls">
              <button class="tent-status green" data-tent-id="${tentId}" data-status="green" data-mode="master">
                <span class="status-indicator"></span>
                Set All Available
              </button>
              <button class="tent-status red" data-tent-id="${tentId}" data-status="red" data-mode="master">
                <span class="status-indicator"></span>
                Set All Busy
              </button>
            </div>
            <div class="tent-info">
              <small>Master Status: <span class="current-tent-status" id="tent-status-${tentId}">Available</span></small>
            </div>
          </div>
          
          <div class="tent-only-control">
            <h2>Tent-Only Control</h2>
            <p>Toggle only the ${areaData.title.toLowerCase()} status (keeps booth statuses)</p>
            <div class="tent-controls">
              <button class="tent-status green" data-tent-id="${tentId}" data-status="green" data-mode="tent-only">
                <span class="status-indicator"></span>
                Tent Available
              </button>
              <button class="tent-status red" data-tent-id="${tentId}" data-status="red" data-mode="tent-only">
                <span class="status-indicator"></span>
                Tent Busy
              </button>
            </div>
            <div class="tent-info">
              <small>Tent Status: <span class="current-tent-only-status" id="tent-only-status-${tentId}">Available</span></small>
            </div>
          </div>
        </div>
        <h3>Individual Booth Controls</h3>
      `;
    }
    
    boothGridElement.innerHTML = tentToggleHTML + areaData.booths.map(booth => `
      <div class="booth-card">
        <h3 class="booth-name">${booth.name}</h3>
        <div class="booth-controls">
          <button class="booth-status green" data-booth-id="${booth.id}" data-status="green">
            <span class="status-indicator"></span>
            Available
          </button>
          <button class="booth-status red" data-booth-id="${booth.id}" data-status="red">
            <span class="status-indicator"></span>
            Busy
          </button>
        </div>
        <div class="booth-info">
          <small>Status: <span class="current-status" id="status-${booth.id}">Available</span></small>
        </div>
      </div>
    `).join('');
  },

  /**
   * Add event listeners to booth control buttons
   * @param {Array} booths - Array of booth objects
   * @param {string} areaKey - The area identifier key
   */
  addBoothControlListeners(booths, areaKey) {
    // Add tent-level control listeners if this is a tent area
    const isTentArea = areaKey && areaKey.startsWith('tent');
    const tentId = isTentArea ? areaKey.replace('tentone', 'tent1').replace('tenttwo', 'tent2').replace('tentthree', 'tent3') : null;
    
    if (isTentArea && tentId) {
      const tentButtons = document.querySelectorAll(`[data-tent-id="${tentId}"]`);
      tentButtons.forEach(button => {
        button.addEventListener('click', () => {
          const status = button.dataset.status;
          const mode = button.dataset.mode;
          
          if (mode === 'master') {
            // Master control: update tent and all booths
            this.updateTentStatus(tentId, status, booths);
            this.updateTentUI(tentId, status);
          } else if (mode === 'tent-only') {
            // Tent-only control: update only the tent status
            this.updateTentOnlyStatus(tentId, status);
            this.updateTentOnlyUI(tentId, status);
          }
        });
      });
      
      // Load initial tent status
      this.loadTentStatus(tentId);
    }
    
    // Add individual booth control listeners
    booths.forEach(booth => {
      const buttons = document.querySelectorAll(`[data-booth-id="${booth.id}"]`);
      buttons.forEach(button => {
        button.addEventListener('click', () => {
          const status = button.dataset.status;
          this.updateBoothStatus(booth.id, status);
          this.updateBoothUI(booth.id, status);
        });
      });
    });
  },

  /**
   * Update booth status in Firebase
   * @param {string} boothId - Booth identifier
   * @param {string} status - New status ('green' or 'red')
   */
  updateBoothStatus(boothId, status) {
    // Get current status for logging
    const currentStatus = document.getElementById(`status-${boothId}`)?.textContent === 'Available' ? 'green' : 'red';
    
    firebase.database().ref(`detailed_booths/${boothId}`).set(status)
      .then(() => {
        // Log the detailed booth action
        const currentUser = firebase.auth().currentUser;
        const adminEmail = currentUser ? currentUser.email : 'anonymous';
        
        if (typeof logAdminAction === 'function') {
          logAdminAction('detailed_booth_toggle', boothId, currentStatus, status, adminEmail);
        }
      })
      .catch(error => {
        console.error('Failed to update booth status:', error);
      });
  },

  /**
   * Update booth UI elements
   * @param {string} boothId - Booth identifier
   * @param {string} status - Current status ('green' or 'red')
   */
  updateBoothUI(boothId, status) {
    const statusElement = document.getElementById(`status-${boothId}`);
    const buttons = document.querySelectorAll(`[data-booth-id="${boothId}"]`);
    
    if (statusElement) {
      statusElement.textContent = status === 'green' ? 'Available' : 'Busy';
      statusElement.className = `current-status ${status}`;
    }
    
    buttons.forEach(button => {
      button.classList.remove('active');
      if (button.dataset.status === status) {
        button.classList.add('active');
      }
    });

    // Also sync any SVG rects or map elements that represent this detailed booth
    try {
      const svgTargets = document.querySelectorAll(`[data-detailed-id="${boothId}"]`);
      svgTargets.forEach(el => {
        // remove any previous status classes
        el.classList.remove('green', 'red');
        el.classList.add(status);
        // set fill for inline SVG rects (presentation attribute)
        if (el.tagName && el.tagName.toLowerCase() === 'rect') {
          const fillColor = status === 'green' ? '#2e7d32' : '#c62828';
          el.setAttribute('fill', fillColor);
        }
        // update aria
        if (el.getAttribute('role') === 'status') {
          const base = el.getAttribute('data-name') || el.getAttribute('aria-label') || '';
          const name = base.replace(/\s*\([^)]*\)\s*$/, '').trim() || boothId;
          el.setAttribute('aria-label', `${name} (${status === 'green' ? 'available' : 'busy'})`);
        }
      });
    } catch (e) {
      // ignore if DOM not ready
    }
  },

  /**
   * Update tent status in Firebase and all its booths
   * @param {string} tentId - Tent identifier (tent1, tent2, tent3)
   * @param {string} status - New status ('green' or 'red')
   * @param {Array} booths - Array of booth objects in this tent
   */
  updateTentStatus(tentId, status, booths) {
    // Get current status for logging
    const currentStatus = document.getElementById(`tent-status-${tentId}`)?.textContent === 'Available' ? 'green' : 'red';
    
    // Update the main tent status
    firebase.database().ref(`booths/${tentId}`).set(status)
      .then(() => {
        // Log the tent-level action
        const currentUser = firebase.auth().currentUser;
        const adminEmail = currentUser ? currentUser.email : 'anonymous';
        
        if (typeof logAdminAction === 'function') {
          logAdminAction('tent_master_toggle', tentId, currentStatus, status, adminEmail);
        }
      });
    
    // Update all individual booths in this tent
    booths.forEach(booth => {
      firebase.database().ref(`detailed_booths/${booth.id}`).set(status);
      this.updateBoothUI(booth.id, status);
    });
  },

  /**
   * Update tent UI elements
   * @param {string} tentId - Tent identifier
   * @param {string} status - Current status ('green' or 'red')
   */
  updateTentUI(tentId, status) {
    const statusElement = document.getElementById(`tent-status-${tentId}`);
    const buttons = document.querySelectorAll(`[data-tent-id="${tentId}"][data-mode="master"]`);
    
    if (statusElement) {
      statusElement.textContent = status === 'green' ? 'Available' : 'Busy';
      statusElement.className = `current-tent-status ${status}`;
    }
    
    buttons.forEach(button => {
      button.classList.remove('active');
      if (button.dataset.status === status) {
        button.classList.add('active');
      }
    });
  },

  /**
   * Update tent-only status in Firebase (without changing booths)
   * @param {string} tentId - Tent identifier (tent1, tent2, tent3)
   * @param {string} status - New status ('green' or 'red')
   */
  updateTentOnlyStatus(tentId, status) {
    // Get current status for logging
    const currentStatus = document.getElementById(`tent-only-status-${tentId}`)?.textContent === 'Available' ? 'green' : 'red';
    
    // Update only the main tent status
    firebase.database().ref(`booths/${tentId}`).set(status)
      .then(() => {
        // Log the tent-only action
        const currentUser = firebase.auth().currentUser;
        const adminEmail = currentUser ? currentUser.email : 'anonymous';
        
        if (typeof logAdminAction === 'function') {
          logAdminAction('tent_only_toggle', tentId, currentStatus, status, adminEmail);
        }
      });
  },

  /**
   * Update tent-only UI elements
   * @param {string} tentId - Tent identifier
   * @param {string} status - Current status ('green' or 'red')
   */
  updateTentOnlyUI(tentId, status) {
    const statusElement = document.getElementById(`tent-only-status-${tentId}`);
    const buttons = document.querySelectorAll(`[data-tent-id="${tentId}"][data-mode="tent-only"]`);
    
    if (statusElement) {
      statusElement.textContent = status === 'green' ? 'Available' : 'Busy';
      statusElement.className = `current-tent-only-status ${status}`;
    }
    
    buttons.forEach(button => {
      button.classList.remove('active');
      if (button.dataset.status === status) {
        button.classList.add('active');
      }
    });
  },

  /**
   * Load tent status from Firebase
   * @param {string} tentId - Tent identifier
   */
  loadTentStatus(tentId) {
    // Initial load for both master and tent-only controls
    firebase.database().ref(`booths/${tentId}`).once('value').then(snapshot => {
      const status = snapshot.val() || 'green';
      this.updateTentUI(tentId, status);
      this.updateTentOnlyUI(tentId, status);
    });
    
    // Listen for real-time updates for both controls
    firebase.database().ref(`booths/${tentId}`).on('value', snapshot => {
      const status = snapshot.val() || 'green';
      this.updateTentUI(tentId, status);
      this.updateTentOnlyUI(tentId, status);
    });
  },

  /**
   * Load current booth statuses from Firebase
   * @param {Array} booths - Array of booth objects
   */
  loadBoothStatuses(booths) {
    booths.forEach(booth => {
      // Initial load
      firebase.database().ref(`detailed_booths/${booth.id}`).once('value').then(snapshot => {
        const status = snapshot.val() || 'green';
  this.updateBoothUI(booth.id, status);
      });
      
      // Listen for real-time updates
      firebase.database().ref(`detailed_booths/${booth.id}`).on('value', snapshot => {
        const status = snapshot.val() || 'green';
        this.updateBoothUI(booth.id, status);
      });
    });
  },

  /**
   * Show main map view
   */
  showMainMap() {
    const mapElement = document.getElementById('map');
    const areaDetailElement = document.getElementById('areaDetail');
    
    if (areaDetailElement) {
      areaDetailElement.style.display = 'none';
    }
    if (mapElement) {
      mapElement.style.display = mapElement.classList.contains('map') ? 'grid' : 'block';
    }
  },

  /**
   * Initialize area navigation
   */
  init() {
    // Add event listeners for each area navigation item
    Object.keys(AREA_BOOTH_MAPPING).forEach(areaKey => {
      const element = document.getElementById(areaKey);
      if (element) {
        element.addEventListener("click", (e) => {
          e.preventDefault();
          // Close sidebar if it exists (admin interface)
          if (typeof Sidebar !== 'undefined' && Sidebar.close) {
            Sidebar.close();
          }
          this.showAreaDetail(areaKey);
        });
      }
    });
  }
};
