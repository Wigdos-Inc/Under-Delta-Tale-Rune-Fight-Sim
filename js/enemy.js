/**
 * enemy.js
 * Enemy class with attack patterns and dialogue
 */

import { AttackPattern } from './attacks.js';

/**
 * Enemy class - Represents an enemy with attacks and dialogue
 */
export class Enemy {
    constructor(data) {
        this.name = data.name || 'Enemy';
        this.hp = data.hp || 100;
        this.maxHp = data.hp || 100;
        this.attack = data.attack || 5;
        this.defense = data.defense || 0;
        this.dialogue = data.dialogue || ['...'];
        this.checkText = data.checkText || 'Just an enemy.';
        this.canSpare = false;
        this.spareThreshold = data.spareThreshold || 0.5; // HP percentage
        
        // Acts available for this enemy
        this.acts = data.acts || [
            { name: 'Check', effect: 'check' },
            { name: 'Talk', effect: 'talk' }
        ];
        
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
        const actualDamage = Math.max(1, damage - this.defense);
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
                text = `${this.name} - ATK ${this.attack} DEF ${this.defense}\n${this.checkText}`;
                break;
            case 'talk':
                text = 'You talk to the enemy.';
                this.mercy += 20;
                if (this.mercy >= 100) {
                    this.canSpare = true;
                    text += '\n' + this.name + ' seems more merciful.';
                }
                break;
            case 'compliment':
                text = `You compliment ${this.name}.`;
                this.mercy += 30;
                if (this.mercy >= 100) {
                    this.canSpare = true;
                    text += '\n' + this.name + ' seems pleased.';
                }
                break;
            case 'threaten':
                text = `You threaten ${this.name}.`;
                this.mercy += 10;
                break;
            default:
                text = `You used ${actName}!`;
                this.mercy += 10;
        }
        
        return { text, effect };
    }
    
    /**
     * Draw enemy sprite (placeholder)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    draw(ctx, x, y) {
        // Draw simple placeholder sprite
        ctx.save();
        ctx.translate(x, y);
        
        // Draw a simple monster shape
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, -20, 30, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(-15, -25, 8, 8);
        ctx.fillRect(7, -25, 8, 8);
        
        // Body
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-25, -10, 50, 40);
        
        // HP bar above enemy
        if (this.hp < this.maxHp) {
            const barWidth = 60;
            const barHeight = 8;
            const hpPercent = this.hp / this.maxHp;
            
            ctx.fillStyle = '#8b0000';
            ctx.fillRect(-barWidth / 2, -60, barWidth, barHeight);
            
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(-barWidth / 2, -60, barWidth * hpPercent, barHeight);
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(-barWidth / 2, -60, barWidth, barHeight);
        }
        
        // Draw name
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, 0, 45);
        
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
