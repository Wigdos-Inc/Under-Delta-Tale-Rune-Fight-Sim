/**
 * soul.js
 * Player SOUL (heart) movement and rendering
 */

import { CONFIG } from './config.js';
import { ANIMATION, KEYS } from './constants.js';
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
        this.pulse = 0;
        this.pulseDir = 1;
        
        // Trail effect
        this.trail = [];
        this.maxTrailLength = 5;
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
        
        if (input.isAnyPressed(KEYS.MOVE_LEFT)) dx -= this.speed;
        if (input.isAnyPressed(KEYS.MOVE_RIGHT)) dx += this.speed;
        if (input.isAnyPressed(KEYS.MOVE_UP)) dy -= this.speed;
        if (input.isAnyPressed(KEYS.MOVE_DOWN)) dy += this.speed;
        
        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= ANIMATION.DIAGONAL_SPEED_MULTIPLIER;
            dy *= ANIMATION.DIAGONAL_SPEED_MULTIPLIER;
        }
        
        // Update position
        this.x += dx;
        this.y += dy;
        
        // Keep within battle box bounds
        const halfSize = this.size / 2;
        this.x = clamp(this.x, bounds.x + halfSize, bounds.x + bounds.width - halfSize);
        this.y = clamp(this.y, bounds.y + halfSize, bounds.y + bounds.height - halfSize);
        
        // Add to trail if moving
        if (dx !== 0 || dy !== 0) {
            this.trail.push({ x: this.x, y: this.y, life: this.maxTrailLength });
        }
        
        // Update trail
        this.trail = this.trail.filter(t => {
            t.life--;
            return t.life > 0;
        });
        
        // Update animation
        this.angle += 0.05;
        this.pulse += 0.1 * this.pulseDir;
        if (this.pulse > 1) this.pulseDir = -1;
        if (this.pulse < 0) this.pulseDir = 1;
    }
    
    /**
     * Draw the soul
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        ctx.save();
        
        // Draw trail
        this.trail.forEach((t, i) => {
            const alpha = t.life / this.maxTrailLength;
            ctx.globalAlpha = alpha * 0.3;
            ctx.fillStyle = this.color;
            ctx.translate(t.x, t.y);
            
            const trailSize = this.size * (0.7 + alpha * 0.3);
            ctx.beginPath();
            ctx.moveTo(0, -trailSize / 4);
            ctx.bezierCurveTo(-trailSize / 2, -trailSize / 2, -trailSize / 2, trailSize / 6, 0, trailSize / 2);
            ctx.bezierCurveTo(trailSize / 2, trailSize / 6, trailSize / 2, -trailSize / 2, 0, -trailSize / 4);
            ctx.fill();
            
            ctx.translate(-t.x, -t.y);
        });
        
        ctx.globalAlpha = 1;
        
        // Flash when invincible
        if (this.invincible && Math.floor(this.invincibilityTimer / ANIMATION.INVINCIBILITY_FLASH_INTERVAL) % ANIMATION.INVINCIBILITY_FLASH_DURATION === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // Draw glow
        const glowSize = this.size * (1 + this.pulse * 0.2);
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowSize);
        gradient.addColorStop(0, `${this.color}80`);
        gradient.addColorStop(0.5, `${this.color}40`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - glowSize, this.y - glowSize, glowSize * 2, glowSize * 2);
        
        // Draw heart shape
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        
        // Add subtle pulse
        const scale = 1 + (this.pulse * 0.1);
        ctx.scale(scale, scale);
        
        // Simple heart shape using bezier curves
        const size = this.size;
        ctx.beginPath();
        ctx.moveTo(0, -size / 4);
        ctx.bezierCurveTo(-size / 2, -size / 2, -size / 2, size / 6, 0, size / 2);
        ctx.bezierCurveTo(size / 2, size / 6, size / 2, -size / 2, 0, -size / 4);
        ctx.fill();
        
        // Draw highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(-size / 6, -size / 6, size / 6, 0, Math.PI * 2);
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
