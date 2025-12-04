/**
 * Main application entry point
 */

// Global instances
let battleEngine;
let uiRenderer;
let currentGame = 'undertale';
let enemies = {};

/**
 * Initialize application
 */
async function init() {
  // Initialize UI renderer
  uiRenderer = new UIRenderer();
  
  // Initialize battle engine
  const canvas = document.getElementById('battleCanvas');
  battleEngine = new BattleEngine(canvas);
  
  // Setup event listeners
  setupEventListeners();
  
  // Check authentication
  await checkAuthentication();
  
  // Load enemies
  loadEnemies();
  
  // Display enemy list
  displayEnemyList(currentGame);
}

/**
 * Check if user is authenticated
 */
async function checkAuthentication() {
  const isAuth = await apiClient.verifyAuth();
  
  if (isAuth) {
    // User is logged in
    document.getElementById('username').textContent = apiClient.username;
    document.getElementById('logoutBtn').classList.remove('hidden');
    document.getElementById('authModal').classList.add('hidden');
    
    // Load user stats
    loadUserStats();
  } else {
    // Show auth modal
    document.getElementById('authModal').classList.remove('hidden');
  }
}

/**
 * Load user stats
 */
async function loadUserStats() {
  try {
    const data = await apiClient.getUserStats();
    const stats = data.stats;
    
    document.getElementById('totalBattles').textContent = stats.total_battles;
    document.getElementById('totalWins').textContent = stats.total_wins;
    document.getElementById('favoriteEnemy').textContent = stats.favorite_enemy || '-';
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Auth modal
  document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('authModal').classList.add('hidden');
  });
  
  document.getElementById('showRegister').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
  });
  
  document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
  });
  
  document.getElementById('playGuest').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('username').textContent = 'Guest';
  });
  
  // Login/Register
  document.getElementById('loginBtn').addEventListener('click', handleLogin);
  document.getElementById('registerBtn').addEventListener('click', handleRegister);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  
  // Game tabs
  document.getElementById('undertaleTab').addEventListener('click', () => switchGame('undertale'));
  document.getElementById('deltaruneTab').addEventListener('click', () => switchGame('deltarune'));
  
  // Battle buttons
  document.getElementById('fightBtn').addEventListener('click', () => battleEngine.handleFight());
  document.getElementById('actBtn').addEventListener('click', () => {
    if (battleEngine.currentEnemy) {
      uiRenderer.showActMenu(battleEngine.currentEnemy.acts);
    }
  });
  document.getElementById('itemBtn').addEventListener('click', () => battleEngine.handleItem());
  document.getElementById('mercyBtn').addEventListener('click', () => uiRenderer.showMercyMenu());
  
  // ACT menu delegation
  document.getElementById('actMenu').addEventListener('click', (e) => {
    if (e.target.classList.contains('menu-option')) {
      const action = e.target.dataset.action;
      battleEngine.handleAct(action);
      uiRenderer.hideAllMenus();
    }
  });
  
  // MERCY menu delegation
  document.getElementById('mercyMenu').addEventListener('click', (e) => {
    if (e.target.classList.contains('menu-option')) {
      const action = e.target.dataset.action;
      battleEngine.handleMercy(action);
      uiRenderer.hideAllMenus();
    }
  });
  
  // Results modal
  document.getElementById('returnToMenuBtn').addEventListener('click', () => {
    document.getElementById('resultsModal').classList.add('hidden');
    battleEngine.endBattle(true);
  });
  
  document.getElementById('retryBtn').addEventListener('click', () => {
    document.getElementById('resultsModal').classList.add('hidden');
    if (battleEngine.currentEnemy) {
      battleEngine.startBattle(battleEngine.currentEnemy);
    }
  });
}

/**
 * Handle login
 */
async function handleLogin() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  
  if (!username || !password) {
    alert('Please fill in all fields');
    return;
  }
  
  try {
    await apiClient.login(username, password);
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('username').textContent = username;
    document.getElementById('logoutBtn').classList.remove('hidden');
    loadUserStats();
  } catch (err) {
    alert('Login failed: ' + err.message);
  }
}

/**
 * Handle register
 */
async function handleRegister() {
  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  
  if (!username || !email || !password) {
    alert('Please fill in all fields');
    return;
  }
  
  try {
    await apiClient.register(username, email, password);
    alert('Registration successful! Please login.');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
  } catch (err) {
    alert('Registration failed: ' + err.message);
  }
}

/**
 * Handle logout
 */
async function handleLogout() {
  try {
    await apiClient.logout();
    document.getElementById('username').textContent = 'Guest';
    document.getElementById('logoutBtn').classList.add('hidden');
    document.getElementById('totalBattles').textContent = '0';
    document.getElementById('totalWins').textContent = '0';
    document.getElementById('favoriteEnemy').textContent = '-';
  } catch (err) {
    console.error('Logout failed:', err);
  }
}

/**
 * Switch game tab
 */
function switchGame(game) {
  currentGame = game;
  
  // Update tab styles
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(game + 'Tab').classList.add('active');
  
  // Display enemies for selected game
  displayEnemyList(game);
}

/**
 * Load enemy definitions
 */
function loadEnemies() {
  // Load Undertale enemies
  enemies.undertale = [
    new Froggit(),
    new Whimsun(),
    new Loox(),
    new Migosp(),
    new Moldsmal()
  ];
  
  enemies.deltarune = [
    // Placeholder - will be populated with Deltarune enemy instances
  ];
}

/**
 * Display enemy list
 */
function displayEnemyList(game) {
  const enemyList = document.getElementById('enemyList');
  enemyList.innerHTML = '';
  
  if (enemies[game].length === 0) {
    enemyList.innerHTML = '<p style="text-align: center; padding: 20px;">No enemies loaded yet.</p>';
    return;
  }
  
  enemies[game].forEach(enemy => {
    const item = document.createElement('div');
    item.className = 'enemy-item';
    
    // Get personal best if available
    let bestTime = '-';
    if (apiClient.isAuthenticated) {
      // TODO: Load from API
    } else {
      // Load from localStorage
      const guestData = JSON.parse(localStorage.getItem('guestProgress') || '{}');
      if (guestData[enemy.name]) {
        bestTime = (guestData[enemy.name].time / 1000).toFixed(2) + 's';
      }
    }
    
    item.innerHTML = `
      <div class="enemy-info">
        <div class="enemy-name">${enemy.name}</div>
        <div class="enemy-location">${enemy.location || 'Unknown'}</div>
      </div>
      <div class="enemy-stats">
        <div>AT: ${enemy.attack} DF: ${enemy.defense}</div>
        <div class="enemy-best-time">Best: ${bestTime}</div>
      </div>
    `;
    
    item.addEventListener('click', () => {
      battleEngine.startBattle(enemy);
    });
    
    enemyList.appendChild(item);
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
