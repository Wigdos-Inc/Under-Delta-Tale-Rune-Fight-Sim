/**
 * config.js
 * Central configuration file for game constants and settings
 */

export const CONFIG = {
    // Canvas dimensions
    CANVAS_WIDTH: 640,
    CANVAS_HEIGHT: 480,
    
    // Battle box (where attacks happen)
    BATTLE_BOX: {
        x: 160,
        y: 150,
        width: 320,
        height: 160,
        borderWidth: 5
    },
    
    // SOUL (player heart) settings
    SOUL: {
        size: 16,
        speed: 3,
        color: '#ff0000',
        invincibilityTime: 1000 // milliseconds after being hit
    },
    
    // HP settings
    HP: {
        max: 20,
        current: 20
    },
    
    // Turn phases
    PHASE: {
        MENU: 'menu',           // Showing action buttons
        ENEMY_ATTACK: 'attack', // Enemy attack phase with soul movement
        PLAYER_TURN: 'player'   // Player selecting action/sub-action
    },
    
    // Colors
    COLORS: {
        background: '#000000',
        text: '#ffffff',
        battleBox: '#000000',
        battleBoxBorder: '#ffffff',
        soul: '#ff0000',
        enemy: '#ffffff',
        damage: '#ff0000',
        mercy: '#ffff00'
    },
    
    // Animation settings
    ANIMATION: {
        textSpeed: 50,      // milliseconds per character
        damageFlashTime: 500, // milliseconds
        shakeIntensity: 5
    },
    
    // Sound settings
    SOUND: {
        enabled: true,
        volume: 0.5
    }
};

// Make config available globally for non-module scripts
if (typeof window !== 'undefined') {
    window.GAME_CONFIG = CONFIG;
}
