/**
 * API Client for communicating with backend
 */
class ApiClient {
  constructor(baseUrl = 'https://under-delta-tale-rune-fight-sim.railway.internal') {
    this.baseUrl = baseUrl;
    this.isAuthenticated = false;
    this.username = null;
    this.userId = null;
  }

  /**
   * Make HTTP request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include' // Include cookies
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (err) {
      console.error(`API Error (${endpoint}):`, err.message);
      throw err;
    }
  }

  /**
   * Register new user
   */
  async register(username, email, password) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });

    return data;
  }

  /**
   * Login user
   */
  async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    this.isAuthenticated = true;
    this.username = data.username;
    this.userId = data.userId;

    return data;
  }

  /**
   * Logout user
   */
  async logout() {
    await this.request('/auth/logout', {
      method: 'POST'
    });

    this.isAuthenticated = false;
    this.username = null;
    this.userId = null;
  }

  /**
   * Verify authentication token
   */
  async verifyAuth() {
    try {
      const data = await this.request('/auth/verify');
      this.isAuthenticated = true;
      this.username = data.username;
      this.userId = data.userId;
      return true;
    } catch (err) {
      this.isAuthenticated = false;
      this.username = null;
      this.userId = null;
      return false;
    }
  }

  /**
   * Record enemy defeat
   */
  async recordDefeat(enemyName, game, completionTimeMs, damageTaken = 0) {
    return await this.request('/progress/defeat', {
      method: 'POST',
      body: JSON.stringify({
        enemyName,
        game,
        completionTimeMs,
        damageTaken
      })
    });
  }

  /**
   * Get defeat history
   */
  async getDefeats(game = null, limit = 50) {
    const params = new URLSearchParams();
    if (game) params.append('game', game);
    params.append('limit', limit);

    return await this.request(`/progress/defeats?${params}`);
  }

  /**
   * Get personal bests
   */
  async getPersonalBests(game = null) {
    const params = new URLSearchParams();
    if (game) params.append('game', game);

    return await this.request(`/progress/bests?${params}`);
  }

  /**
   * Get leaderboard for specific enemy
   */
  async getLeaderboard(enemyName, limit = 10) {
    const params = new URLSearchParams({ limit });
    return await this.request(`/progress/leaderboard/${encodeURIComponent(enemyName)}?${params}`);
  }

  /**
   * Get user stats
   */
  async getUserStats() {
    return await this.request('/progress/stats');
  }
}

// Create global API client instance
const apiClient = new ApiClient();
