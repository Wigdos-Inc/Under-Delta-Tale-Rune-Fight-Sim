const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Record enemy defeat
router.post('/defeat', authenticateToken, async (req, res) => {
  try {
    const { enemyName, game, completionTimeMs, damageTaken } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!enemyName || !game || completionTimeMs === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (completionTimeMs < 0 || damageTaken < 0) {
      return res.status(400).json({ error: 'Invalid values' });
    }

    // Insert defeat record
    await db.query(
      'INSERT INTO enemy_defeats (user_id, enemy_name, game, completion_time_ms, damage_taken) VALUES (?, ?, ?, ?, ?)',
      [userId, enemyName, game, completionTimeMs, damageTaken || 0]
    );

    // Check and update personal best
    const [existingPB] = await db.query(
      'SELECT best_time_ms, min_damage_taken FROM personal_bests WHERE user_id = ? AND enemy_name = ?',
      [userId, enemyName]
    );

    let isNewBest = false;

    if (existingPB.length === 0) {
      // First time defeating this enemy
      await db.query(
        'INSERT INTO personal_bests (user_id, enemy_name, game, best_time_ms, min_damage_taken) VALUES (?, ?, ?, ?, ?)',
        [userId, enemyName, game, completionTimeMs, damageTaken || 0]
      );
      isNewBest = true;
    } else {
      // Check if this is a better time
      if (completionTimeMs < existingPB[0].best_time_ms) {
        await db.query(
          'UPDATE personal_bests SET best_time_ms = ?, min_damage_taken = ?, achieved_at = NOW() WHERE user_id = ? AND enemy_name = ?',
          [completionTimeMs, damageTaken || 0, userId, enemyName]
        );
        isNewBest = true;
      } else if (completionTimeMs === existingPB[0].best_time_ms && damageTaken < existingPB[0].min_damage_taken) {
        await db.query(
          'UPDATE personal_bests SET min_damage_taken = ?, achieved_at = NOW() WHERE user_id = ? AND enemy_name = ?',
          [damageTaken, userId, enemyName]
        );
      }
    }

    // Update user stats
    await db.query(
      'UPDATE user_stats SET total_battles = total_battles + 1, total_wins = total_wins + 1 WHERE user_id = ?',
      [userId]
    );

    res.json({
      message: 'Defeat recorded successfully',
      isNewBest: isNewBest
    });
  } catch (err) {
    console.error('Defeat recording error:', err);
    res.status(500).json({ error: 'Failed to record defeat' });
  }
});

// Get defeat history
router.get('/defeats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const game = req.query.game;
    const limit = parseInt(req.query.limit) || 50;

    let query = 'SELECT enemy_name, game, completion_time_ms, damage_taken, defeated_at FROM enemy_defeats WHERE user_id = ?';
    let params = [userId];

    if (game) {
      query += ' AND game = ?';
      params.push(game);
    }

    query += ' ORDER BY defeated_at DESC LIMIT ?';
    params.push(limit);

    const [defeats] = await db.query(query, params);

    res.json({ defeats });
  } catch (err) {
    console.error('Get defeats error:', err);
    res.status(500).json({ error: 'Failed to retrieve defeats' });
  }
});

// Get personal bests
router.get('/bests', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const game = req.query.game;

    let query = 'SELECT enemy_name, game, best_time_ms, min_damage_taken, achieved_at FROM personal_bests WHERE user_id = ?';
    let params = [userId];

    if (game) {
      query += ' AND game = ?';
      params.push(game);
    }

    query += ' ORDER BY enemy_name';

    const [bests] = await db.query(query, params);

    res.json({ personalBests: bests });
  } catch (err) {
    console.error('Get personal bests error:', err);
    res.status(500).json({ error: 'Failed to retrieve personal bests' });
  }
});

// Get leaderboard for specific enemy
router.get('/leaderboard/:enemyName', async (req, res) => {
  try {
    const { enemyName } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const [leaderboard] = await db.query(
      `SELECT u.username, pb.best_time_ms, pb.min_damage_taken, pb.achieved_at
       FROM personal_bests pb
       JOIN users u ON pb.user_id = u.user_id
       WHERE pb.enemy_name = ?
       ORDER BY pb.best_time_ms ASC
       LIMIT ?`,
      [enemyName, limit]
    );

    res.json({ enemyName, leaderboard });
  } catch (err) {
    console.error('Get leaderboard error:', err);
    res.status(500).json({ error: 'Failed to retrieve leaderboard' });
  }
});

// Get user stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [stats] = await db.query(
      'SELECT total_battles, total_wins, total_losses, favorite_enemy FROM user_stats WHERE user_id = ?',
      [userId]
    );

    if (stats.length === 0) {
      return res.status(404).json({ error: 'Stats not found' });
    }

    res.json({ stats: stats[0] });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

module.exports = router;
