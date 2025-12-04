-- Undertale/Deltarune Fighting Simulator Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enemy defeats tracking
CREATE TABLE IF NOT EXISTS enemy_defeats (
    defeat_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    enemy_name VARCHAR(100) NOT NULL,
    game VARCHAR(20) NOT NULL,
    completion_time_ms INT NOT NULL,
    damage_taken INT DEFAULT 0,
    defeated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_enemy (user_id, enemy_name),
    INDEX idx_game (game),
    INDEX idx_defeated_at (defeated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Personal best records
CREATE TABLE IF NOT EXISTS personal_bests (
    pb_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    enemy_name VARCHAR(100) NOT NULL,
    game VARCHAR(20) NOT NULL,
    best_time_ms INT NOT NULL,
    min_damage_taken INT NOT NULL,
    achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_enemy (user_id, enemy_name),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_enemy_time (enemy_name, best_time_ms)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User statistics
CREATE TABLE IF NOT EXISTS user_stats (
    stat_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    total_battles INT DEFAULT 0,
    total_wins INT DEFAULT 0,
    total_losses INT DEFAULT 0,
    favorite_enemy VARCHAR(100),
    total_playtime_ms BIGINT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
