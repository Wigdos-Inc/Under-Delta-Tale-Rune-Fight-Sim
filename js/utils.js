/**
 * utils.js
 * Utility functions for common operations
 */

/**
 * Check if two rectangles are colliding
 * @param {Object} rect1 - First rectangle {x, y, width, height}
 * @param {Object} rect2 - Second rectangle {x, y, width, height}
 * @returns {boolean} True if colliding
 */
export function rectCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

/**
 * Check if a point is inside a rectangle
 * @param {number} px - Point x coordinate
 * @param {number} py - Point y coordinate
 * @param {Object} rect - Rectangle {x, y, width, height}
 * @returns {boolean} True if point is inside
 */
export function pointInRect(px, py, rect) {
    return px >= rect.x &&
           px <= rect.x + rect.width &&
           py >= rect.y &&
           py <= rect.y + rect.height;
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Get random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get random float between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random float
 */
export function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Linear interpolation
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Progress (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(start, end, t) {
    return start + (end - start) * t;
}

/**
 * Draw text with typewriter effect
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} text - Text to draw
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} progress - Progress (0-1)
 */
export function drawTypewriterText(ctx, text, x, y, progress) {
    const charsToShow = Math.floor(text.length * progress);
    const visibleText = text.substring(0, charsToShow);
    ctx.fillText(visibleText, x, y);
}

/**
 * Wait for a specified time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after the specified time
 */
export function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if a key is currently pressed
 */
export class InputManager {
    constructor() {
        this.keys = {};
        this.setupListeners();
    }
    
    setupListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    isPressed(key) {
        return this.keys[key.toLowerCase()] || false;
    }
    
    isAnyPressed(keys) {
        return keys.some(key => this.isPressed(key));
    }
}

/**
 * Simple animation class
 */
export class Animation {
    constructor(duration, onUpdate, onComplete) {
        this.duration = duration;
        this.onUpdate = onUpdate;
        this.onComplete = onComplete;
        this.startTime = Date.now();
        this.isComplete = false;
    }
    
    update() {
        if (this.isComplete) return;
        
        const elapsed = Date.now() - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        
        this.onUpdate(progress);
        
        if (progress >= 1) {
            this.isComplete = true;
            if (this.onComplete) this.onComplete();
        }
    }
}
