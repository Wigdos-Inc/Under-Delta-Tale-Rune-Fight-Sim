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
        
        for (const obj of attackObjects) {
            if (!obj.active) continue;
            
            const objBounds = obj.getBounds();
            
            if (rectCollision(soulBounds, objBounds)) {
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
