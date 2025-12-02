/**
 * objectPool.js
 * Object pooling system to reduce garbage collection
 */

/**
 * ObjectPool class - Manages a pool of reusable objects
 */
export class ObjectPool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.available = [];
        this.inUse = new Set();
        
        // Pre-create initial pool
        for (let i = 0; i < initialSize; i++) {
            this.available.push(this.createFn());
        }
    }
    
    /**
     * Get an object from the pool
     * @param {...any} args - Arguments to pass to reset function
     * @returns {Object} Pooled object
     */
    acquire(...args) {
        let obj;
        
        if (this.available.length > 0) {
            obj = this.available.pop();
        } else {
            obj = this.createFn();
        }
        
        this.resetFn(obj, ...args);
        this.inUse.add(obj);
        
        return obj;
    }
    
    /**
     * Return an object to the pool
     * @param {Object} obj - Object to return
     */
    release(obj) {
        if (this.inUse.has(obj)) {
            this.inUse.delete(obj);
            this.available.push(obj);
        }
    }
    
    /**
     * Release all objects currently in use
     */
    releaseAll() {
        this.inUse.forEach(obj => {
            this.available.push(obj);
        });
        this.inUse.clear();
    }
    
    /**
     * Get pool statistics
     * @returns {Object} Pool statistics
     */
    getStats() {
        return {
            available: this.available.length,
            inUse: this.inUse.size,
            total: this.available.length + this.inUse.size
        };
    }
    
    /**
     * Clear the pool
     */
    clear() {
        this.available = [];
        this.inUse.clear();
    }
}

/**
 * Attack object pool manager
 */
export class AttackObjectPool {
    constructor() {
        this.pools = new Map();
    }
    
    /**
     * Get or create a pool for a specific attack type
     * @param {string} type - Attack type
     * @param {Function} createFn - Function to create new objects
     * @param {Function} resetFn - Function to reset objects
     * @returns {ObjectPool} Object pool for the type
     */
    getPool(type, createFn, resetFn) {
        if (!this.pools.has(type)) {
            this.pools.set(type, new ObjectPool(createFn, resetFn));
        }
        return this.pools.get(type);
    }
    
    /**
     * Release all objects in all pools
     */
    releaseAll() {
        this.pools.forEach(pool => pool.releaseAll());
    }
    
    /**
     * Get statistics for all pools
     * @returns {Object} Statistics by type
     */
    getStats() {
        const stats = {};
        this.pools.forEach((pool, type) => {
            stats[type] = pool.getStats();
        });
        return stats;
    }
    
    /**
     * Clear all pools
     */
    clear() {
        this.pools.forEach(pool => pool.clear());
        this.pools.clear();
    }
}

// Global attack object pool
export const attackObjectPool = new AttackObjectPool();
