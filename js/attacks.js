/**
 * attacks.js
 * Attack pattern system with various attack types
 */

import { CONFIG } from './config.js';
import { ATTACK } from './constants.js';
import { randomInt, randomFloat } from './utils.js';

/**
 * Base Attack Object class
 */
class AttackObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.active = true;
        this.damage = 1;
        this.type = 'generic';
    }
    
    /**
     * Update attack object
     */
    update() {
        // Override in subclasses
    }
    
    /**
     * Draw attack object
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        // Override in subclasses
    }
    
    /**
     * Get bounding box for collision
     * @returns {Object} Bounds {x, y, width, height}
     */
    getBounds() {
        return { x: this.x, y: this.y, width: 10, height: 10 };
    }
    
    /**
     * Check if object is outside battle box (for cleanup)
     * @param {Object} battleBox - Battle box bounds
     * @returns {boolean} True if outside
     */
    isOutOfBounds(battleBox) {
        const bounds = this.getBounds();
        return bounds.x + bounds.width < battleBox.x ||
               bounds.x > battleBox.x + battleBox.width ||
               bounds.y + bounds.height < battleBox.y ||
               bounds.y > battleBox.y + battleBox.height;
    }
}

/**
 * Projectile attack - moves in a straight line
 */
export class Projectile extends AttackObject {
    constructor(x, y, vx, vy, size = ATTACK.DEFAULT_PROJECTILE_SIZE, color = '#ffffff') {
        super(x, y);
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.color = color;
        this.type = 'projectile';
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }
    
    getBounds() {
        return {
            x: this.x - this.size / 2,
            y: this.y - this.size / 2,
            width: this.size,
            height: this.size
        };
    }
}

/**
 * Bone attack - vertical or horizontal bone
 */
export class Bone extends AttackObject {
    constructor(x, y, width, height, vx, vy, color = '#ffffff') {
        super(x, y);
        this.width = width;
        this.height = height;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.type = 'bone';
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
    
    draw(ctx) {
        // Draw bone with outline
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = ATTACK.BONE_OUTLINE_WIDTH;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

/**
 * Circle attack - expands or contracts
 */
export class CircleAttack extends AttackObject {
    constructor(x, y, startRadius, endRadius, duration, color = '#ffffff') {
        super(x, y);
        this.startRadius = startRadius;
        this.endRadius = endRadius;
        this.radius = startRadius;
        this.duration = duration;
        this.elapsed = 0;
        this.color = color;
        this.type = 'circle';
    }
    
    update() {
        this.elapsed++;
        const progress = Math.min(this.elapsed / this.duration, 1);
        this.radius = this.startRadius + (this.endRadius - this.startRadius) * progress;
        
        if (progress >= 1) {
            this.active = false;
        }
    }
    
    draw(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = ATTACK.CIRCLE_LINE_WIDTH;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    getBounds() {
        // Ring collision - only the outline
        return {
            x: this.x - this.radius,
            y: this.y - this.radius,
            width: this.radius * 2,
            height: this.radius * 2
        };
    }
}

/**
 * AttackPattern class - Manages attack sequences
 */
export class AttackPattern {
    constructor(patternData) {
        this.name = patternData.name || 'Unnamed';
        this.duration = patternData.duration || ATTACK.DEFAULT_PATTERN_DURATION;
        this.waves = patternData.waves || [];
        this.objects = [];
        this.startTime = 0;
        this.isActive = false;
        this.battleBox = CONFIG.BATTLE_BOX;
    }
    
    /**
     * Start the attack pattern
     */
    start() {
        this.isActive = true;
        this.startTime = Date.now();
        this.objects = [];
    }
    
    /**
     * Update attack pattern
     */
    update() {
        if (!this.isActive) return;
        
        const elapsed = Date.now() - this.startTime;
        
        // Spawn waves based on timing
        this.waves.forEach(wave => {
            if (wave.spawned) return;
            if (elapsed >= wave.time) {
                this.spawnWave(wave);
                wave.spawned = true;
            }
        });
        
        // Update all attack objects
        this.objects = this.objects.filter(obj => {
            obj.update();
            
            // Remove inactive or out-of-bounds objects
            if (!obj.active || obj.isOutOfBounds(this.battleBox)) {
                return false;
            }
            return true;
        });
        
        // Check if pattern is complete
        if (elapsed >= this.duration && this.objects.length === 0) {
            this.isActive = false;
        }
    }
    
    /**
     * Spawn a wave of attacks
     * @param {Object} wave - Wave configuration
     */
    spawnWave(wave) {
        const box = this.battleBox;
        
        switch (wave.type) {
            case 'projectiles':
                this.spawnProjectiles(wave, box);
                break;
            case 'bones':
                this.spawnBones(wave, box);
                break;
            case 'circle':
                this.spawnCircle(wave, box);
                break;
            case 'circle_pellets':
                this.spawnCirclePellets(wave, box);
                break;
            case 'chaos_sabers':
                this.spawnChaosSabers(wave, box);
                break;
            case 'legs':
                this.spawnLegs(wave, box);
                break;
            default:
                console.warn(`Unknown wave type: ${wave.type}`);
        }
    }
    
    /**
     * Spawn projectile attacks
     */
    spawnProjectiles(wave, box) {
        const count = wave.count || 1;
        const speed = wave.speed || ATTACK.DEFAULT_PROJECTILE_SPEED;
        const size = wave.size || ATTACK.DEFAULT_PROJECTILE_SIZE;
        
        for (let i = 0; i < count; i++) {
            const side = wave.side || ['left', 'right', 'top', 'bottom'][randomInt(0, 3)];
            let x, y, vx, vy;
            
            switch (side) {
                case 'left':
                    x = box.x;
                    y = box.y + randomInt(0, box.height);
                    vx = speed;
                    vy = randomFloat(-1, 1);
                    break;
                case 'right':
                    x = box.x + box.width;
                    y = box.y + randomInt(0, box.height);
                    vx = -speed;
                    vy = randomFloat(-1, 1);
                    break;
                case 'top':
                    x = box.x + randomInt(0, box.width);
                    y = box.y;
                    vx = randomFloat(-1, 1);
                    vy = speed;
                    break;
                case 'bottom':
                    x = box.x + randomInt(0, box.width);
                    y = box.y + box.height;
                    vx = randomFloat(-1, 1);
                    vy = -speed;
                    break;
            }
            
            this.objects.push(new Projectile(x, y, vx, vy, size));
        }
    }
    
    /**
     * Spawn bone attacks
     */
    spawnBones(wave, box) {
        const count = wave.count || 1;
        const speed = wave.speed || ATTACK.DEFAULT_BONE_SPEED;
        const orientation = wave.orientation || 'horizontal';
        
        for (let i = 0; i < count; i++) {
            let x, y, width, height, vx, vy;
            
            if (orientation === 'horizontal') {
                width = randomInt(ATTACK.DEFAULT_BONE_MIN_SIZE, ATTACK.DEFAULT_BONE_MAX_SIZE);
                height = ATTACK.DEFAULT_BONE_HEIGHT;
                x = box.x - width;
                y = box.y + randomInt(0, box.height - height);
                vx = speed;
                vy = 0;
            } else {
                width = ATTACK.DEFAULT_BONE_WIDTH;
                height = randomInt(ATTACK.DEFAULT_BONE_MIN_SIZE, ATTACK.DEFAULT_BONE_MAX_SIZE);
                x = box.x + randomInt(0, box.width - width);
                y = box.y - height;
                vx = 0;
                vy = speed;
            }
            
            this.objects.push(new Bone(x, y, width, height, vx, vy));
        }
    }
    
    /**
     * Spawn circle attack
     */
    spawnCircle(wave, box) {
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        const startRadius = wave.startRadius || ATTACK.DEFAULT_CIRCLE_START_RADIUS;
        const endRadius = wave.endRadius || ATTACK.DEFAULT_CIRCLE_END_RADIUS;
        const duration = wave.duration || ATTACK.DEFAULT_CIRCLE_DURATION;
        
        this.objects.push(new CircleAttack(x, y, startRadius, endRadius, duration));
    }
    
    /**
     * Spawn circle pellets (radial projectiles)
     */
    spawnCirclePellets(wave, box) {
        const count = wave.count || 8;
        const speed = wave.speed || ATTACK.DEFAULT_PROJECTILE_SPEED;
        const size = wave.size || ATTACK.DEFAULT_PROJECTILE_SIZE;
        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            this.objects.push(new Projectile(centerX, centerY, vx, vy, size, '#ffffff'));
        }
    }
    
    /**
     * Spawn chaos sabers (rotating blades)
     */
    spawnChaosSabers(wave, box) {
        const count = wave.count || 4;
        const speed = wave.speed || 2;
        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const radius = 50;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            // Create rotating projectile
            const saber = new Projectile(x, y, 0, 0, 30, '#ff00ff');
            saber.angle = angle;
            saber.rotationSpeed = speed;
            saber.radius = radius;
            saber.centerX = centerX;
            saber.centerY = centerY;
            
            // Override update to rotate around center
            const originalUpdate = saber.update.bind(saber);
            saber.update = function(box) {
                this.angle += this.rotationSpeed * 0.05;
                this.x = this.centerX + Math.cos(this.angle) * this.radius;
                this.y = this.centerY + Math.sin(this.angle) * this.radius;
                return originalUpdate(box);
            };
            
            this.objects.push(saber);
        }
    }
    
    /**
     * Spawn legs attack (sweeping horizontal attacks)
     */
    spawnLegs(wave, box) {
        const count = wave.count || 2;
        const height = wave.height || 40;
        
        for (let i = 0; i < count; i++) {
            const y = box.y + (box.height * (i + 1)) / (count + 1);
            const direction = i % 2 === 0 ? 1 : -1;
            const x = direction > 0 ? box.x : box.x + box.width;
            
            // Create wide horizontal projectile
            const leg = new Projectile(x, y, direction * 3, 0, 20, '#ffffff');
            leg.width = 60;
            leg.height = height;
            
            // Override draw to make it rectangular
            leg.draw = function(ctx) {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
            };
            
            this.objects.push(leg);
        }
    }
    
    /**
     * Draw all attack objects
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        this.objects.forEach(obj => obj.draw(ctx));
    }
    
    /**
     * Get all active attack objects
     * @returns {Array} Active attack objects
     */
    getActiveObjects() {
        return this.objects.filter(obj => obj.active);
    }
    
    /**
     * Reset pattern for reuse
     */
    reset() {
        this.isActive = false;
        this.objects = [];
        this.waves.forEach(wave => wave.spawned = false);
    }
}
