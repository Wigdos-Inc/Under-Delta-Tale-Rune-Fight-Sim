/**
 * battle.js
 * Main battle system - coordinates all battle elements
 */

import { CONFIG } from './config.js';
import { Soul } from './soul.js';
import { Enemy, loadEnemyFromJSON } from './enemy.js';
import { collisionManager } from './collision.js';
import { uiManager } from './ui.js';
import { UIRenderer } from './uiRenderer.js';
import { audioManager } from './audio.js';
import { InputManager } from './utils.js';

/**
 * Battle class - Main battle controller
 */
export class Battle {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.input = new InputManager();
        
        // Battle state
        this.phase = CONFIG.PHASE.MENU;
        this.playerHP = CONFIG.HP.current;
        this.maxHP = CONFIG.HP.max;
        
        // Battle components
        this.soul = new Soul(
            CONFIG.BATTLE_BOX.x + CONFIG.BATTLE_BOX.width / 2,
            CONFIG.BATTLE_BOX.y + CONFIG.BATTLE_BOX.height / 2
        );
        
        this.enemy = null;
        this.currentAttackPattern = null;
        this.turnCount = 0;
        
        // UI Renderer for sprite-based UI
        this.uiRenderer = new UIRenderer(this.canvas);
        
        // Setup collision detection
        collisionManager.onCollision((data) => {
            this.handlePlayerHit(data);
        });
        
        // Setup UI callbacks
        uiManager.setActionCallback((action) => this.handleAction(action));
        
        // Setup canvas click handler for sprite buttons
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // Setup canvas mousemove for hover effects
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Battle box shake effect
        this.shakeAmount = 0;
        this.shakeDecay = 0.9;
    }
    
    /**
     * Start battle with an enemy
     * @param {string} enemyPath - Path to enemy JSON file
     */
    async startBattle(enemyPath) {
        this.enemy = await loadEnemyFromJSON(enemyPath);
        this.turnCount = 0;
        this.playerHP = this.maxHP;
        
        // Show initial dialogue
        uiManager.showDialogue(`* ${this.enemy.getDialogue()}`);
        uiManager.updateHP(this.playerHP, this.maxHP);
        
        // Wait a moment then show action menu
        setTimeout(() => {
            this.startPlayerTurn();
        }, 2000);
    }
    
    /**
     * Start player's turn (show action buttons)
     */
    startPlayerTurn() {
        this.phase = CONFIG.PHASE.MENU;
        this.soul.reset(CONFIG.BATTLE_BOX);
        uiManager.showActionButtons();
        uiManager.showDialogue('* What will you do?');
    }
    
    /**
     * Handle action button clicks
     * @param {string} action - Action type (fight/act/item/mercy)
     */
    handleAction(action) {
        uiManager.hideActionButtons();
        
        switch (action) {
            case 'fight':
                this.handleFight();
                break;
            case 'act':
                this.handleAct();
                break;
            case 'item':
                this.handleItem();
                break;
            case 'mercy':
                this.handleMercy();
                break;
        }
    }
    
    /**
     * Handle FIGHT action
     */
    handleFight() {
        // Simple damage calculation (in a full game, this would have a timing minigame)
        const damage = Math.floor(Math.random() * 10) + 5;
        const actualDamage = this.enemy.takeDamage(damage);
        
        uiManager.showDialogue(`* You attack ${this.enemy.name} for ${actualDamage} damage!`);
        audioManager.playSound('attack');
        
        setTimeout(() => {
            if (this.enemy.isDefeated()) {
                this.handleVictory();
            } else {
                this.startEnemyTurn();
            }
        }, 2000);
    }
    
    /**
     * Handle ACT action
     */
    handleAct() {
        const acts = this.enemy.acts;
        
        uiManager.showSubMenu(acts.map(act => ({
            name: act.name,
            callback: () => {
                uiManager.hideSubMenu();
                const result = this.enemy.performAct(act.name);
                uiManager.showDialogue(`* ${result.text}`);
                audioManager.playSound('select');
                
                setTimeout(() => {
                    this.startEnemyTurn();
                }, 2000);
            }
        })));
    }
    
    /**
     * Handle ITEM action
     */
    handleItem() {
        // Simple item menu (placeholder)
        const items = [
            {
                name: 'Bandage - Heals 10 HP',
                callback: () => {
                    uiManager.hideSubMenu();
                    this.playerHP = Math.min(this.maxHP, this.playerHP + 10);
                    uiManager.updateHP(this.playerHP, this.maxHP);
                    uiManager.showDialogue('* You used a Bandage. Recovered 10 HP!');
                    
                    setTimeout(() => {
                        this.startEnemyTurn();
                    }, 2000);
                }
            }
        ];
        
        uiManager.showSubMenu(items);
    }
    
    /**
     * Handle MERCY action
     */
    handleMercy() {
        const options = [
            {
                name: 'Spare',
                callback: () => {
                    uiManager.hideSubMenu();
                    
                    if (this.enemy.canBeSpared()) {
                        uiManager.showDialogue(`* You spared ${this.enemy.name}.`);
                        setTimeout(() => {
                            this.handleVictory();
                        }, 2000);
                    } else {
                        uiManager.showDialogue(`* ${this.enemy.name} is not ready to be spared.`);
                        setTimeout(() => {
                            this.startEnemyTurn();
                        }, 2000);
                    }
                }
            },
            {
                name: 'Flee',
                callback: () => {
                    uiManager.hideSubMenu();
                    uiManager.showDialogue('* You fled from the battle!');
                    setTimeout(() => {
                        this.endBattle();
                    }, 2000);
                }
            }
        ];
        
        uiManager.showSubMenu(options);
    }
    
    /**
     * Start enemy's turn (attack phase)
     */
    startEnemyTurn() {
        this.phase = CONFIG.PHASE.ENEMY_ATTACK;
        this.turnCount++;
        
        // Show enemy dialogue
        uiManager.showDialogue(`* ${this.enemy.getDialogue()}`);
        
        // Start attack pattern after brief delay
        setTimeout(() => {
            this.currentAttackPattern = this.enemy.getNextAttackPattern();
            this.currentAttackPattern.start();
        }, 1500);
    }
    
    /**
     * Handle player getting hit
     * @param {Object} data - Collision data
     */
    handlePlayerHit(data) {
        this.playerHP -= data.damage;
        uiManager.updateHP(this.playerHP, this.maxHP);
        uiManager.flashScreen('rgba(255, 0, 0, 0.5)', 200);
        audioManager.playSound('hurt');
        
        // Shake effect
        this.shakeAmount = CONFIG.ANIMATION.shakeIntensity;
        
        if (this.playerHP <= 0) {
            this.handleGameOver();
        }
    }
    
    /**
     * Handle victory
     */
    handleVictory() {
        uiManager.showDialogue(`* YOU WON!\n* You earned ${this.enemy.exp} XP and ${this.enemy.gold} GOLD.`);
        setTimeout(() => {
            this.endBattle();
        }, 3000);
    }
    
    /**
     * Handle game over
     */
    handleGameOver() {
        this.phase = CONFIG.PHASE.MENU;
        uiManager.showDialogue('* You died...');
        this.playerHP = 0;
        
        setTimeout(() => {
            uiManager.showDialogue('* Game Over.');
            this.showReturnButton();
        }, 2000);
    }
    
    /**
     * End battle
     */
    endBattle() {
        this.phase = CONFIG.PHASE.MENU;
        uiManager.showDialogue('* Battle ended.');
        this.showReturnButton();
    }
    
    /**
     * Show return to menu button
     */
    showReturnButton() {
        setTimeout(() => {
            const btn = document.createElement('button');
            btn.textContent = 'Return to Menu';
            btn.className = 'return-menu-btn';
            btn.onclick = () => {
                btn.remove();
                if (window.game && window.game.returnToMenu) {
                    window.game.returnToMenu();
                } else {
                    location.reload();
                }
            };
            document.getElementById('battle-ui').appendChild(btn);
        }, 1000);
    }
    
    /**
     * Update battle state
     */
    update() {
        // Update UI animations
        this.uiRenderer.update();
        
        // Update UI text animation
        uiManager.updateDialogue();
        
        // Update enemy animation
        if (this.enemy) {
            this.enemy.update();
        }
        
        // Update based on phase
        switch (this.phase) {
            case CONFIG.PHASE.ENEMY_ATTACK:
                this.updateAttackPhase();
                break;
        }
        
        // Update shake
        if (this.shakeAmount > 0.1) {
            this.shakeAmount *= this.shakeDecay;
        } else {
            this.shakeAmount = 0;
        }
    }
    
    /**
     * Update attack phase
     */
    updateAttackPhase() {
        if (!this.currentAttackPattern) return;
        
        // Update soul movement
        this.soul.update(this.input, CONFIG.BATTLE_BOX);
        
        // Update attack pattern
        this.currentAttackPattern.update();
        
        // Check collisions
        collisionManager.checkCollisions(this.soul, this.currentAttackPattern.getActiveObjects());
        
        // Check if attack phase is complete
        if (!this.currentAttackPattern.isActive) {
            this.currentAttackPattern = null;
            
            // Return to player turn
            setTimeout(() => {
                this.startPlayerTurn();
            }, 1000);
        }
    }
    
    /**
     * Handle canvas clicks for sprite buttons
     * @param {MouseEvent} e - Mouse event
     */
    handleCanvasClick(e) {
        if (this.phase !== CONFIG.PHASE.MENU) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if click is on any button
        const action = this.uiRenderer.checkButtonClick(x, y);
        if (action) {
            this.handleAction(action);
        }
    }
    
    /**
     * Handle mouse movement for hover effects
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseMove(e) {
        if (this.phase !== CONFIG.PHASE.MENU) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Update hover state
        this.uiRenderer.updateHover(x, y);
        
        // Change cursor if hovering over button
        this.canvas.style.cursor = this.uiRenderer.hoveredButton ? 'pointer' : 'default';
    }
    
    /**
     * Handle mouse movement for hover effects
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseMove(e) {
        if (this.phase !== CONFIG.PHASE.MENU) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Update hover state
        this.uiRenderer.updateHover(x, y);
        
        // Change cursor if hovering over button
        this.canvas.style.cursor = this.uiRenderer.hoveredButton ? 'pointer' : 'default';
    }
    
    /**
     * Draw battle
     */
    draw() {
        const ctx = this.ctx;
        
        // Clear canvas
        ctx.fillStyle = CONFIG.COLORS.background;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply shake effect
        ctx.save();
        if (this.shakeAmount > 0) {
            const shakeX = (Math.random() - 0.5) * this.shakeAmount * 2;
            const shakeY = (Math.random() - 0.5) * this.shakeAmount * 2;
            ctx.translate(shakeX, shakeY);
        }
        
        // Draw enemy
        if (this.enemy) {
            this.enemy.draw(ctx, this.canvas.width / 2, 80);
        }
        
        // Draw battle box
        this.drawBattleBox(ctx);
        
        // Draw attacks during attack phase
        if (this.phase === CONFIG.PHASE.ENEMY_ATTACK) {
            if (this.currentAttackPattern) {
                this.currentAttackPattern.draw(ctx);
            }
            this.soul.draw(ctx);
        }
        
        ctx.restore();
        
        // Draw sprite-based UI elements
        if (this.enemy) {
            this.uiRenderer.drawHPBar(this.playerHP, this.maxHP);
            this.uiRenderer.drawEnemyName(this.enemy.name);
        }
        
        // Draw action buttons (menu phase)
        if (this.phase === CONFIG.PHASE.MENU) {
            this.uiRenderer.drawActionButtons();
        }
    }
    
    /**
     * Draw battle box
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawBattleBox(ctx) {
        const box = CONFIG.BATTLE_BOX;
        
        // Draw border
        ctx.strokeStyle = CONFIG.COLORS.battleBoxBorder;
        ctx.lineWidth = box.borderWidth;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        
        // Draw fill
        ctx.fillStyle = CONFIG.COLORS.battleBox;
        ctx.fillRect(box.x + box.borderWidth, box.y + box.borderWidth, 
                     box.width - box.borderWidth * 2, box.height - box.borderWidth * 2);
    }
}
