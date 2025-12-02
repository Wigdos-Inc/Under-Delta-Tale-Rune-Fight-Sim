/**
 * soul.js
 * Player SOUL (heart) movement and rendering
 */

import { CONFIG } from './config.js';
import { clamp } from './utils.js';

/**
 * Soul class - Represents the player's heart
 */
export class Soul {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = CONFIG.SOUL.size;
        this.speed = CONFIG.SOUL.speed;
        this.color = CONFIG.SOUL.color;
        
        // Invincibility after being hit
        this.invincible = false;
        this.invincibilityTimer = 0;
        
        // For animation
        this.angle = 0;
    }
    
    /**
     * Update soul position based on input
     * @param {Object} input - Input manager instance
     * @param {Object} bounds - Battle box bounds {x, y, width, height}
     */
    update(input, bounds) {
        // Update invincibility
        if (this.invincible) {
            this.invincibilityTimer--;
            if (this.invincibilityTimer <= 0) {
                this.invincible = false;
            }
        }
        
        // Movement with arrow keys or WASD
        let dx = 0;
        let dy = 0;
        
        if (input.isAnyPressed(['arrowleft', 'a'])) dx -= this.speed;
        if (input.isAnyPressed(['arrowright', 'd'])) dx += this.speed;
        if (input.isAnyPressed(['arrowup', 'w'])) dy -= this.speed;
        if (input.isAnyPressed(['arrowdown', 's'])) dy += this.speed;
        
        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707; // 1/sqrt(2)
            dy *= 0.707;
        }
        
        // Update position
        this.x += dx;
        this.y += dy;
        
        // Keep within battle box bounds
        const halfSize = this.size / 2;
        this.x = clamp(this.x, bounds.x + halfSize, bounds.x + bounds.width - halfSize);
        this.y = clamp(this.y, bounds.y + halfSize, bounds.y + bounds.height - halfSize);
        
        // Update animation
        this.angle += 0.05;
    }
    
    /**
     * Draw the soul
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        ctx.save();
        
        // Flash when invincible
        if (this.invincible && Math.floor(this.invincibilityTimer / 5) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // Draw heart shape
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        
        // Simple heart shape using bezier curves
        const size = this.size;
        ctx.beginPath();
        ctx.moveTo(0, -size / 4);
        ctx.bezierCurveTo(-size / 2, -size / 2, -size / 2, size / 6, 0, size / 2);
        ctx.bezierCurveTo(size / 2, size / 6, size / 2, -size / 2, 0, -size / 4);
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * Get bounding box for collision detection
     * @returns {Object} Bounding box {x, y, width, height}
     */
    getBounds() {
        return {
            x: this.x - this.size / 2,
            y: this.y - this.size / 2,
            width: this.size,
            height: this.size
        };
    }
    
    /**
     * Reset soul to center position
     * @param {Object} battleBox - Battle box configuration
     */
    reset(battleBox) {
        this.x = battleBox.x + battleBox.width / 2;
        this.y = battleBox.y + battleBox.height / 2;
        this.invincible = false;
        this.invincibilityTimer = 0;
    }
    
    /**
     * Make soul invincible for a short time
     */
    makeInvincible() {
        this.invincible = true;
        this.invincibilityTimer = CONFIG.SOUL.invincibilityTime / CONFIG.ANIMATION.msPerFrame; // Convert to frames
    }
    
    /**
     * Check if soul is currently invincible
     * @returns {boolean} True if invincible
     */
    isInvincible() {
        return this.invincible;
    }
}
