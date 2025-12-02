/**
 * soul.js
 * Player SOUL (heart) movement and rendering - ENHANCED WITH MODES
 */

import { CONFIG } from './config.js';
import { ANIMATION, KEYS } from './constants.js';
import { clamp } from './utils.js';
import { RedMode, GreenMode, BlueMode, YellowMode, PurpleMode, SoulMode } from './soulModes.js';

/**
 * Soul class - Represents the player's heart - ENHANCED
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
        
        // Movement tracking for blue/orange attacks
        this.isMoving = false;
        this.lastX = x;
        this.lastY = y;
        
        // SOUL MODES SYSTEM
        this.currentMode = null;
        this.modes = {
            [SoulMode.RED]: new RedMode(this),
            [SoulMode.GREEN]: new GreenMode(this),
            [SoulMode.BLUE]: new BlueMode(this),
            [SoulMode.YELLOW]: new YellowMode(this),
            [SoulMode.PURPLE]: new PurpleMode(this)
        };
        
        // Set default mode
        this.setMode(SoulMode.RED);
    }
    
    /**
     * Update soul position based on input - ENHANCED WITH MODES
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
        
        // Update current mode (handles all movement)
        if (this.currentMode) {
            this.currentMode.update(input, bounds);
            // Update color from mode
            this.color = this.currentMode.getColor();
        }
        
        // Add to trail if moving
        if (this.isMoving) {
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
     * Draw the soul - ENHANCED WITH MODES
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
        
        // Draw mode-specific visuals (shield, ground line, etc.)
        if (this.currentMode) {
            this.currentMode.draw(ctx);
        }
        
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
    
    /**
     * Check if soul is currently moving
     * @returns {boolean} True if moving
     */
    getIsMoving() {
        return this.isMoving;
    }
    
    /**
     * Set soul mode (Red, Green, Blue, Yellow, Purple)
     * @param {string} modeName - Mode name from SoulMode enum
     */
    setMode(modeName) {
        // Exit current mode
        if (this.currentMode) {
            this.currentMode.onExit();
        }
        
        // Set new mode
        if (this.modes[modeName]) {
            this.currentMode = this.modes[modeName];
            this.currentMode.onEnter();
            this.color = this.currentMode.getColor();
        } else {
            console.warn(`Unknown soul mode: ${modeName}`);
        }
    }
    
    /**
     * Get current mode
     * @returns {BaseSoulMode} Current mode instance
     */
    getMode() {
        return this.currentMode;
    }
    
    /**
     * Get current mode name
     * @returns {string} Current mode name
     */
    getModeName() {
        return this.currentMode ? this.currentMode.modeName : SoulMode.RED;
    }
    
    /**
     * Get mode instance by name (for mode-specific operations)
     * @param {string} modeName - Mode name
     * @returns {BaseSoulMode} Mode instance
     */
    getModeInstance(modeName) {
        return this.modes[modeName];
    }
}
