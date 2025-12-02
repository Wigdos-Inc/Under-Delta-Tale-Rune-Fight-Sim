/**
 * ui.js
 * User interface management (dialogue, buttons, HP bar)
 */

import { CONFIG } from './config.js';

/**
 * UIManager class - Handles all UI elements
 */
export class UIManager {
    constructor() {
        this.dialogueBox = document.getElementById('dialogue-box');
        this.dialogueText = document.getElementById('dialogue-text');
        this.actionButtons = document.getElementById('action-buttons');
        this.subMenu = document.getElementById('sub-menu');
        this.hpBar = document.getElementById('hp-bar-fill');
        this.hpCurrent = document.getElementById('hp-current');
        this.hpMax = document.getElementById('hp-max');
        
        this.currentText = '';
        this.displayedText = '';
        this.textIndex = 0;
        this.textSpeed = CONFIG.ANIMATION.textSpeed;
        this.textTimer = 0;
        this.isTyping = false;
        
        this.setupButtons();
    }
    
    /**
     * Setup button event listeners
     */
    setupButtons() {
        const buttons = document.querySelectorAll('.action-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                if (this.onActionClick) {
                    this.onActionClick(action);
                }
            });
        });
    }
    
    /**
     * Show action buttons
     */
    showActionButtons() {
        this.actionButtons.classList.remove('hidden');
        this.subMenu.classList.add('hidden');
    }
    
    /**
     * Hide action buttons
     */
    hideActionButtons() {
        this.actionButtons.classList.add('hidden');
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
        if (percent > 50) {
            this.hpBar.style.backgroundColor = '#ffff00'; // Yellow
        } else if (percent > 20) {
            this.hpBar.style.backgroundColor = '#ff9900'; // Orange
        } else {
            this.hpBar.style.backgroundColor = '#ff0000'; // Red
        }
    }
    
    /**
     * Flash screen effect (for damage)
     * @param {string} color - Flash color
     * @param {number} duration - Duration in ms
     */
    flashScreen(color = 'rgba(255, 0, 0, 0.5)', duration = 200) {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = color;
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '9999';
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, duration);
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
