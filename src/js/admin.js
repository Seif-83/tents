/**
 * Admin Interface Controller
 * Handles authentication, session management, and admin-specific functionality
 */

// Constants
const SESSION_KEY = 'eventMapAdminSession';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds

// DOM Elements
let emailInput, passwordInput, keepSignedInCheckbox, loginMsg, loginPanel, 
    logoutBtn, map, menuToggle, sidebar, sidebarOverlay, areaDetail, 
    areaTitle, boothGrid;

/**
 * Initialize DOM references
 */
function initDOMReferences() {
  emailInput = document.getElementById("email");
  passwordInput = document.getElementById("password");
  keepSignedInCheckbox = document.getElementById("keepSignedIn");
  loginMsg = document.getElementById("loginMsg");
  loginPanel = document.getElementById("loginPanel");
  logoutBtn = document.getElementById("logoutBtn");
  map = document.getElementById("map");
  menuToggle = document.getElementById("menuToggle");
  sidebar = document.getElementById("sidebar");
  sidebarOverlay = document.getElementById("sidebarOverlay");
  areaDetail = document.getElementById("areaDetail");
  areaTitle = document.getElementById("areaTitle");
  boothGrid = document.getElementById("boothGrid");
}

/**
 * Session Management Module
 */
const SessionManager = {
  /**
   * Check for existing session on page load
   */
  checkExistingSession() {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (sessionData) {
      try {
        const { timestamp, keepSignedIn } = JSON.parse(sessionData);
        const now = Date.now();
        
        if (keepSignedIn && (now - timestamp) < SESSION_DURATION) {
          // Session is still valid, check Firebase auth state
          firebase.auth().onAuthStateChanged(user => {
            if (user) {
              AdminInterface.show();
              loginMsg.textContent = 'Welcome back! Session restored.';
            } else {
              this.clear();
            }
          });
          return;
        } else {
          // Session expired
          this.clear();
        }
      } catch (e) {
        this.clear();
      }
    }
  },

  /**
   * Save session data
   * @param {boolean} keepSignedIn - Whether to keep user signed in
   */
  save(keepSignedIn) {
    if (keepSignedIn) {
      const sessionData = {
        timestamp: Date.now(),
        keepSignedIn: true
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    }
  },

  /**
   * Clear session data and sign out
   */
  clear() {
    localStorage.removeItem(SESSION_KEY);
    firebase.auth().signOut();
  },

  /**
   * Start periodic session validation
   */
  startPeriodicCheck() {
    setInterval(() => {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (sessionData) {
        try {
          const { timestamp, keepSignedIn } = JSON.parse(sessionData);
          const now = Date.now();
          
          if (!keepSignedIn || (now - timestamp) >= SESSION_DURATION) {
            this.clear();
            AdminInterface.hide();
            loginMsg.textContent = 'Session expired. Please sign in again.';
          }
        } catch (e) {
          this.clear();
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }
};

/**
 * Admin Interface Module
 */
const AdminInterface = {
  /**
   * Show admin interface
   */
  show() {
    document.body.classList.add("admin-mode");
    loginPanel.style.display = 'none';
    map.style.display = 'grid';
    logoutBtn.style.display = 'block';
    menuToggle.style.display = 'flex';
    
    this.updateUserGreeting();
    initAdminMode();
  },

  /**
   * Hide admin interface
   */
  hide() {
    document.body.classList.remove("admin-mode");
    loginPanel.style.display = 'block';
    map.style.display = 'none';
    logoutBtn.style.display = 'none';
    menuToggle.style.display = 'none';
    Sidebar.close();
    loginMsg.textContent = '';
  },

  /**
   * Update user greeting with current user's email
   */
  updateUserGreeting() {
    const currentUser = firebase.auth().currentUser;
    const userGreeting = document.getElementById("userGreeting");
    
    if (currentUser && currentUser.email) {
      userGreeting.textContent = `Hello, ${currentUser.email}`;
    } else {
      userGreeting.textContent = "Hello, Admin";
    }
  }
};

/**
 * Authentication Module
 */
const AuthManager = {
  /**
   * Handle login attempt
   */
  async login() {
    const email = emailInput.value.trim();
    const pass = passwordInput.value;
    const keepSignedIn = keepSignedInCheckbox.checked;
    
    if (!email || !pass) {
      loginMsg.textContent = "Please enter both email and password.";
      return;
    }

    loginMsg.textContent = "Signing in...";
    
    try {
      // Set persistence based on checkbox
      const persistence = keepSignedIn ? 
        firebase.auth.Auth.Persistence.LOCAL : 
        firebase.auth.Auth.Persistence.SESSION;
      
      await firebase.auth().setPersistence(persistence);
      await firebase.auth().signInWithEmailAndPassword(email, pass);
      
      SessionManager.save(keepSignedIn);
      AdminInterface.show();
      
      loginMsg.textContent = keepSignedIn ? 
        "Signed in successfully! Session will last 1 day." : 
        "Signed in successfully!";
      
      setTimeout(() => AdminInterface.updateUserGreeting(), 100);
      this.clearForm();
      
    } catch (error) {
      loginMsg.textContent = this.getErrorMessage(error);
    }
  },

  /**
   * Handle logout
   */
  logout() {
    SessionManager.clear();
    AdminInterface.hide();
    loginMsg.textContent = "Signed out successfully.";
  },

  /**
   * Clear login form
   */
  clearForm() {
    emailInput.value = '';
    passwordInput.value = '';
    keepSignedInCheckbox.checked = false;
  },

  /**
   * Get user-friendly error message
   * @param {Object} error - Firebase auth error
   * @returns {string} User-friendly error message
   */
  getErrorMessage(error) {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Try again later.';
      default:
        return error.message;
    }
  }
};

/**
 * Sidebar Navigation Module
 */
const Sidebar = {
  /**
   * Open sidebar
   */
  open() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  /**
   * Close sidebar
   */
  close() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
  },

  /**
   * Initialize sidebar event listeners
   */
  init() {
    document.getElementById("menuToggle").addEventListener("click", this.open);
    document.getElementById("closeSidebar").addEventListener("click", this.close);
    document.getElementById("sidebarOverlay").addEventListener("click", this.close);
    
    document.getElementById("sidebarLogout").addEventListener("click", () => {
      this.close();
      AuthManager.logout();
    });

    // Close sidebar on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        this.close();
      }
    });
  }
};

/**
 * Initialize admin application
 */
function initAdmin() {
  initDOMReferences();
  SessionManager.checkExistingSession();
  SessionManager.startPeriodicCheck();
  Sidebar.init();
  AreaManager.init();
  
  // Login button event
  document.getElementById("loginBtn").addEventListener("click", AuthManager.login);
  
  // Logout button event
  document.getElementById("logoutBtn").addEventListener("click", AuthManager.logout);
  
  // Back to map button
  document.getElementById("backToMap").addEventListener("click", AreaManager.showMainMap);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initAdmin);
