/**
 * config.js
 * Central configuration file for game constants and settings
 */

export const CONFIG = {
    // Canvas dimensions
    CANVAS_WIDTH: 640,
    CANVAS_HEIGHT: 480,
    
    // Battle box (where attacks happen)
    // Authentic Undertale dimensions: centered horizontally, positioned between enemy and dialogue
    BATTLE_BOX: {
        x: 160,      // Centered: (640 - 320) / 2 = 160
        y: 245,      // Below enemy (~120), above dialogue/buttons (~390)
        width: 320,  // Standard Undertale battle box width
        height: 130, // Standard Undertale battle box height
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
    
    // Enemy position
    ENEMY_POSITION: {
        x: 320,  // Center of 640px canvas
        y: 120   // Top area, above battle box
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
        shakeIntensity: 5,
        frameRate: 60,      // Target frame rate
        msPerFrame: 16.67   // Milliseconds per frame (1000 / 60)
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
