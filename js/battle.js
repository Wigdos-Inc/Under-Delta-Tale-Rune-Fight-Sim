/**
 * battle.js
 * Main battle system - coordinates all battle elements
 */

import { CONFIG } from './config.js';
import { TIMING, COMBAT } from './constants.js';
import { Soul } from './soul.js';
import { Enemy, loadEnemyFromJSON } from './enemy.js';
import { collisionManager } from './collision.js';
import { uiManager } from './ui.js';
import { UIRenderer } from './uiRenderer.js';
import { audioManager } from './audio.js';
import { InputManager } from './utils.js';
import { gameModeManager } from './gameMode.js';
import { battleState, BATTLE_STATES } from './battleState.js';
import { SpriteRenderer } from './spriteRenderer.js';

/**
 * Battle class - Main battle controller
 */
export class Battle {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.input = new InputManager();
        
        // Battle state (using state machine)
        // Legacy phase kept for backward compatibility
        this.phase = CONFIG.PHASE.MENU;
        
        this.playerHP = CONFIG.HP.current;
        this.maxHP = CONFIG.HP.max;
        this.playerTP = 0; // Deltarune TP system
        this.maxTP = 100;
        
        // Battle components
        this.soul = new Soul(
            CONFIG.BATTLE_BOX.x + CONFIG.BATTLE_BOX.width / 2,
            CONFIG.BATTLE_BOX.y + CONFIG.BATTLE_BOX.height / 2
        );
        
        this.enemy = null;
        this.currentAttackPattern = null;
        this.turnCount = 0;
        
        // Visual effects
        this.damageNumbers = [];
        this.screenFlash = 0;
        this.battleBoxPulse = 0;
        this.flavorText = '';
        this.flavorTextTimer = 0;
        
        // Death and game over animations
        this.dustCloudAnimation = null; // {x, y, frame, timer}
        this.heartBreakAnimation = null; // {x, y, frame, timer}
        
        // UI Renderer for sprite-based UI
        this.uiRenderer = new UIRenderer(this.canvas);
        
        // Sprite Renderer for authentic Undertale graphics
        this.spriteRenderer = new SpriteRenderer(this.canvas);
        
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
        // Initialize battle state
        battleState.setState(BATTLE_STATES.INTRO);
        
        this.enemy = await loadEnemyFromJSON(enemyPath);
        this.turnCount = 0;
        this.playerHP = this.maxHP;
        
        // Show initial dialogue
        uiManager.showDialogue(`* ${this.enemy.getDialogue()}`);
        uiManager.updateHP(this.playerHP, this.maxHP);
        
        // Wait a moment then show action menu
        setTimeout(() => {
            this.startPlayerTurn();
        }, TIMING.DIALOGUE_DELAY);
    }
    
    /**
     * Start player's turn (show action buttons)
     */
    startPlayerTurn() {
        // Transition to player turn
        battleState.setState(BATTLE_STATES.PLAYER_TURN_START);
        
        this.phase = CONFIG.PHASE.MENU; // Legacy
        this.soul.reset(CONFIG.BATTLE_BOX);
        
        // Transition to menu selection state
        battleState.setState(BATTLE_STATES.MENU_SELECTION);
        
        uiManager.showActionButtons();
        uiManager.showDialogue('* What will you do?');
    }
    
    /**
     * Handle action button clicks
     * @param {string} action - Action type (fight/act/item/mercy)
     */
    handleAction(action) {
        // Guard: Only allow actions during menu selection
        if (!battleState.canSelectMenuOption()) {
            console.warn(`Cannot perform action ${action} in state ${battleState.getState()}`);
            return;
        }
        
        // Transition to action processing state
        battleState.setState(BATTLE_STATES.ACTION_PROCESSING);
        
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
        // Guard: Only allow during action processing
        if (battleState.getState() !== BATTLE_STATES.ACTION_PROCESSING) {
            console.warn('Cannot fight in current state');
            return;
        }
        
        battleState.setState(BATTLE_STATES.FIGHT_ANIMATION);
        
        // Simple damage calculation (in a full game, this would have a timing minigame)
        const damage = Math.floor(Math.random() * COMBAT.BASE_ATTACK_DAMAGE_MAX) + COMBAT.BASE_ATTACK_DAMAGE_MIN;
        const actualDamage = this.enemy.takeDamage(damage);
        
        // Show sprite-based damage number above enemy
        const enemyX = this.canvas.width / 2;
        const enemyY = CONFIG.ENEMY_POSITION.y;
        this.spriteRenderer.addFloatingDamage(actualDamage, enemyX, enemyY, false);
        
        uiManager.showDialogue(`* You attack ${this.enemy.name} for ${actualDamage} damage!`);
        audioManager.playSound('attack');
        
        setTimeout(() => {
            if (this.enemy.isDefeated()) {
                this.handleVictory();
            } else {
                this.startEnemyTurn();
            }
        }, TIMING.DIALOGUE_DELAY);
    }
    
    /**
     * Handle ACT action
     */
    handleAct() {
        // Guard: Only allow during action processing
        if (battleState.getState() !== BATTLE_STATES.ACTION_PROCESSING) {
            console.warn('Cannot act in current state');
            return;
        }
        
        battleState.setState(BATTLE_STATES.DIALOGUE_DISPLAY);
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
                }, TIMING.DIALOGUE_DELAY);
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
                    this.playerHP = Math.min(this.maxHP, this.playerHP + COMBAT.ITEM_BANDAGE_HEALING);
                    uiManager.updateHP(this.playerHP, this.maxHP);
                    uiManager.showDialogue(`* You used a Bandage. Recovered ${COMBAT.ITEM_BANDAGE_HEALING} HP!`);
                    
                    setTimeout(() => {
                        this.startEnemyTurn();
                    }, TIMING.ITEM_USE_DELAY);
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
                        }, TIMING.DIALOGUE_DELAY);
                    } else {
                        uiManager.showDialogue(`* ${this.enemy.name} is not ready to be spared.`);
                        setTimeout(() => {
                            this.startEnemyTurn();
                        }, TIMING.DIALOGUE_DELAY);
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
                    }, TIMING.DIALOGUE_DELAY);
                }
            }
        ];
        
        uiManager.showSubMenu(options);
    }
    
    /**
     * Start enemy's turn (attack phase)
     */
    startEnemyTurn() {
        // Transition to enemy turn
        battleState.setState(BATTLE_STATES.ENEMY_TURN_START);
        this.phase = CONFIG.PHASE.ENEMY_ATTACK; // Legacy
        this.turnCount++;
        
        // Show enemy dialogue
        battleState.setState(BATTLE_STATES.ENEMY_DIALOGUE);
        uiManager.showDialogue(`* ${this.enemy.getDialogue()}`);
        
        // Set flavor text
        this.setFlavorText(this.getRandomFlavorText());
        
        // Start attack pattern after brief delay
        setTimeout(() => {
            battleState.setState(BATTLE_STATES.ENEMY_ATTACKING);
            this.currentAttackPattern = this.enemy.getNextAttackPattern();
            this.currentAttackPattern.start();
            this.battleBoxPulse = 1;
            
            // Transition to dodging phase
            battleState.setState(BATTLE_STATES.DODGING);
        }, TIMING.ATTACK_START_DELAY);
    }
    
    /**
     * Get random flavor text for attacks
     */
    getRandomFlavorText() {
        const texts = [
            'Watch out!',
            'Stay focused!',
            'Keep moving!',
            'Don\'t give up!',
            'You can do this!',
            'Stay determined!'
        ];
        return texts[Math.floor(Math.random() * texts.length)];
    }
    
    /**
     * Set flavor text with timer
     */
    setFlavorText(text) {
        this.flavorText = text;
        this.flavorTextTimer = 180; // 3 seconds at 60fps
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
        
        // Screen flash
        this.screenFlash = 0.5;
        
        // Spawn damage number
        this.spawnDamageNumber(data.damage, this.soul.x, this.soul.y);
        
        if (this.playerHP <= 0) {
            this.handleGameOver();
        }
    }
    
    /**
     * Spawn floating damage number
     */
    spawnDamageNumber(damage, x, y) {
        this.damageNumbers.push({
            damage: Math.floor(damage),
            x: x,
            y: y,
            life: 60,
            vy: -2
        });
    }
    
    /**
     * Handle victory
     */
    handleVictory() {
        battleState.setState(BATTLE_STATES.VICTORY);
        
        // Start dust cloud animation at enemy position
        const enemyX = this.canvas.width / 2;
        const enemyY = CONFIG.ENEMY_POSITION.y;
        this.dustCloudAnimation = {
            x: enemyX,
            y: enemyY,
            frame: 0,
            timer: 0,
            frameDuration: 150 // ms per frame
        };
        
        uiManager.showDialogue(`* YOU WON!\n* You earned ${this.enemy.exp} XP and ${this.enemy.gold} GOLD.`);
        setTimeout(() => {
            this.endBattle();
        }, TIMING.VICTORY_DELAY);
    }
    
    /**
     * Handle game over
     */
    handleGameOver() {
        battleState.setState(BATTLE_STATES.DEFEAT);
        
        // Start heart break animation at soul position
        this.heartBreakAnimation = {
            x: this.soul.x,
            y: this.soul.y,
            frame: 0,
            timer: 0,
            frameDuration: 150 // ms per frame
        };
        
        this.phase = CONFIG.PHASE.MENU; // Legacy
        uiManager.showDialogue('* You died...');
        this.playerHP = 0;
        
        setTimeout(() => {
            uiManager.showDialogue('* Game Over.');
            this.showReturnButton();
        }, TIMING.GAME_OVER_DELAY);
    }
    
    /**
     * End battle
     */
    endBattle() {
        battleState.setState(BATTLE_STATES.IDLE);
        this.phase = CONFIG.PHASE.MENU; // Legacy
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
        }, TIMING.RETURN_BUTTON_DELAY);
    }
    
    /**
     * Update battle state
     */
    update() {
        // Update UI animations
        this.uiRenderer.update();
        this.spriteRenderer.update(16); // Assuming ~60fps (16ms per frame)
        
        // Update UI text animation
        uiManager.updateDialogue();
        
        // Update enemy animation
        if (this.enemy) {
            this.enemy.update();
        }
        
        // Update visual effects
        this.updateVisualEffects();
        
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
     * Update visual effects
     */
    updateVisualEffects() {
        // Update damage numbers
        this.damageNumbers = this.damageNumbers.filter(num => {
            num.y += num.vy;
            num.life--;
            num.vy *= 0.95; // Slow down
            return num.life > 0;
        });
        
        // Update screen flash
        if (this.screenFlash > 0) {
            this.screenFlash -= 0.05;
        }
        
        // Update battle box pulse
        if (this.battleBoxPulse > 0) {
            this.battleBoxPulse -= 0.02;
        }
        
        // Update flavor text timer
        if (this.flavorTextTimer > 0) {
            this.flavorTextTimer--;
        }
        
        // Update dust cloud animation (enemy defeat)
        if (this.dustCloudAnimation) {
            this.dustCloudAnimation.timer += 16; // ~60fps
            if (this.dustCloudAnimation.timer >= this.dustCloudAnimation.frameDuration) {
                this.dustCloudAnimation.frame++;
                this.dustCloudAnimation.timer = 0;
                
                // Dust cloud has 3 frames (0-2), stop after last frame
                if (this.dustCloudAnimation.frame > 2) {
                    this.dustCloudAnimation = null;
                }
            }
        }
        
        // Update heart break animation (game over)
        if (this.heartBreakAnimation) {
            this.heartBreakAnimation.timer += 16; // ~60fps
            if (this.heartBreakAnimation.timer >= this.heartBreakAnimation.frameDuration) {
                this.heartBreakAnimation.frame++;
                this.heartBreakAnimation.timer = 0;
                
                // Heart break animation frames (break → shards)
                // Keep showing final frame
                if (this.heartBreakAnimation.frame > 5) {
                    this.heartBreakAnimation.frame = 5; // Hold on shards
                }
            }
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
        
        // Set soul target for homing projectiles (TODO #4)
        const activeObjects = this.currentAttackPattern.getActiveObjects();
        activeObjects.forEach(obj => {
            if (obj.type === 'homing_projectile' && obj.setTarget) {
                obj.setTarget(this.soul);
            }
        });
        
        // Store previous collision state for TP gain detection
        const hadCollision = this.soul.invincible;
        
        // Check collisions
        collisionManager.checkCollisions(this.soul, activeObjects);
        
        // Grant TP in Deltarune mode for successful dodging
        if (gameModeManager.getMode() === 'deltarune') {
            // If we're not invincible and there are active attacks nearby, grant small TP
            if (activeObjects.length > 0 && !hadCollision) {
                this.playerTP = Math.min(this.maxTP, this.playerTP + 0.1);
            }
        }
        
        // Check if attack phase is complete
        if (!this.currentAttackPattern.isActive) {
            this.currentAttackPattern = null;
            
            // Return to player turn
            setTimeout(() => {
                this.startPlayerTurn();
            }, TIMING.TURN_TRANSITION_DELAY);
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
     * Draw battle
     */
    draw() {
        const ctx = this.ctx;
        
        // Draw battle background sprite
        this.spriteRenderer.drawBattleBackground(
            0, 0, 
            this.canvas.width, 
            this.canvas.height
        );
        
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
        
        // Draw dust cloud animation (enemy defeat)
        if (this.dustCloudAnimation) {
            this.spriteRenderer.drawDustCloud(
                this.dustCloudAnimation.x,
                this.dustCloudAnimation.y,
                this.dustCloudAnimation.frame
            );
        }
        
        // Draw battle box with sprite border
        this.spriteRenderer.drawBattleBox(
            CONFIG.BATTLE_BOX.x,
            CONFIG.BATTLE_BOX.y,
            CONFIG.BATTLE_BOX.width,
            CONFIG.BATTLE_BOX.height
        );
        
        // Draw attacks during attack phase
        if (this.phase === CONFIG.PHASE.ENEMY_ATTACK) {
            if (this.currentAttackPattern) {
                this.currentAttackPattern.draw(ctx);
            }
            this.soul.draw(ctx);
        }
        
        // Draw heart break animation (game over)
        if (this.heartBreakAnimation) {
            this.spriteRenderer.drawHeartBreak(
                this.heartBreakAnimation.x,
                this.heartBreakAnimation.y,
                this.heartBreakAnimation.frame
            );
        }
        
        ctx.restore();
        
        // Draw visual effects
        this.drawVisualEffects(ctx);
        
        // Draw sprite-based damage numbers
        this.spriteRenderer.renderDamageNumbers();
        
        // Draw sprite-based UI elements
        if (this.enemy) {
            this.uiRenderer.drawHPBar(this.playerHP, this.maxHP);
            this.uiRenderer.drawTPBar(this.playerTP, this.maxTP);
            this.uiRenderer.drawEnemyName(this.enemy.name);
        }
        
        // Draw flavor text during attacks
        if (this.flavorTextTimer > 0 && this.phase === CONFIG.PHASE.ENEMY_ATTACK) {
            this.drawFlavorText(ctx);
        }
        
        // Draw action buttons (menu phase)
        if (this.phase === CONFIG.PHASE.MENU) {
            this.uiRenderer.drawActionButtons();
            
            // Draw soul cursor sprite at selected button position
            const soulPos = uiManager.getSoulCursorPosition();
            if (soulPos.visible) {
                // Offset to left of button (matching old HTML position)
                this.spriteRenderer.drawSoulCursor(
                    soulPos.x - 40, // Move left of button
                    soulPos.y + 20, // Center vertically with button
                    1.5 // Scale slightly larger
                );
            }
        }
    }
    
    /**
     * Draw visual effects
     */
    drawVisualEffects(ctx) {
        // Draw screen flash
        if (this.screenFlash > 0) {
            ctx.fillStyle = `rgba(255, 0, 0, ${this.screenFlash * 0.3})`;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Draw damage numbers
        this.damageNumbers.forEach(num => {
            const alpha = num.life / 60;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = 'bold 24px Determination Mono, monospace';
            ctx.fillStyle = '#ff0000';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.strokeText(num.damage.toString(), num.x, num.y);
            ctx.fillText(num.damage.toString(), num.x, num.y);
            ctx.restore();
        });
    }
    
    /**
     * Draw flavor text
     */
    drawFlavorText(ctx) {
        const alpha = Math.min(1, this.flavorTextTimer / 60);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = 'bold 18px Determination Mono, monospace';
        ctx.fillStyle = '#ffff00';
        ctx.textAlign = 'center';
        ctx.fillText(this.flavorText, this.canvas.width / 2, 100);
        ctx.restore();
    }
    
    /**
     * Draw battle box
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawBattleBox(ctx) {
        const box = CONFIG.BATTLE_BOX;
        
        // Apply pulse effect during attacks
        const scale = 1 + (this.battleBoxPulse * 0.05);
        const offsetX = (box.width * (scale - 1)) / 2;
        const offsetY = (box.height * (scale - 1)) / 2;
        
        ctx.save();
        if (this.battleBoxPulse > 0) {
            ctx.globalAlpha = 0.8 + (this.battleBoxPulse * 0.2);
        }
        
        // Use UIRenderer's battle box method for proper styling
        this.uiRenderer.drawBattleBox(
            box.x - offsetX, 
            box.y - offsetY, 
            box.width * scale, 
            box.height * scale
        );
        
        ctx.restore();
    }
}
