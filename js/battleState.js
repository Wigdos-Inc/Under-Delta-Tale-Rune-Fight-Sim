/**
 * battleState.js
 * Battle state machine to prevent invalid actions during transitions
 */

import { CONFIG } from './config.js';

/**
 * Battle States
 */
export const BATTLE_STATES = {
    IDLE: 'IDLE',
    INTRO: 'INTRO',
    PLAYER_TURN_START: 'PLAYER_TURN_START',
    MENU_SELECTION: 'MENU_SELECTION',
    SUBMENU_SELECTION: 'SUBMENU_SELECTION',
    ACTION_PROCESSING: 'ACTION_PROCESSING',
    FIGHT_ANIMATION: 'FIGHT_ANIMATION',
    ENEMY_TURN_START: 'ENEMY_TURN_START',
    ENEMY_DIALOGUE: 'ENEMY_DIALOGUE',
    ENEMY_ATTACKING: 'ENEMY_ATTACKING',
    DODGING: 'DODGING',
    PLAYER_HIT: 'PLAYER_HIT',
    DAMAGE_FLASH: 'DAMAGE_FLASH',
    DIALOGUE_DISPLAY: 'DIALOGUE_DISPLAY',
    TRANSITION: 'TRANSITION',
    VICTORY: 'VICTORY',
    DEFEAT: 'DEFEAT',
    FLEEING: 'FLEEING'
};

/**
 * BattleStateMachine class
 * Manages battle state transitions and input validation
 */
export class BattleStateMachine {
    constructor() {
        this.currentState = BATTLE_STATES.IDLE;
        this.previousState = null;
        this.stateStartTime = 0;
        this.transitioning = false;
        this.transitionDuration = 100; // ms
        
        // State change listeners
        this.listeners = [];
        
        // Debug mode
        this.debugMode = false;
    }
    
    /**
     * Get current state
     */
    getState() {
        return this.currentState;
    }
    
    /**
     * Check if in specific state
     */
    isState(state) {
        return this.currentState === state;
    }
    
    /**
     * Check if in any of the provided states
     */
    isAnyState(states) {
        return states.includes(this.currentState);
    }
    
    /**
     * Set new state with validation
     */
    setState(newState, force = false) {
        // Validate state transition
        if (!force && !this.canTransitionTo(newState)) {
            console.warn(`Invalid state transition: ${this.currentState} -> ${newState}`);
            return false;
        }
        
        if (this.debugMode) {
            console.log(`[BattleState] ${this.currentState} -> ${newState}`);
        }
        
        this.previousState = this.currentState;
        this.currentState = newState;
        this.stateStartTime = Date.now();
        this.transitioning = true;
        
        // Notify listeners
        this.notifyListeners(newState, this.previousState);
        
        // Clear transition flag after duration
        setTimeout(() => {
            this.transitioning = false;
        }, this.transitionDuration);
        
        return true;
    }
    
    /**
     * Check if can transition to new state
     */
    canTransitionTo(newState) {
        // Allow any transition from IDLE
        if (this.currentState === BATTLE_STATES.IDLE) return true;
        
        // Define valid transitions
        const validTransitions = {
            [BATTLE_STATES.INTRO]: [
                BATTLE_STATES.PLAYER_TURN_START,
                BATTLE_STATES.DIALOGUE_DISPLAY
            ],
            [BATTLE_STATES.PLAYER_TURN_START]: [
                BATTLE_STATES.MENU_SELECTION,
                BATTLE_STATES.TRANSITION
            ],
            [BATTLE_STATES.MENU_SELECTION]: [
                BATTLE_STATES.SUBMENU_SELECTION,
                BATTLE_STATES.ACTION_PROCESSING,
                BATTLE_STATES.FIGHT_ANIMATION,
                BATTLE_STATES.FLEEING,
                BATTLE_STATES.TRANSITION
            ],
            [BATTLE_STATES.SUBMENU_SELECTION]: [
                BATTLE_STATES.MENU_SELECTION,
                BATTLE_STATES.ACTION_PROCESSING,
                BATTLE_STATES.TRANSITION
            ],
            [BATTLE_STATES.ACTION_PROCESSING]: [
                BATTLE_STATES.DIALOGUE_DISPLAY,
                BATTLE_STATES.ENEMY_TURN_START,
                BATTLE_STATES.PLAYER_TURN_START,
                BATTLE_STATES.VICTORY,
                BATTLE_STATES.TRANSITION
            ],
            [BATTLE_STATES.FIGHT_ANIMATION]: [
                BATTLE_STATES.DIALOGUE_DISPLAY,
                BATTLE_STATES.ENEMY_TURN_START,
                BATTLE_STATES.VICTORY,
                BATTLE_STATES.TRANSITION
            ],
            [BATTLE_STATES.ENEMY_TURN_START]: [
                BATTLE_STATES.ENEMY_DIALOGUE,
                BATTLE_STATES.ENEMY_ATTACKING,
                BATTLE_STATES.TRANSITION
            ],
            [BATTLE_STATES.ENEMY_DIALOGUE]: [
                BATTLE_STATES.ENEMY_ATTACKING,
                BATTLE_STATES.TRANSITION
            ],
            [BATTLE_STATES.ENEMY_ATTACKING]: [
                BATTLE_STATES.DODGING,
                BATTLE_STATES.TRANSITION
            ],
            [BATTLE_STATES.DODGING]: [
                BATTLE_STATES.PLAYER_HIT,
                BATTLE_STATES.PLAYER_TURN_START,
                BATTLE_STATES.DEFEAT,
                BATTLE_STATES.TRANSITION
            ],
            [BATTLE_STATES.PLAYER_HIT]: [
                BATTLE_STATES.DAMAGE_FLASH,
                BATTLE_STATES.DODGING,
                BATTLE_STATES.TRANSITION
            ],
            [BATTLE_STATES.DAMAGE_FLASH]: [
                BATTLE_STATES.DODGING,
                BATTLE_STATES.PLAYER_TURN_START,
                BATTLE_STATES.DEFEAT,
                BATTLE_STATES.TRANSITION
            ],
            [BATTLE_STATES.DIALOGUE_DISPLAY]: [
                BATTLE_STATES.PLAYER_TURN_START,
                BATTLE_STATES.ENEMY_TURN_START,
                BATTLE_STATES.VICTORY,
                BATTLE_STATES.DEFEAT,
                BATTLE_STATES.TRANSITION
            ],
            [BATTLE_STATES.TRANSITION]: [
                BATTLE_STATES.PLAYER_TURN_START,
                BATTLE_STATES.ENEMY_TURN_START,
                BATTLE_STATES.MENU_SELECTION,
                BATTLE_STATES.DIALOGUE_DISPLAY
            ],
            [BATTLE_STATES.VICTORY]: [BATTLE_STATES.IDLE],
            [BATTLE_STATES.DEFEAT]: [BATTLE_STATES.IDLE],
            [BATTLE_STATES.FLEEING]: [
                BATTLE_STATES.IDLE,
                BATTLE_STATES.ENEMY_TURN_START,
                BATTLE_STATES.DIALOGUE_DISPLAY
            ]
        };
        
        const allowed = validTransitions[this.currentState] || [];
        return allowed.includes(newState);
    }
    
    /**
     * Check if input is allowed in current state
     */
    canAcceptInput() {
        if (this.transitioning) return false;
        
        return this.isAnyState([
            BATTLE_STATES.MENU_SELECTION,
            BATTLE_STATES.SUBMENU_SELECTION,
            BATTLE_STATES.DODGING
        ]);
    }
    
    /**
     * Check if menu actions are allowed
     */
    canSelectMenuOption() {
        return this.isState(BATTLE_STATES.MENU_SELECTION) && !this.transitioning;
    }
    
    /**
     * Check if submenu actions are allowed
     */
    canSelectSubmenuOption() {
        return this.isState(BATTLE_STATES.SUBMENU_SELECTION) && !this.transitioning;
    }
    
    /**
     * Check if player can move (dodge phase)
     */
    canPlayerMove() {
        return this.isState(BATTLE_STATES.DODGING) && !this.transitioning;
    }
    
    /**
     * Check if currently transitioning
     */
    isTransitioning() {
        return this.transitioning;
    }
    
    /**
     * Get time in current state (ms)
     */
    getTimeInState() {
        return Date.now() - this.stateStartTime;
    }
    
    /**
     * Add state change listener
     */
    addListener(callback) {
        this.listeners.push(callback);
    }
    
    /**
     * Remove state change listener
     */
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }
    
    /**
     * Notify all listeners of state change
     */
    notifyListeners(newState, oldState) {
        this.listeners.forEach(listener => {
            try {
                listener(newState, oldState);
            } catch (error) {
                console.error('Error in state change listener:', error);
            }
        });
    }
    
    /**
     * Reset to idle state
     */
    reset() {
        this.setState(BATTLE_STATES.IDLE, true);
        this.previousState = null;
        this.transitioning = false;
    }
    
    /**
     * Enable debug logging
     */
    enableDebug() {
        this.debugMode = true;
    }
    
    /**
     * Disable debug logging
     */
    disableDebug() {
        this.debugMode = false;
    }
}

// Export singleton instance
export const battleState = new BattleStateMachine();
