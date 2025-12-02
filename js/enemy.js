/**
 * enemy.js
 * Enemy class with attack patterns and dialogue
 */

import { AttackPattern } from './attacks.js';
import { COMBAT, SPRITE } from './constants.js';
import { spriteManager, AnimatedSprite } from './sprites.js';

/**
 * Enemy class - Represents an enemy with attacks and dialogue
 */
export class Enemy {
    constructor(data) {
        this.name = data.name || 'Enemy';
        this.hp = data.hp || COMBAT.DEFAULT_ENEMY_HP;
        this.maxHp = data.hp || COMBAT.DEFAULT_ENEMY_HP;
        this.attack = data.attack || COMBAT.DEFAULT_ENEMY_ATTACK;
        this.defense = data.defense || COMBAT.DEFAULT_ENEMY_DEFENSE;
        this.gold = data.gold || 0;
        this.exp = data.exp || 0;
        this.dialogue = data.dialogue || ['...'];
        this.checkText = data.checkText || 'Just an enemy.';
        this.canSpare = false;
        this.spareThreshold = data.spareThreshold || 0; // Mercy percentage (0-100)
        
        // Acts available for this enemy
        this.acts = data.acts || [
            { name: 'Check', effect: 'check' },
            { name: 'Talk', effect: 'talk' }
        ];
        
        // Load sprites
        this.sprites = data.sprites || {};
        this.spriteAnimation = null;
        if (this.sprites.idle && Array.isArray(this.sprites.idle)) {
            this.spriteAnimation = new AnimatedSprite(this.sprites.idle, SPRITE.DEFAULT_FRAME_RATE);
            // Preload sprites
            spriteManager.loadSprites(this.sprites.idle);
        } else if (this.sprites.idle) {
            spriteManager.loadSprite(this.sprites.idle);
        }
        
        // Load attack patterns
        this.attackPatterns = [];
        if (data.attackPatterns) {
            data.attackPatterns.forEach(patternData => {
                this.attackPatterns.push(new AttackPattern(patternData));
            });
        }
        
        this.currentPatternIndex = 0;
        this.mercy = 0; // Mercy meter (0-100)
    }
    
    /**
     * Get random dialogue
     * @returns {string} Random dialogue line
     */
    getDialogue() {
        return this.dialogue[Math.floor(Math.random() * this.dialogue.length)];
    }
    
    /**
     * Get next attack pattern
     * @returns {AttackPattern} Attack pattern
     */
    getNextAttackPattern() {
        if (this.attackPatterns.length === 0) {
            // Create default pattern if none exist
            return new AttackPattern({
                name: 'Default',
                duration: 3000,
                waves: [
                    { time: 0, type: 'projectiles', count: 3, speed: 2, side: 'top' }
                ]
            });
        }
        
        const pattern = this.attackPatterns[this.currentPatternIndex];
        this.currentPatternIndex = (this.currentPatternIndex + 1) % this.attackPatterns.length;
        pattern.reset(); // Reset pattern for reuse
        return pattern;
    }
    
    /**
     * Take damage
     * @param {number} damage - Amount of damage
     * @returns {number} Actual damage taken
     */
    takeDamage(damage) {
        const actualDamage = Math.max(COMBAT.MIN_DAMAGE, damage - this.defense);
        this.hp = Math.max(0, this.hp - actualDamage);
        return actualDamage;
    }
    
    /**
     * Check if enemy is defeated
     * @returns {boolean} True if HP is 0
     */
    isDefeated() {
        return this.hp <= 0;
    }
    
    /**
     * Check if enemy can be spared
     * @returns {boolean} True if can be spared
     */
    canBeSpared() {
        return this.canSpare || (this.hp / this.maxHp) <= this.spareThreshold;
    }
    
    /**
     * Perform an act
     * @param {string} actName - Name of the act
     * @returns {Object} Result of the act {text, effect}
     */
    performAct(actName) {
        const act = this.acts.find(a => a.name === actName);
        if (!act) return { text: 'Nothing happened.', effect: 'none' };
        
        let text = '';
        let effect = act.effect;
        
        switch (act.effect) {
            case 'check':
                text = this.checkText;
                break;
            case 'talk':
            case 'compliment':
            case 'console':
            case 'threaten':
            case 'terrorize':
                text = act.text || `You used ${actName}!`;
                this.mercy += act.mercyIncrease || COMBAT.DEFAULT_MERCY_INCREASE;
                if (this.mercy >= COMBAT.MAX_MERCY) {
                    this.canSpare = true;
                }
                break;
            default:
                text = act.text || `You used ${actName}!`;
                this.mercy += act.mercyIncrease || COMBAT.DEFAULT_MERCY_INCREASE;
                if (this.mercy >= COMBAT.MAX_MERCY) {
                    this.canSpare = true;
                }
        }
        
        return { text, effect };
    }
    
    /**
     * Update enemy animation
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime = 16.67) {
        if (this.spriteAnimation) {
            this.spriteAnimation.update(deltaTime);
        }
    }
    
    /**
     * Draw enemy sprite
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    draw(ctx, x, y) {
        ctx.save();
        
        // Draw sprite
        if (this.spriteAnimation) {
            this.spriteAnimation.draw(ctx, spriteManager, x, y, SPRITE.DEFAULT_SCALE);
        } else if (this.sprites.idle) {
            spriteManager.drawSprite(ctx, this.sprites.idle, x, y, SPRITE.DEFAULT_SCALE);
        } else {
            // Fallback placeholder
            ctx.translate(x, y);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, 30, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // HP bar above enemy (only show if damaged)
        if (this.hp < this.maxHp) {
            const barWidth = 80;
            const barHeight = 6;
            const hpPercent = this.hp / this.maxHp;
            
            ctx.fillStyle = '#8b0000';
            ctx.fillRect(x - barWidth / 2, y - 80, barWidth, barHeight);
            
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(x - barWidth / 2, y - 80, barWidth * hpPercent, barHeight);
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(x - barWidth / 2, y - 80, barWidth, barHeight);
        }
        
        ctx.restore();
    }
}

/**
 * Load enemy from JSON data
 * @param {string} path - Path to JSON file
 * @returns {Promise<Enemy>} Enemy instance
 */
export async function loadEnemyFromJSON(path) {
    try {
        const response = await fetch(path);
        const data = await response.json();
        return new Enemy(data);
    } catch (error) {
        console.error('Failed to load enemy:', error);
        // Return default enemy
        return new Enemy({
            name: 'Test Enemy',
            hp: 50,
            dialogue: ['* Test enemy appears!']
        });
    }
}
