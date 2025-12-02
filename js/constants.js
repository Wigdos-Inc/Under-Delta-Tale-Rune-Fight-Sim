/**
 * constants.js
 * Central constants file for game-wide values
 */

/**
 * Timing constants (in milliseconds)
 */
export const TIMING = {
    DIALOGUE_DELAY: 2000,           // Delay before showing actions after dialogue
    ATTACK_START_DELAY: 1500,       // Delay before starting attack pattern
    TURN_TRANSITION_DELAY: 1000,    // Delay between turns
    VICTORY_DELAY: 3000,            // Delay before ending battle after victory
    GAME_OVER_DELAY: 2000,          // Delay before showing game over message
    RETURN_BUTTON_DELAY: 1000,      // Delay before showing return button
    ITEM_USE_DELAY: 2000,           // Delay after using an item
};

/**
 * Attack pattern constants
 */
export const ATTACK = {
    DEFAULT_PROJECTILE_SIZE: 20,
    DEFAULT_PROJECTILE_SPEED: 2,
    DEFAULT_BONE_SPEED: 3,
    DEFAULT_BONE_MIN_SIZE: 50,
    DEFAULT_BONE_MAX_SIZE: 150,
    DEFAULT_BONE_WIDTH: 15,
    DEFAULT_BONE_HEIGHT: 15,
    DEFAULT_CIRCLE_START_RADIUS: 10,
    DEFAULT_CIRCLE_END_RADIUS: 100,
    DEFAULT_CIRCLE_DURATION: 60,
    DEFAULT_PATTERN_DURATION: 5000,
    BONE_OUTLINE_WIDTH: 2,
    CIRCLE_LINE_WIDTH: 3,
};

/**
 * UI Layout constants
 */
export const UI = {
    HP_BAR_X: 250,
    HP_BAR_Y: 400,
    HP_BAR_WIDTH: 120,
    HP_BAR_HEIGHT: 20,
    HP_BAR_OFFSET: 40,
    HP_TEXT_OFFSET: 50,
    ENEMY_NAME_X: 30,
    ENEMY_NAME_Y: 400,
    ENEMY_HP_Y: 420,
    ENEMY_HP_BAR_WIDTH: 80,
    ENEMY_HP_BAR_HEIGHT: 6,
    ENEMY_HP_BAR_Y_OFFSET: -80,
    DIALOGUE_BOX_X: 30,
    DIALOGUE_BOX_Y: 250,
    DIALOGUE_BOX_WIDTH: 580,
    DIALOGUE_BOX_HEIGHT: 140,
    DIALOGUE_PADDING: 20,
    DIALOGUE_LINE_HEIGHT: 24,
    DIALOGUE_MAX_WIDTH_OFFSET: 40,
    BUTTON_LAYOUT_Y: 432,
    BUTTON_HEIGHT: 42,
    BUTTON_WIDTH: 110,
    BUTTON_SPACING: 153, // Space between buttons
    SOUL_BUTTON_OFFSET: 24, // Offset of soul from button
    SOUL_SIZE: 16,
};

/**
 * Animation constants
 */
export const ANIMATION = {
    SOUL_BOUNCE_SPEED: 0.15,
    SOUL_BOUNCE_MAX: 3,
    SOUL_BOUNCE_MIN: 0,
    TITLE_BOUNCE_SPEED: 0.1,
    TITLE_BOUNCE_MAX: 5,
    TITLE_BOUNCE_MIN: -5,
    HEART_BOUNCE_SPEED: 0.15,
    DIAGONAL_SPEED_MULTIPLIER: 0.707, // 1/sqrt(2) for normalized diagonal movement
    INVINCIBILITY_FLASH_INTERVAL: 5, // Frames between flashes
    INVINCIBILITY_FLASH_DURATION: 2, // Flash every 2 cycles
};

/**
 * Damage and combat constants
 */
export const COMBAT = {
    MIN_DAMAGE: 1,                  // Minimum damage dealt
    BASE_ATTACK_DAMAGE_MIN: 5,      // Minimum base attack damage
    BASE_ATTACK_DAMAGE_MAX: 10,     // Maximum base attack damage (plus MIN)
    ITEM_BANDAGE_HEALING: 10,       // HP restored by Bandage item
    DEFAULT_MERCY_INCREASE: 10,     // Default mercy increase per ACT
    MAX_MERCY: 100,                 // Maximum mercy value for sparing
    DEFAULT_ENEMY_HP: 100,
    DEFAULT_ENEMY_ATTACK: 5,
    DEFAULT_ENEMY_DEFENSE: 0,
};

/**
 * Game state constants
 */
export const GAME_STATE = {
    MENU: 'menu',
    BATTLE: 'battle',
    ENEMY_SELECT: 'enemy_select',
};

/**
 * Color constants
 */
export const COLORS = {
    // HP Bar colors
    HP_BAR_FULL: '#ffff00',         // Yellow - HP above 50%
    HP_BAR_MEDIUM: '#ff9900',       // Orange - HP 20-50%
    HP_BAR_LOW: '#ff0000',          // Red - HP below 20%
    HP_BAR_BACKGROUND: '#8b0000',   // Dark red background
    HP_BAR_BORDER: '#ffffff',       // White border
    
    // Enemy HP colors
    ENEMY_HP_BAR_FULL: '#00ff00',   // Green
    ENEMY_HP_BAR_BG: '#8b0000',     // Dark red
    
    // Text colors
    TEXT_WHITE: '#ffffff',
    TEXT_YELLOW: '#ffff00',
    TEXT_ORANGE: '#ff9900',
    TEXT_PINK: '#ff66ff',
    TEXT_CYAN: '#00ffff',
    TEXT_GRAY: '#888888',
    
    // Background colors
    BG_BLACK: '#000000',
    BG_UNDERTALE: '#000000',
    BG_DELTARUNE: '#0a0a0a',
    
    // Effect colors
    DAMAGE_FLASH: 'rgba(255, 0, 0, 0.5)',
    KARMA_OVERLAY: 'rgba(160, 32, 240, 0.7)',
};

/**
 * Menu constants
 */
export const MENU = {
    TITLE_Y: 150,
    TITLE_SECONDARY_OFFSET: 50,
    MODE_INDICATOR_OFFSET: 90,
    MENU_START_Y: 300,
    MENU_ITEM_HEIGHT: 50,
    SOUL_X_OFFSET: 120,
    CONTROLS_Y: 450,
    MODE_SELECT_BOX_WIDTH: 150,
    MODE_SELECT_BOX_HEIGHT: 120,
    MODE_SELECT_Y: 250,
    MODE_UT_X: 160,
    MODE_DR_X: 400,
    MODE_SOUL_X_OFFSET: 70,
    MODE_DESCRIPTION_Y: 380,
    MODE_DESCRIPTION_OFFSET: 25,
};

/**
 * Sprite animation constants
 */
export const SPRITE = {
    DEFAULT_FRAME_RATE: 6,          // Default animation frame rate
    DEFAULT_SCALE: 2,               // Default sprite scale
    ENEMY_Y_POSITION: 80,           // Default Y position for enemy sprite
};

/**
 * Input key mappings
 */
export const KEYS = {
    MOVE_LEFT: ['arrowleft', 'a'],
    MOVE_RIGHT: ['arrowright', 'd'],
    MOVE_UP: ['arrowup', 'w'],
    MOVE_DOWN: ['arrowdown', 's'],
    CONFIRM: ['enter', 'z'],
    CANCEL: ['escape', 'x'],
};

/**
 * Z-index layers for UI elements
 */
export const Z_INDEX = {
    BACKGROUND: 0,
    GAME_CANVAS: 1,
    BATTLE_UI: 2,
    DIALOGUE: 3,
    BUTTONS: 4,
    FLASH_OVERLAY: 9999,
    ENEMY_SELECT_MENU: 10000,
};

/**
 * File paths
 */
export const PATHS = {
    DATA_ENEMIES: 'data/enemies/',
    DATA_ENEMIES_DELTARUNE: 'data/enemies/deltarune/',
    DATA_ENEMIES_BOSSES: 'data/enemies/bosses/',
    DATA_ENEMIES_DELTARUNE_BOSSES: 'data/enemies/deltarune/bosses/',
    SPRITES_BASE: 'data/assets/Undertale Sprites/',
};

/**
 * HTTP status constants
 */
export const HTTP = {
    THRESHOLD_LOW_HP: 20,           // Percentage threshold for low HP
    THRESHOLD_MEDIUM_HP: 50,        // Percentage threshold for medium HP
};
