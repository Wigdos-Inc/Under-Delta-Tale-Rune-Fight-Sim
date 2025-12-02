/**
 * ui.js
 * User interface management (dialogue, buttons, HP bar)
 */

import { CONFIG } from './config.js';
import { COLORS, HTTP, Z_INDEX } from './constants.js';
import { battleState, BATTLE_STATES } from './battleState.js';

/**
 * UIManager class - Handles all UI elements
 */
export class UIManager {
    constructor() {
        // Update to use new element IDs
        this.dialogueBox = document.getElementById('text-box');
        this.dialogueText = document.getElementById('dialogue-text');
        this.actionButtons = document.getElementById('action-buttons');
        this.subMenu = document.getElementById('sub-menu');
        this.hpBar = document.getElementById('hp-bar-fill');
        this.hpCurrent = document.getElementById('hp-current');
        this.hpMax = document.getElementById('hp-max');
        this.soulCursor = document.getElementById('soul-cursor');
        
        this.currentText = '';
        this.displayedText = '';
        this.textIndex = 0;
        this.textSpeed = CONFIG.ANIMATION.textSpeed;
        this.textTimer = 0;
        this.isTyping = false;
        
        // Button state management
        this.buttonsEnabled = false;
        this.buttonsLocked = false;
        this.lastClickTime = 0;
        this.clickCooldown = 300; // ms between clicks
        
        // Soul cursor position
        this.selectedButtonIndex = 0;
        this.buttonPositions = [];
        
        // Keyboard navigation
        this.keyboardEnabled = false;
        this.lastKeyTime = 0;
        this.keyDelay = 150; // ms between key presses
        
        this.setupButtons();
        this.setupKeyboardControls();
        this.calculateButtonPositions();
        
        // Listen to battle state changes
        battleState.addListener((newState, oldState) => {
            this.handleStateChange(newState, oldState);
        });
    }
    
    /**
     * Setup keyboard controls for menu navigation
     */
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.keyboardEnabled || !battleState.canSelectMenuOption()) {
                return;
            }
            
            const now = Date.now();
            if (now - this.lastKeyTime < this.keyDelay) {
                return; // Prevent key spam
            }
            
            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.moveSoulCursor('left');
                    this.lastKeyTime = now;
                    break;
                    
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.moveSoulCursor('right');
                    this.lastKeyTime = now;
                    break;
                    
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    this.moveSoulCursor('up');
                    this.lastKeyTime = now;
                    break;
                    
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    this.moveSoulCursor('down');
                    this.lastKeyTime = now;
                    break;
                    
                case 'z':
                case 'Z':
                case 'Enter':
                    e.preventDefault();
                    this.confirmSelection();
                    this.lastKeyTime = now;
                    break;
                    
                case 'x':
                case 'X':
                case 'Escape':
                    e.preventDefault();
                    this.cancelSelection();
                    this.lastKeyTime = now;
                    break;
            }
        });
    }
    
    /**
     * Move soul cursor in specified direction
     */
    moveSoulCursor(direction) {
        const buttons = document.querySelectorAll('.action-btn');
        if (buttons.length === 0) return;
        
        // Button layout: [0:FIGHT, 1:ACT]
        //                [2:ITEM,  3:MERCY]
        const currentRow = Math.floor(this.selectedButtonIndex / 2);
        const currentCol = this.selectedButtonIndex % 2;
        
        let newRow = currentRow;
        let newCol = currentCol;
        
        switch (direction) {
            case 'left':
                newCol = currentCol === 0 ? 1 : 0;
                break;
            case 'right':
                newCol = currentCol === 1 ? 0 : 1;
                break;
            case 'up':
                newRow = currentRow === 0 ? 1 : 0;
                break;
            case 'down':
                newRow = currentRow === 1 ? 0 : 1;
                break;
        }
        
        this.selectedButtonIndex = newRow * 2 + newCol;
        this.updateSoulCursor();
        this.playMenuSound('move');
    }
    
    /**
     * Confirm current selection (Z/Enter key)
     */
    confirmSelection() {
        if (!this.canProcessClick('confirm')) {
            return;
        }
        
        const buttons = document.querySelectorAll('.action-btn');
        const selectedButton = buttons[this.selectedButtonIndex];
        
        if (selectedButton) {
            const action = selectedButton.dataset.action;
            this.playMenuSound('confirm');
            this.handleButtonClick(action);
        }
    }
    
    /**
     * Cancel selection (X/Escape key)
     */
    cancelSelection() {
        // Could be used for backing out of submenus in the future
        this.playMenuSound('cancel');
        console.log('Cancel action (not implemented yet)');
    }
    
    /**
     * Play menu sound effect
     */
    playMenuSound(type) {
        // Placeholder for menu sounds
        // In full implementation, would use audioManager.playSound()
        console.log(`Menu sound: ${type}`);
        
        // TODO: Implement actual sound playback
        // audioManager.playSound(`menu_${type}`);
    }
    
    /**
     * Calculate button positions for soul cursor
     */
    calculateButtonPositions() {
        const buttons = document.querySelectorAll('.action-btn');
        this.buttonPositions = Array.from(buttons).map(btn => {
            const rect = btn.getBoundingClientRect();
            const containerRect = document.getElementById('game-container').getBoundingClientRect();
            return {
                x: rect.left - containerRect.left - 40,
                y: rect.top - containerRect.top + rect.height / 2 - 16
            };
        });
    }
    
    /**
     * Handle battle state changes
     */
    handleStateChange(newState, oldState) {
        switch (newState) {
            case BATTLE_STATES.MENU_SELECTION:
                this.enableButtons();
                this.enableKeyboard();
                break;
            case BATTLE_STATES.SUBMENU_SELECTION:
                this.disableButtons();
                this.disableKeyboard();
                break;
            case BATTLE_STATES.ACTION_PROCESSING:
            case BATTLE_STATES.FIGHT_ANIMATION:
            case BATTLE_STATES.ENEMY_ATTACKING:
            case BATTLE_STATES.DODGING:
                this.disableButtons();
                this.disableKeyboard();
                this.hideActionButtons();
                break;
            case BATTLE_STATES.PLAYER_TURN_START:
                this.unlockButtons();
                break;
        }
    }
    
    /**
     * Setup button event listeners
     */
    setupButtons() {
        const buttons = document.querySelectorAll('.action-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                
                // Prevent action if not allowed
                if (!this.canProcessClick(action)) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`Button click blocked: ${action} (state: ${battleState.getState()})`);
                    return;
                }
                
                this.handleButtonClick(action);
            });
        });
    }
    
    /**
     * Check if click can be processed
     */
    canProcessClick(action) {
        // Check if buttons are enabled
        if (!this.buttonsEnabled) {
            console.log(`Buttons disabled`);
            return false;
        }
        
        // Check if buttons are locked
        if (this.buttonsLocked) {
            console.log(`Buttons locked`);
            return false;
        }
        
        // Check battle state
        if (!battleState.canSelectMenuOption()) {
            console.log(`Battle state does not allow menu selection: ${battleState.getState()}`);
            return false;
        }
        
        // Check cooldown
        const now = Date.now();
        if (now - this.lastClickTime < this.clickCooldown) {
            console.log(`Click on cooldown (${now - this.lastClickTime}ms since last)`);
            return false;
        }
        
        return true;
    }
    
    /**
     * Handle button click with locking
     */
    handleButtonClick(action) {
        // Lock buttons immediately
        this.lockButtons();
        this.lastClickTime = Date.now();
        
        // Trigger action
        if (this.onActionClick) {
            this.onActionClick(action);
        }
        
        // Auto-unlock after longer cooldown (will be re-locked by state machine if needed)
        setTimeout(() => {
            if (battleState.canSelectMenuOption()) {
                this.unlockButtons();
            }
        }, this.clickCooldown);
    }
    
    /**
     * Enable buttons
     */
    enableButtons() {
        this.buttonsEnabled = true;
        const buttons = document.querySelectorAll('.action-btn');
        buttons.forEach(btn => {
            btn.classList.remove('disabled');
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        });
    }
    
    /**
     * Disable buttons
     */
    disableButtons() {
        this.buttonsEnabled = false;
        const buttons = document.querySelectorAll('.action-btn');
        buttons.forEach(btn => {
            btn.classList.add('disabled');
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
    }
    
    /**
     * Enable keyboard controls
     */
    enableKeyboard() {
        this.keyboardEnabled = true;
        console.log('Keyboard controls enabled');
    }
    
    /**
     * Disable keyboard controls
     */
    disableKeyboard() {
        this.keyboardEnabled = false;
        console.log('Keyboard controls disabled');
    }
    
    /**
     * Lock buttons (temporary disable)
     */
    lockButtons() {
        this.buttonsLocked = true;
        this.disableKeyboard();
    }
    
    /**
     * Unlock buttons
     */
    unlockButtons() {
        this.buttonsLocked = false;
        this.enableKeyboard();
    }
    
    /**
     * Show action buttons
     */
    showActionButtons() {
        this.actionButtons.classList.remove('hidden');
        this.subMenu.classList.add('hidden');
        this.enableButtons();
        this.enableKeyboard();
        
        // Reset cursor to first button
        this.selectedButtonIndex = 0;
        this.calculateButtonPositions();
        this.updateSoulCursor();
        this.showSoulCursor();
    }
    
    /**
     * Hide action buttons
     */
    hideActionButtons() {
        this.actionButtons.classList.add('hidden');
        this.disableKeyboard();
        this.hideSoulCursor();
    }
    
    /**
     * Show soul cursor
     */
    showSoulCursor() {
        if (this.soulCursor) {
            this.soulCursor.classList.remove('hidden');
        }
    }
    
    /**
     * Hide soul cursor
     */
    hideSoulCursor() {
        if (this.soulCursor) {
            this.soulCursor.classList.add('hidden');
        }
    }
    
    /**
     * Update soul cursor position
     */
    updateSoulCursor() {
        if (!this.soulCursor || this.buttonPositions.length === 0) return;
        
        const pos = this.buttonPositions[this.selectedButtonIndex];
        if (pos) {
            this.soulCursor.style.left = pos.x + 'px';
            this.soulCursor.style.top = pos.y + 'px';
        }
        
        // Update selected button highlight
        const buttons = document.querySelectorAll('.action-btn');
        buttons.forEach((btn, index) => {
            if (index === this.selectedButtonIndex) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }
    
    /**
     * Show sub-menu with options
     * @param {Array} options - Array of {name, callback} objects
     */
    showSubMenu(options) {
        this.subMenu.innerHTML = '';
        this.subMenu.classList.remove('hidden');
        
        options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'sub-menu-item';
            btn.textContent = option.name;
            btn.addEventListener('click', () => {
                if (option.callback) option.callback();
            });
            this.subMenu.appendChild(btn);
        });
    }
    
    /**
     * Hide sub-menu
     */
    hideSubMenu() {
        this.subMenu.classList.add('hidden');
        this.subMenu.innerHTML = '';
    }
    
    /**
     * Display text with typewriter effect
     * @param {string} text - Text to display
     * @param {boolean} instant - Skip animation if true
     */
    showDialogue(text, instant = false) {
        this.currentText = text;
        this.textIndex = 0;
        this.displayedText = '';
        this.isTyping = !instant;
        this.textTimer = 0;
        
        if (instant) {
            this.displayedText = text;
            this.dialogueText.textContent = text;
        }
    }
    
    /**
     * Update typewriter effect
     */
    updateDialogue() {
        if (!this.isTyping) return;
        
        this.textTimer++;
        
        if (this.textTimer >= this.textSpeed / CONFIG.ANIMATION.msPerFrame) { // Convert ms to frames
            this.textTimer = 0;
            
            if (this.textIndex < this.currentText.length) {
                this.displayedText += this.currentText[this.textIndex];
                this.textIndex++;
                this.dialogueText.textContent = this.displayedText;
            } else {
                this.isTyping = false;
            }
        }
    }
    
    /**
     * Skip to end of current text
     */
    skipDialogue() {
        if (this.isTyping) {
            this.displayedText = this.currentText;
            this.textIndex = this.currentText.length;
            this.dialogueText.textContent = this.displayedText;
            this.isTyping = false;
        }
    }
    
    /**
     * Check if dialogue is still typing
     * @returns {boolean} True if typing
     */
    isDialogueTyping() {
        return this.isTyping;
    }
    
    /**
     * Update HP bar display
     * @param {number} current - Current HP
     * @param {number} max - Maximum HP
     */
    updateHP(current, max) {
        const percent = (current / max) * 100;
        this.hpBar.style.width = percent + '%';
        this.hpCurrent.textContent = Math.max(0, Math.floor(current));
        this.hpMax.textContent = max;
        
        // Change color based on HP
        if (percent > HTTP.THRESHOLD_MEDIUM_HP) {
            this.hpBar.style.backgroundColor = COLORS.HP_BAR_FULL;
        } else if (percent > HTTP.THRESHOLD_LOW_HP) {
            this.hpBar.style.backgroundColor = COLORS.HP_BAR_MEDIUM;
        } else {
            this.hpBar.style.backgroundColor = COLORS.HP_BAR_LOW;
        }
    }
    
    /**
     * Flash screen effect (for damage)
     * @param {string} color - Flash color
     * @param {number} duration - Duration in ms
     */
    flashScreen(color = COLORS.DAMAGE_FLASH, duration = 200) {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = color;
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = Z_INDEX.FLASH_OVERLAY.toString();
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, duration);
    }
    
    /**
     * Get soul cursor position for rendering on canvas
     * @returns {{x: number, y: number, visible: boolean}} Soul cursor position and visibility
     */
    getSoulCursorPosition() {
        const visible = this.soulCursor && !this.soulCursor.classList.contains('hidden');
        
        if (!visible || this.buttonPositions.length === 0) {
            return { x: 0, y: 0, visible: false };
        }
        
        const pos = this.buttonPositions[this.selectedButtonIndex];
        if (pos) {
            return { x: pos.x, y: pos.y, visible: true };
        }
        
        return { x: 0, y: 0, visible: false };
    }
    
    /**
     * Set callback for action button clicks
     * @param {Function} callback - Callback function
     */
    setActionCallback(callback) {
        this.onActionClick = callback;
    }
}

export const uiManager = new UIManager();
