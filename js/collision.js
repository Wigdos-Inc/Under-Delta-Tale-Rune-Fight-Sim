/**
 * collision.js
 * Collision detection system for attacks
 */

import { rectCollision } from './utils.js';

/**
 * CollisionManager class - Handles collision detection between soul and attacks
 */
export class CollisionManager {
    constructor() {
        this.collisionCallbacks = [];
    }
    
    /**
     * Register a callback for collision events
     * @param {Function} callback - Function to call when collision occurs
     */
    onCollision(callback) {
        this.collisionCallbacks.push(callback);
    }
    
    /**
     * Check collision between soul and attack objects
     * @param {Object} soul - Soul instance
     * @param {Array} attackObjects - Array of attack objects
     */
    checkCollisions(soul, attackObjects) {
        if (soul.isInvincible()) return;
        
        const soulBounds = soul.getBounds();
        const soulCenterX = soul.x;
        const soulCenterY = soul.y;
        const soulRadius = Math.max(soulBounds.width, soulBounds.height) / 2;
        
        for (const obj of attackObjects) {
            if (!obj.active) continue;
            
            let isColliding = false;
            
            // Check for custom collision method (e.g., RotatingBeam)
            if (obj.collidesWith && typeof obj.collidesWith === 'function') {
                isColliding = obj.collidesWith(soulCenterX, soulCenterY, soulRadius);
            } else {
                // Standard AABB collision
                const objBounds = obj.getBounds();
                isColliding = rectCollision(soulBounds, objBounds);
            }
            
            if (isColliding) {
                // Check if this is a blue/orange attack
                if (obj.shouldDamage && !obj.shouldDamage(soul)) {
                    // Blue/Orange attack that shouldn't damage - skip collision
                    continue;
                }
                
                // Collision detected!
                this.handleCollision(soul, obj);
            }
        }
    }
    
    /**
     * Handle collision between soul and attack
     * @param {Object} soul - Soul instance
     * @param {Object} attackObj - Attack object
     */
    handleCollision(soul, attackObj) {
        // Make soul invincible temporarily
        soul.makeInvincible();
        
        // Calculate damage
        const damage = attackObj.damage || 1;
        
        // Notify listeners
        this.collisionCallbacks.forEach(callback => {
            callback({
                damage: damage,
                attackType: attackObj.type || 'generic'
            });
        });
    }
    
    /**
     * Clear all collision callbacks
     */
    clear() {
        this.collisionCallbacks = [];
    }
}

export const collisionManager = new CollisionManager();
