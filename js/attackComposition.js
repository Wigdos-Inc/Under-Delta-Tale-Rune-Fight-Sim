/**
 * attackComposition.js
 * Pattern composition and choreography system for complex attack sequences
 */

import { Timeline, WaveSpawner, ParallelActions } from './attackTiming.js';

/**
 * Pattern composer for combining multiple attack patterns
 */
export class PatternComposer {
    constructor() {
        this.patterns = [];
        this.currentIndex = 0;
        this.transitionDelay = 0;
        this.transitionElapsed = 0;
    }
    
    /**
     * Add a pattern to the composition
     * @param {Object} pattern - Attack pattern
     * @param {number} duration - How long this pattern runs
     * @param {number} transitionDelay - Delay before next pattern
     */
    addPattern(pattern, duration, transitionDelay = 0) {
        this.patterns.push({
            pattern,
            duration,
            transitionDelay,
            elapsed: 0
        });
        return this;
    }
    
    /**
     * Get current pattern
     * @returns {Object|null} Current pattern or null if complete
     */
    getCurrentPattern() {
        if (this.isComplete()) return null;
        
        // Check if in transition
        if (this.transitionElapsed > 0) return null;
        
        return this.patterns[this.currentIndex];
    }
    
    update() {
        if (this.isComplete()) return;
        
        // Handle transition delay
        if (this.transitionElapsed > 0) {
            this.transitionElapsed--;
            if (this.transitionElapsed === 0) {
                this.currentIndex++;
            }
            return;
        }
        
        const current = this.patterns[this.currentIndex];
        if (!current) return;
        
        current.elapsed++;
        
        // Check if pattern duration complete
        if (current.elapsed >= current.duration) {
            this.transitionElapsed = current.transitionDelay;
            if (this.transitionElapsed === 0) {
                this.currentIndex++;
            }
        }
    }
    
    isComplete() {
        return this.currentIndex >= this.patterns.length && this.transitionElapsed === 0;
    }
    
    reset() {
        this.currentIndex = 0;
        this.transitionElapsed = 0;
        this.patterns.forEach(p => p.elapsed = 0);
    }
}

/**
 * Choreographed attack sequence with precise timing
 */
export class AttackChoreography {
    constructor() {
        this.timeline = new Timeline();
        this.spawners = [];
        this.activeObjects = [];
    }
    
    /**
     * Add a spawner at specific frame
     * @param {number} frame - Frame to spawn
     * @param {Function} spawner - Function that returns attack objects
     */
    addSpawn(frame, spawner) {
        this.timeline.addEvent(frame, () => {
            const objects = spawner();
            if (Array.isArray(objects)) {
                this.activeObjects.push(...objects);
            } else {
                this.activeObjects.push(objects);
            }
        });
        return this;
    }
    
    /**
     * Add multiple spawns with regular interval
     * @param {number} startFrame - First spawn frame
     * @param {number} interval - Frames between spawns
     * @param {number} count - Number of spawns
     * @param {Function} spawner - Function that returns attack objects
     */
    addRepeatingSpawn(startFrame, interval, count, spawner) {
        for (let i = 0; i < count; i++) {
            const frame = startFrame + (i * interval);
            this.addSpawn(frame, spawner);
        }
        return this;
    }
    
    /**
     * Add synchronized spawns (multiple spawns at same time)
     * @param {number} frame - Frame to spawn all
     * @param {Array<Function>} spawners - Array of spawner functions
     */
    addSynchronizedSpawns(frame, spawners) {
        this.timeline.addEvent(frame, () => {
            spawners.forEach(spawner => {
                const objects = spawner();
                if (Array.isArray(objects)) {
                    this.activeObjects.push(...objects);
                } else {
                    this.activeObjects.push(objects);
                }
            });
        });
        return this;
    }
    
    update() {
        this.timeline.update();
        
        // Update all active objects
        this.activeObjects = this.activeObjects.filter(obj => {
            obj.update();
            return obj.active;
        });
    }
    
    getActiveObjects() {
        return this.activeObjects;
    }
    
    isComplete() {
        return this.timeline.isComplete() && this.activeObjects.length === 0;
    }
    
    reset() {
        this.timeline.reset();
        this.activeObjects = [];
    }
}

/**
 * Wave formation generator
 */
export class WaveFormation {
    /**
     * Generate circular formation
     * @param {Function} createAttack - Function that creates an attack at (x, y, angle)
     * @param {number} centerX - Center X
     * @param {number} centerY - Center Y
     * @param {number} radius - Radius of circle
     * @param {number} count - Number of attacks
     * @param {number} rotationOffset - Starting angle offset
     */
    static circular(createAttack, centerX, centerY, radius, count, rotationOffset = 0) {
        const attacks = [];
        const angleStep = (Math.PI * 2) / count;
        
        for (let i = 0; i < count; i++) {
            const angle = (i * angleStep) + rotationOffset;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            attacks.push(createAttack(x, y, angle));
        }
        
        return attacks;
    }
    
    /**
     * Generate spiral formation
     * @param {Function} createAttack - Function that creates an attack at (x, y, angle)
     * @param {number} centerX - Center X
     * @param {number} centerY - Center Y
     * @param {number} startRadius - Starting radius
     * @param {number} endRadius - Ending radius
     * @param {number} count - Number of attacks
     * @param {number} rotations - Number of full rotations
     */
    static spiral(createAttack, centerX, centerY, startRadius, endRadius, count, rotations = 2) {
        const attacks = [];
        const radiusStep = (endRadius - startRadius) / count;
        const angleStep = (Math.PI * 2 * rotations) / count;
        
        for (let i = 0; i < count; i++) {
            const radius = startRadius + (i * radiusStep);
            const angle = i * angleStep;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            attacks.push(createAttack(x, y, angle));
        }
        
        return attacks;
    }
    
    /**
     * Generate grid formation
     * @param {Function} createAttack - Function that creates an attack at (x, y)
     * @param {number} startX - Starting X
     * @param {number} startY - Starting Y
     * @param {number} cols - Number of columns
     * @param {number} rows - Number of rows
     * @param {number} spacingX - Spacing between columns
     * @param {number} spacingY - Spacing between rows
     */
    static grid(createAttack, startX, startY, cols, rows, spacingX, spacingY) {
        const attacks = [];
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + (col * spacingX);
                const y = startY + (row * spacingY);
                attacks.push(createAttack(x, y));
            }
        }
        
        return attacks;
    }
    
    /**
     * Generate line formation
     * @param {Function} createAttack - Function that creates an attack at (x, y, angle)
     * @param {number} startX - Starting X
     * @param {number} startY - Starting Y
     * @param {number} endX - Ending X
     * @param {number} endY - Ending Y
     * @param {number} count - Number of attacks
     */
    static line(createAttack, startX, startY, endX, endY, count) {
        const attacks = [];
        const dx = endX - startX;
        const dy = endY - startY;
        const angle = Math.atan2(dy, dx);
        
        for (let i = 0; i < count; i++) {
            const t = i / (count - 1);
            const x = startX + (dx * t);
            const y = startY + (dy * t);
            attacks.push(createAttack(x, y, angle));
        }
        
        return attacks;
    }
    
    /**
     * Generate wave formation (sine wave)
     * @param {Function} createAttack - Function that creates an attack at (x, y, angle)
     * @param {number} startX - Starting X
     * @param {number} startY - Starting Y
     * @param {number} endX - Ending X
     * @param {number} count - Number of attacks
     * @param {number} amplitude - Wave amplitude
     * @param {number} frequency - Wave frequency
     */
    static wave(createAttack, startX, startY, endX, count, amplitude, frequency) {
        const attacks = [];
        const dx = endX - startX;
        
        for (let i = 0; i < count; i++) {
            const t = i / (count - 1);
            const x = startX + (dx * t);
            const y = startY + Math.sin(t * Math.PI * 2 * frequency) * amplitude;
            const angle = Math.atan2(
                Math.cos(t * Math.PI * 2 * frequency) * amplitude * Math.PI * 2 * frequency / dx,
                1
            );
            attacks.push(createAttack(x, y, angle));
        }
        
        return attacks;
    }
    
    /**
     * Generate random formation within bounds
     * @param {Function} createAttack - Function that creates an attack at (x, y, angle)
     * @param {number} minX - Minimum X
     * @param {number} minY - Minimum Y
     * @param {number} maxX - Maximum X
     * @param {number} maxY - Maximum Y
     * @param {number} count - Number of attacks
     */
    static random(createAttack, minX, minY, maxX, maxY, count) {
        const attacks = [];
        
        for (let i = 0; i < count; i++) {
            const x = minX + Math.random() * (maxX - minX);
            const y = minY + Math.random() * (maxY - minY);
            const angle = Math.random() * Math.PI * 2;
            attacks.push(createAttack(x, y, angle));
        }
        
        return attacks;
    }
}

/**
 * Pattern mixer for combining patterns simultaneously
 */
export class PatternMixer {
    constructor() {
        this.layers = [];
    }
    
    /**
     * Add a pattern layer
     * @param {Object} pattern - Attack pattern
     * @param {number} weight - Spawn weight (higher = more frequent)
     */
    addLayer(pattern, weight = 1.0) {
        this.layers.push({ pattern, weight, elapsed: 0 });
        return this;
    }
    
    /**
     * Update all layers
     */
    update() {
        this.layers.forEach(layer => {
            layer.elapsed++;
        });
    }
    
    /**
     * Get patterns that should spawn this frame
     * @returns {Array} Array of patterns to spawn
     */
    getPatternsToSpawn() {
        const toSpawn = [];
        
        this.layers.forEach(layer => {
            // Weight determines spawn frequency
            const spawnInterval = Math.floor(60 / layer.weight);
            if (layer.elapsed % spawnInterval === 0) {
                toSpawn.push(layer.pattern);
            }
        });
        
        return toSpawn;
    }
    
    reset() {
        this.layers.forEach(layer => layer.elapsed = 0);
    }
}
