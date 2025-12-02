/**
 * attacks.js
 * ENHANCED Attack pattern system with advanced architecture
 * - State machines for attack lifecycle
 * - Modifier system for dynamic property changes
 * - Advanced timing and sequencing
 * - Pattern composition and choreography
 */

import { CONFIG } from './config.js';
import { ATTACK } from './constants.js';
import { randomInt, randomFloat } from './utils.js';
import { AttackStateMachine, AttackState } from './attackStates.js';
import { ModifierManager } from './attackModifiers.js';
import { Interpolator } from './easing.js';

/**
 * Base Attack Object class - ENHANCED
 */
class AttackObject {
    constructor(x, y, config = {}) {
        // Position
        this.x = x;
        this.y = y;
        this.initialX = x;
        this.initialY = y;
        
        // State
        this.active = true;
        this.damage = config.damage || 1;
        this.type = config.type || 'generic';
        
        // Advanced systems
        this.stateMachine = null;
        this.modifierManager = new ModifierManager();
        this.interpolators = [];
        
        // Rendering properties
        this.baseAlpha = 1.0;
        this.scale = 1.0;
        this.rotation = 0;
        
        // Hitbox offset (visual vs collision)
        this.hitboxOffsetX = config.hitboxOffsetX || 0;
        this.hitboxOffsetY = config.hitboxOffsetY || 0;
        
        // Custom callbacks
        this.onUpdateCallback = config.onUpdate || null;
        this.onDrawCallback = config.onDraw || null;
        this.onDestroyCallback = config.onDestroy || null;
        
        // Frame counter
        this.frameCount = 0;
        
        // Initialize state machine if config provided
        if (config.stateMachine) {
            this.stateMachine = new AttackStateMachine(config.stateMachine);
        }
        
        // Initialize modifiers if config provided
        if (config.modifiers) {
            config.modifiers.forEach(mod => this.modifierManager.addModifier(mod));
        }
    }
    
    /**
     * Update attack object - ENHANCED
     */
    update() {
        this.frameCount++;
        
        // Update state machine
        if (this.stateMachine) {
            this.stateMachine.update();
            
            // Check if state machine is complete
            if (this.stateMachine.isComplete()) {
                this.active = false;
                if (this.onDestroyCallback) {
                    this.onDestroyCallback(this);
                }
                return;
            }
        }
        
        // Update modifiers
        this.modifierManager.update(this);
        
        // Update interpolators
        this.interpolators = this.interpolators.filter(interp => {
            interp.update();
            return !interp.isComplete();
        });
        
        // Custom update callback
        if (this.onUpdateCallback) {
            this.onUpdateCallback(this);
        }
    }
    
    /**
     * Draw attack object - ENHANCED
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        ctx.save();
        
        // Apply state machine alpha
        if (this.stateMachine) {
            ctx.globalAlpha = this.stateMachine.getAlpha() * this.baseAlpha;
        } else {
            ctx.globalAlpha = this.baseAlpha;
        }
        
        // Apply transformations
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        
        // Custom draw callback or default
        if (this.onDrawCallback) {
            this.onDrawCallback(this, ctx);
        } else {
            this.drawDefault(ctx);
        }
        
        ctx.restore();
    }
    
    /**
     * Default draw implementation (override in subclasses)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawDefault(ctx) {
        // Override in subclasses
    }
    
    /**
     * Get bounding box for collision - ENHANCED
     * @returns {Object} Bounds {x, y, width, height}
     */
    getBounds() {
        return { 
            x: this.x + this.hitboxOffsetX, 
            y: this.y + this.hitboxOffsetY, 
            width: 10, 
            height: 10 
        };
    }
    
    /**
     * Check if attack can deal damage (state machine check)
     * @returns {boolean} True if can damage
     */
    canDealDamage() {
        if (this.stateMachine) {
            return this.stateMachine.canDealDamage();
        }
        return this.active;
    }
    
    /**
     * Add a modifier to this attack
     * @param {Object} modifier - Modifier instance
     */
    addModifier(modifier) {
        this.modifierManager.addModifier(modifier);
        return this;
    }
    
    /**
     * Add an interpolator for smooth property transitions
     * @param {Interpolator} interpolator - Interpolator instance
     */
    addInterpolator(interpolator) {
        this.interpolators.push(interpolator);
        return this;
    }
    
    /**
     * Check if object is outside battle box (for cleanup)
     * @param {Object} battleBox - Battle box bounds
     * @returns {boolean} True if outside
     */
    isOutOfBounds(battleBox) {
        const bounds = this.getBounds();
        const margin = 100; // Allow some margin for large objects
        return bounds.x + bounds.width < battleBox.x - margin ||
               bounds.x > battleBox.x + battleBox.width + margin ||
               bounds.y + bounds.height < battleBox.y - margin ||
               bounds.y > battleBox.y + battleBox.height + margin;
    }
    
    /**
     * Destroy this attack
     */
    destroy() {
        this.active = false;
        if (this.onDestroyCallback) {
            this.onDestroyCallback(this);
        }
    }
}

/**
 * Projectile attack - moves in a straight line - ENHANCED
 */
export class Projectile extends AttackObject {
    constructor(x, y, vx, vy, size = ATTACK.DEFAULT_PROJECTILE_SIZE, color = '#ffffff', config = {}) {
        super(x, y, { ...config, type: 'projectile' });
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.color = color;
    }
    
    update() {
        // Call parent update for modifiers and state machine
        super.update();
        
        // Default movement (can be overridden by modifiers)
        this.x += this.vx;
        this.y += this.vy;
    }
    
    drawDefault(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    }
    
    getBounds() {
        return {
            x: this.x - this.size / 2 + this.hitboxOffsetX,
            y: this.y - this.size / 2 + this.hitboxOffsetY,
            width: this.size * this.scale,
            height: this.size * this.scale
        };
    }
}

/**
 * Bone attack - vertical or horizontal bone - ENHANCED
 */
export class Bone extends AttackObject {
    constructor(x, y, width, height, vx, vy, color = '#ffffff', config = {}) {
        super(x, y, { ...config, type: 'bone' });
        this.width = width;
        this.height = height;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
    }
    
    update() {
        // Call parent update for modifiers and state machine
        super.update();
        
        // Default movement (can be overridden by modifiers)
        this.x += this.vx;
        this.y += this.vy;
    }
    
    drawDefault(ctx) {
        // Draw bone with outline
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = ATTACK.BONE_OUTLINE_WIDTH;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }
    
    getBounds() {
        return {
            x: this.x - this.width / 2 + this.hitboxOffsetX,
            y: this.y - this.height / 2 + this.hitboxOffsetY,
            width: this.width * this.scale,
            height: this.height * this.scale
        };
    }
}

/**
 * Blue Bone attack - only damages if player is moving - ENHANCED
 */
export class BlueBone extends Bone {
    constructor(x, y, width, height, vx, vy, config = {}) {
        super(x, y, width, height, vx, vy, '#00a2e8', { ...config, type: 'blue_bone' });
        this.requiresStill = true; // Must stand still to avoid
    }
    
    /**
     * Check if this blue bone should damage the soul
     * @param {Object} soul - Soul instance
     * @returns {boolean} True if should damage
     */
    shouldDamage(soul) {
        return soul.getIsMoving(); // Only damage if moving
    }
}

/**
 * Orange Bone attack - only damages if player is standing still - ENHANCED
 */
export class OrangeBone extends Bone {
    constructor(x, y, width, height, vx, vy, config = {}) {
        super(x, y, width, height, vx, vy, '#ff7f27', { ...config, type: 'orange_bone' });
        this.requiresMoving = true; // Must be moving to avoid
    }
    
    /**
     * Check if this orange bone should damage the soul
     * @param {Object} soul - Soul instance
     * @returns {boolean} True if should damage
     */
    shouldDamage(soul) {
        return !soul.getIsMoving(); // Only damage if standing still
    }
}

/**
 * Blue Projectile - only damages if player is moving - ENHANCED
 */
export class BlueProjectile extends Projectile {
    constructor(x, y, vx, vy, size = ATTACK.DEFAULT_PROJECTILE_SIZE, config = {}) {
        super(x, y, vx, vy, size, '#00a2e8', { ...config, type: 'blue_projectile' });
        this.requiresStill = true;
    }
    
    /**
     * Check if this blue projectile should damage the soul
     * @param {Object} soul - Soul instance
     * @returns {boolean} True if should damage
     */
    shouldDamage(soul) {
        return soul.getIsMoving(); // Only damage if moving
    }
}

/**
 * Orange Projectile - only damages if player is standing still - ENHANCED
 */
export class OrangeProjectile extends Projectile {
    constructor(x, y, vx, vy, size = ATTACK.DEFAULT_PROJECTILE_SIZE, config = {}) {
        super(x, y, vx, vy, size, '#ff7f27', { ...config, type: 'orange_projectile' });
        this.requiresMoving = true;
    }
    
    /**
     * Check if this orange projectile should damage the soul
     * @param {Object} soul - Soul instance
     * @returns {boolean} True if should damage
     */
    shouldDamage(soul) {
        return !soul.getIsMoving(); // Only damage if standing still
    }
}

/**
 * Homing Projectile - tracks and follows the player's soul - NEW (TODO #4)
 */
export class HomingProjectile extends Projectile {
    constructor(x, y, speed = 2, size = ATTACK.DEFAULT_PROJECTILE_SIZE, color = '#ff00ff', config = {}) {
        super(x, y, 0, 0, size, color, { ...config, type: 'homing_projectile' });
        
        // Homing properties
        this.homingSpeed = speed;
        this.homingStrength = config.homingStrength || 0.1; // 0-1, how aggressively it homes
        this.maxTurnRate = config.maxTurnRate || 0.15; // Max radians per frame
        this.targetSoul = null; // Set by battle system
        
        // Initial velocity (can start with direction)
        if (config.initialVx !== undefined) this.vx = config.initialVx;
        if (config.initialVy !== undefined) this.vy = config.initialVy;
        
        // Homing delay (frames before homing activates)
        this.homingDelay = config.homingDelay || 0;
        this.homingDelayTimer = this.homingDelay;
        
        // Acceleration mode vs constant speed
        this.useAcceleration = config.useAcceleration || false;
        this.acceleration = config.acceleration || 0.2;
        this.maxSpeed = config.maxSpeed || speed * 2;
    }
    
    /**
     * Set the target soul to home towards
     * @param {Object} soul - Soul instance
     */
    setTarget(soul) {
        this.targetSoul = soul;
    }
    
    update() {
        // Call parent update for modifiers and state machine
        super.update();
        
        // Homing delay countdown
        if (this.homingDelayTimer > 0) {
            this.homingDelayTimer--;
            // Just move in initial direction during delay
            this.x += this.vx;
            this.y += this.vy;
            return;
        }
        
        // Home towards target
        if (this.targetSoul) {
            const dx = this.targetSoul.x - this.x;
            const dy = this.targetSoul.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                // Desired direction
                const desiredAngle = Math.atan2(dy, dx);
                
                // Current direction
                const currentAngle = Math.atan2(this.vy, this.vx);
                
                // Calculate angle difference
                let angleDiff = desiredAngle - currentAngle;
                
                // Normalize angle difference to -π to π
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                
                // Clamp turn rate
                const turnAmount = Math.max(-this.maxTurnRate, Math.min(this.maxTurnRate, angleDiff));
                
                // New angle
                const newAngle = currentAngle + turnAmount * this.homingStrength;
                
                if (this.useAcceleration) {
                    // Acceleration mode - speed up over time
                    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                    const newSpeed = Math.min(currentSpeed + this.acceleration, this.maxSpeed);
                    
                    this.vx = Math.cos(newAngle) * newSpeed;
                    this.vy = Math.sin(newAngle) * newSpeed;
                } else {
                    // Constant speed mode
                    this.vx = Math.cos(newAngle) * this.homingSpeed;
                    this.vy = Math.sin(newAngle) * this.homingSpeed;
                }
            }
        }
        
        // Update position (don't call super movement)
        this.x += this.vx;
        this.y += this.vy;
    }
    
    drawDefault(ctx) {
        // Draw with rotation based on velocity
        const angle = Math.atan2(this.vy, this.vx);
        ctx.rotate(angle);
        
        // Draw arrow-like shape
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.size / 2, 0);
        ctx.lineTo(-this.size / 2, -this.size / 3);
        ctx.lineTo(-this.size / 4, 0);
        ctx.lineTo(-this.size / 2, this.size / 3);
        ctx.closePath();
        ctx.fill();
        
        // Draw trail effect
        if (this.homingDelayTimer <= 0 && this.targetSoul) {
            ctx.strokeStyle = this.color;
            ctx.globalAlpha = 0.3;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-this.vx * 2, -this.vy * 2);
            ctx.stroke();
        }
    }
}

/**
 * Bouncing Projectile - bounces off battle box walls
 * Features:
 * - Velocity reflection on wall collision
 * - Configurable bounce limit
 * - Optional energy loss (dampening) per bounce
 * - Visual spin effect on bounce
 * - Bounce sound/effect callback
 * 
 * Perfect for:
 * - Mettaton's bouncing attacks
 * - Tsunderplane's planes
 * - Chaotic bullet hell patterns
 */
export class BouncingProjectile extends Projectile {
    constructor(x, y, vx, vy, size = ATTACK.DEFAULT_PROJECTILE_SIZE, color = '#ff00ff', config = {}) {
        super(x, y, vx, vy, size, color, { ...config, type: 'bouncing_projectile' });
        
        // Bouncing properties
        this.maxBounces = config.maxBounces !== undefined ? config.maxBounces : -1; // -1 = infinite
        this.bounceCount = 0;
        this.energyLoss = config.energyLoss || 0; // 0-1, how much speed is lost per bounce (0 = no loss)
        this.minSpeed = config.minSpeed || 0.5; // Minimum speed before deactivation
        
        // Battle box bounds (set by pattern or battle system)
        this.battleBox = config.battleBox || CONFIG.BATTLE_BOX;
        
        // Visual effects
        this.spinSpeed = 0; // Rotation speed (increases on bounce)
        this.spinDecay = config.spinDecay || 0.95; // How fast spin slows down
        this.bounceFlashTimer = 0; // Brief flash on bounce
        this.bounceFlashDuration = 5; // frames
        
        // Bounce callback (for sound effects, particles, etc.)
        this.onBounceCallback = config.onBounce || null;
        
        // Wall margin (for precise collision)
        this.wallMargin = config.wallMargin || 2;
    }
    
    update() {
        // Call parent update for modifiers and state machine
        super.update();
        
        // Store previous position for collision detection
        const prevX = this.x;
        const prevY = this.y;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Apply spin rotation
        if (Math.abs(this.spinSpeed) > 0.01) {
            this.rotation += this.spinSpeed;
            this.spinSpeed *= this.spinDecay;
        }
        
        // Decrease bounce flash timer
        if (this.bounceFlashTimer > 0) {
            this.bounceFlashTimer--;
        }
        
        // Check wall collisions
        let bounced = false;
        
        // Left wall
        if (this.x - this.size / 2 < this.battleBox.x + this.wallMargin) {
            this.x = this.battleBox.x + this.size / 2 + this.wallMargin;
            this.vx = Math.abs(this.vx); // Bounce right
            bounced = true;
        }
        
        // Right wall
        if (this.x + this.size / 2 > this.battleBox.x + this.battleBox.width - this.wallMargin) {
            this.x = this.battleBox.x + this.battleBox.width - this.size / 2 - this.wallMargin;
            this.vx = -Math.abs(this.vx); // Bounce left
            bounced = true;
        }
        
        // Top wall
        if (this.y - this.size / 2 < this.battleBox.y + this.wallMargin) {
            this.y = this.battleBox.y + this.size / 2 + this.wallMargin;
            this.vy = Math.abs(this.vy); // Bounce down
            bounced = true;
        }
        
        // Bottom wall
        if (this.y + this.size / 2 > this.battleBox.y + this.battleBox.height - this.wallMargin) {
            this.y = this.battleBox.y + this.battleBox.height - this.size / 2 - this.wallMargin;
            this.vy = -Math.abs(this.vy); // Bounce up
            bounced = true;
        }
        
        // Handle bounce
        if (bounced) {
            this.bounceCount++;
            
            // Apply energy loss
            if (this.energyLoss > 0) {
                const dampening = 1 - this.energyLoss;
                this.vx *= dampening;
                this.vy *= dampening;
                
                // Check if speed too low
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed < this.minSpeed) {
                    this.active = false;
                    return;
                }
            }
            
            // Add spin effect on bounce
            const bounceIntensity = Math.sqrt(this.vx * this.vx + this.vy * this.vy) / 5;
            this.spinSpeed = (Math.random() - 0.5) * bounceIntensity * 0.3;
            
            // Bounce flash effect
            this.bounceFlashTimer = this.bounceFlashDuration;
            
            // Bounce callback
            if (this.onBounceCallback) {
                this.onBounceCallback(this, this.bounceCount);
            }
            
            // Check bounce limit
            if (this.maxBounces >= 0 && this.bounceCount >= this.maxBounces) {
                this.active = false;
            }
        }
    }
    
    drawDefault(ctx) {
        // Draw projectile with bounce flash
        if (this.bounceFlashTimer > 0) {
            // Flash white on bounce
            const flashIntensity = this.bounceFlashTimer / this.bounceFlashDuration;
            ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity * 0.5})`;
            ctx.fillRect(-this.size / 2 - 2, -this.size / 2 - 2, this.size + 4, this.size + 4);
        }
        
        // Draw main projectile (use parent's draw)
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        
        // Draw bounce count indicator (optional visual)
        if (this.maxBounces >= 0 && this.bounceCount > 0) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1;
            const radius = this.size / 2 + 3;
            const segments = this.maxBounces;
            const filledSegments = this.bounceCount;
            
            for (let i = 0; i < segments; i++) {
                const angle = (Math.PI * 2 * i) / segments - Math.PI / 2;
                const nextAngle = (Math.PI * 2 * (i + 1)) / segments - Math.PI / 2;
                
                if (i < filledSegments) {
                    ctx.globalAlpha = 0.3;
                    ctx.beginPath();
                    ctx.arc(0, 0, radius, angle, nextAngle);
                    ctx.stroke();
                }
            }
            ctx.globalAlpha = 1;
        }
    }
}

/**
 * Exploding Projectile - explodes into fragments
 * Features:
 * - Timer-based explosion
 * - Collision-triggered explosion
 * - Configurable fragment count and patterns
 * - Visual warning before explosion
 * - Fragment spread patterns (uniform, random, directional)
 * - Chain reaction support
 * 
 * Perfect for:
 * - Asriel's star explosions
 * - Vulkin's fire bombs
 * - Mettaton's explosive attacks
 * - Boss bullet hell patterns
 */
export class ExplodingProjectile extends Projectile {
    constructor(x, y, vx, vy, size = ATTACK.DEFAULT_PROJECTILE_SIZE, color = '#ff6600', config = {}) {
        super(x, y, vx, vy, size, color, { ...config, type: 'exploding_projectile' });
        
        // Explosion trigger
        this.explosionTimer = config.explosionTimer || 120; // Frames until explosion
        this.explodeOnCollision = config.explodeOnCollision || false;
        this.explodeOnBounds = config.explodeOnBounds !== undefined ? config.explodeOnBounds : true;
        
        // Battle box bounds (for boundary detection)
        this.battleBox = config.battleBox || CONFIG.BATTLE_BOX;
        
        // Fragment configuration
        this.fragmentCount = config.fragmentCount || 8;
        this.fragmentSpeed = config.fragmentSpeed || 2;
        this.fragmentSize = config.fragmentSize || this.size * 0.5;
        this.fragmentColor = config.fragmentColor || this.color;
        this.fragmentPattern = config.fragmentPattern || 'uniform'; // uniform, random, directional
        this.fragmentAngleOffset = config.fragmentAngleOffset || 0; // For directional patterns
        
        // Fragment properties
        this.fragmentLifespan = config.fragmentLifespan || 180; // Frames
        this.fragmentFadeOut = config.fragmentFadeOut !== undefined ? config.fragmentFadeOut : true;
        
        // Visual warning
        this.warningTime = config.warningTime || 30; // Frames before explosion to start warning
        this.pulseSpeed = config.pulseSpeed || 0.15;
        this.pulseSize = 0;
        
        // Explosion effect
        this.hasExploded = false;
        this.explosionCallback = config.onExplode || null;
        
        // Reference to pattern's object array (for spawning fragments)
        this.objectArray = null; // Set by battle system
        
        // Chain reaction
        this.canChainExplode = config.canChainExplode || false;
        this.chainRadius = config.chainRadius || 50;
    }
    
    /**
     * Set the object array reference for spawning fragments
     * @param {Array} objectArray - Reference to attack pattern's objects array
     */
    setObjectArray(objectArray) {
        this.objectArray = objectArray;
    }
    
    /**
     * Trigger collision with soul (overrideable)
     */
    onSoulCollision() {
        if (this.explodeOnCollision) {
            this.explode();
        }
    }
    
    update() {
        // Call parent update for modifiers and state machine
        super.update();
        
        if (this.hasExploded) {
            this.active = false;
            return;
        }
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Countdown to explosion
        this.explosionTimer--;
        
        // Warning pulse effect
        if (this.explosionTimer <= this.warningTime) {
            this.pulseSize = Math.sin(this.frameCount * this.pulseSpeed) * 0.3 + 0.3;
        }
        
        // Check for explosion
        if (this.explosionTimer <= 0) {
            this.explode();
            return;
        }
        
        // Check bounds for explosion
        if (this.explodeOnBounds) {
            const margin = this.size;
            if (this.x < this.battleBox.x - margin ||
                this.x > this.battleBox.x + this.battleBox.width + margin ||
                this.y < this.battleBox.y - margin ||
                this.y > this.battleBox.y + this.battleBox.height + margin) {
                this.explode();
                return;
            }
        }
    }
    
    /**
     * Trigger explosion and spawn fragments
     */
    explode() {
        if (this.hasExploded) return;
        
        this.hasExploded = true;
        
        // Spawn fragments
        if (this.objectArray) {
            this.spawnFragments();
        }
        
        // Explosion callback
        if (this.explosionCallback) {
            this.explosionCallback(this);
        }
        
        // Chain reaction check
        if (this.canChainExplode && this.objectArray) {
            this.triggerChainReaction();
        }
        
        // Deactivate this projectile
        this.active = false;
    }
    
    /**
     * Spawn explosion fragments
     */
    spawnFragments() {
        const fragments = [];
        
        for (let i = 0; i < this.fragmentCount; i++) {
            let angle;
            
            // Determine angle based on pattern
            switch (this.fragmentPattern) {
                case 'uniform':
                    // Evenly distributed in circle
                    angle = (Math.PI * 2 * i) / this.fragmentCount + this.fragmentAngleOffset;
                    break;
                    
                case 'random':
                    // Random directions
                    angle = Math.random() * Math.PI * 2;
                    break;
                    
                case 'directional':
                    // Spread around current velocity direction
                    const baseAngle = Math.atan2(this.vy, this.vx);
                    const spread = Math.PI / 3; // 60 degree spread
                    angle = baseAngle + (Math.random() - 0.5) * spread + this.fragmentAngleOffset;
                    break;
                    
                case 'cone':
                    // Cone pattern in velocity direction
                    const coneAngle = Math.atan2(this.vy, this.vx);
                    const coneSpread = Math.PI / 2; // 90 degree cone
                    const step = coneSpread / (this.fragmentCount - 1 || 1);
                    angle = coneAngle - coneSpread / 2 + step * i + this.fragmentAngleOffset;
                    break;
                    
                default:
                    angle = (Math.PI * 2 * i) / this.fragmentCount;
            }
            
            // Calculate fragment velocity
            const speed = this.fragmentSpeed * (0.8 + Math.random() * 0.4); // Slight variation
            const fragmentVx = Math.cos(angle) * speed;
            const fragmentVy = Math.sin(angle) * speed;
            
            // Create fragment
            const fragment = new Projectile(
                this.x,
                this.y,
                fragmentVx,
                fragmentVy,
                this.fragmentSize,
                this.fragmentColor,
                {
                    type: 'fragment',
                    stateMachine: this.fragmentFadeOut ? {
                        states: {
                            active: {
                                duration: this.fragmentLifespan,
                                transitions: { complete: 'fadeout' }
                            },
                            fadeout: {
                                duration: 15,
                                transitions: { complete: 'complete' }
                            }
                        },
                        initialState: 'active'
                    } : null,
                    modifiers: this.fragmentFadeOut ? [{
                        type: 'alpha',
                        startValue: 1,
                        endValue: 0,
                        duration: 15,
                        delay: this.fragmentLifespan,
                        easing: 'linear'
                    }] : []
                }
            );
            
            fragments.push(fragment);
        }
        
        // Add all fragments to the object array
        this.objectArray.push(...fragments);
    }
    
    /**
     * Trigger chain reaction with nearby exploding projectiles
     */
    triggerChainReaction() {
        if (!this.objectArray) return;
        
        this.objectArray.forEach(obj => {
            if (obj instanceof ExplodingProjectile && 
                !obj.hasExploded && 
                obj !== this) {
                
                const dx = obj.x - this.x;
                const dy = obj.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.chainRadius) {
                    // Trigger nearby explosion with slight delay
                    obj.explosionTimer = Math.min(obj.explosionTimer, 10);
                }
            }
        });
    }
    
    drawDefault(ctx) {
        // Warning pulse effect
        if (this.explosionTimer <= this.warningTime && this.pulseSize > 0) {
            const pulseRadius = this.size / 2 + this.size * this.pulseSize;
            ctx.strokeStyle = this.color;
            ctx.globalAlpha = 0.5 * (1 - this.pulseSize);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        
        // Main projectile body
        ctx.fillStyle = this.color;
        
        // Pulsing core when near explosion
        if (this.explosionTimer <= this.warningTime) {
            const coreSize = this.size * (0.9 + Math.sin(this.frameCount * this.pulseSpeed * 2) * 0.1);
            ctx.fillRect(-coreSize / 2, -coreSize / 2, coreSize, coreSize);
        } else {
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        }
        
        // Timer indicator (visual countdown)
        if (this.explosionTimer <= this.warningTime) {
            const progress = this.explosionTimer / this.warningTime;
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2 + 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - progress));
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
}

/**
 * Arc Projectile - follows parabolic trajectory with gravity
 * Features:
 * - Realistic gravity simulation
 * - Parabolic arc trajectory
 * - Optional ground bounce
 * - Target-based arc calculation
 * - Visual trail effect
 * - Rotation based on velocity
 * 
 * Perfect for:
 * - Toriel's fire attacks
 * - Asgore's fire balls
 * - Lobbed projectiles
 * - Artillery-style attacks
 */
export class ArcProjectile extends Projectile {
    constructor(x, y, vx, vy, size = ATTACK.DEFAULT_PROJECTILE_SIZE, color = '#ff8800', config = {}) {
        super(x, y, vx, vy, size, color, { ...config, type: 'arc_projectile' });
        
        // Gravity properties
        this.gravity = config.gravity || 0.15; // Pixels per frame squared
        this.velocityY = vy; // Separate Y velocity for clarity
        this.velocityX = vx; // X velocity (constant unless air resistance)
        
        // Air resistance (optional)
        this.airResistance = config.airResistance || 0; // 0-1, affects both X and Y velocity
        
        // Ground bounce
        this.canBounce = config.canBounce !== undefined ? config.canBounce : false;
        this.bounceCount = 0;
        this.maxBounces = config.maxBounces || 3;
        this.bounceDampening = config.bounceDampening || 0.6; // Energy retained on bounce
        this.groundY = config.groundY || (CONFIG.BATTLE_BOX.y + CONFIG.BATTLE_BOX.height); // Ground level
        
        // Battle box bounds
        this.battleBox = config.battleBox || CONFIG.BATTLE_BOX;
        
        // Visual effects
        this.rotationSpeed = 0;
        this.trail = [];
        this.trailLength = config.trailLength || 5;
        this.showTrail = config.showTrail !== undefined ? config.showTrail : true;
        
        // Peak detection (for callbacks)
        this.reachedPeak = false;
        this.peakY = y;
        this.onPeakCallback = config.onPeak || null;
        
        // Ground contact callback
        this.onGroundCallback = config.onGround || null;
    }
    
    /**
     * Static helper: Calculate initial velocity to reach target
     * @param {number} startX - Starting X position
     * @param {number} startY - Starting Y position
     * @param {number} targetX - Target X position
     * @param {number} targetY - Target Y position
     * @param {number} gravity - Gravity strength
     * @param {number} arcHeight - Optional arc height multiplier (default 1.0)
     * @returns {Object} { vx, vy } - Initial velocities
     */
    static calculateArcToTarget(startX, startY, targetX, targetY, gravity = 0.15, arcHeight = 1.0) {
        const dx = targetX - startX;
        const dy = targetY - startY;
        
        // Time to reach target (estimated)
        const time = Math.sqrt(Math.abs(dx) / (gravity * 0.5)) * arcHeight;
        
        // Calculate velocities
        const vx = dx / time;
        const vy = (dy / time) - (0.5 * gravity * time);
        
        return { vx, vy };
    }
    
    update() {
        // Call parent update for modifiers and state machine
        super.update();
        
        // Store previous position for trail
        if (this.showTrail) {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > this.trailLength) {
                this.trail.shift();
            }
        }
        
        // Apply gravity
        this.velocityY += this.gravity;
        
        // Apply air resistance
        if (this.airResistance > 0) {
            this.velocityX *= (1 - this.airResistance);
            this.velocityY *= (1 - this.airResistance);
        }
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Update vx, vy for parent class compatibility
        this.vx = this.velocityX;
        this.vy = this.velocityY;
        
        // Rotation based on velocity
        this.rotationSpeed = Math.atan2(this.velocityY, this.velocityX);
        this.rotation = this.rotationSpeed;
        
        // Peak detection
        if (!this.reachedPeak && this.velocityY > 0) {
            this.reachedPeak = true;
            this.peakY = this.y;
            if (this.onPeakCallback) {
                this.onPeakCallback(this);
            }
        }
        
        // Ground collision
        if (this.canBounce && this.y >= this.groundY - this.size / 2) {
            this.y = this.groundY - this.size / 2;
            
            // Bounce
            if (this.bounceCount < this.maxBounces) {
                this.velocityY = -Math.abs(this.velocityY) * this.bounceDampening;
                this.velocityX *= this.bounceDampening; // Horizontal dampening too
                this.bounceCount++;
                
                if (this.onGroundCallback) {
                    this.onGroundCallback(this, this.bounceCount);
                }
            } else {
                // Stop bouncing
                this.velocityY = 0;
                this.velocityX *= 0.8; // Slide to stop
                
                // Deactivate if almost stopped
                if (Math.abs(this.velocityX) < 0.1) {
                    this.active = false;
                }
            }
        }
        
        // Deactivate if out of bounds (without bounce)
        if (!this.canBounce) {
            const margin = 50;
            if (this.x < this.battleBox.x - margin ||
                this.x > this.battleBox.x + this.battleBox.width + margin ||
                this.y > this.battleBox.y + this.battleBox.height + margin) {
                this.active = false;
            }
        }
    }
    
    drawDefault(ctx) {
        // Draw trail
        if (this.showTrail && this.trail.length > 1) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.3;
            
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x - this.x, this.trail[0].y - this.y);
            
            for (let i = 1; i < this.trail.length; i++) {
                const alpha = (i / this.trail.length) * 0.3;
                ctx.globalAlpha = alpha;
                ctx.lineTo(this.trail[i].x - this.x, this.trail[i].y - this.y);
            }
            
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        
        // Draw main projectile
        ctx.fillStyle = this.color;
        
        // Slightly stretched in direction of movement for visual effect
        const speedFactor = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
        const stretch = Math.min(speedFactor * 0.15, 1.5);
        
        ctx.save();
        ctx.scale(1 + stretch * 0.2, 1);
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
        
        // Glow effect for fire-like projectiles
        if (this.color.includes('ff')) { // If color has red channel
            ctx.fillStyle = 'rgba(255, 200, 100, 0.4)';
            ctx.fillRect(-this.size / 2 - 2, -this.size / 2 - 2, this.size + 4, this.size + 4);
        }
    }
}

/**
 * Wave Motion Projectile - follows sine/cosine wave pattern
 * Features:
 * - Sine wave horizontal/vertical movement
 * - Cosine wave patterns
 * - Configurable amplitude and frequency
 * - Combined wave patterns (spiral, figure-8)
 * - Phase offset for synchronized waves
 * - Visual trail effect
 * 
 * Perfect for:
 * - Aesthetic variety
 * - Unique enemy attack patterns
 * - Challenging dodge mechanics
 * - Madjick's orbs
 * - Artistic bullet patterns
 */
export class WaveProjectile extends Projectile {
    constructor(x, y, vx, vy, size = ATTACK.DEFAULT_PROJECTILE_SIZE, color = '#00ffff', config = {}) {
        super(x, y, vx, vy, size, color, { ...config, type: 'wave_projectile' });
        
        // Wave properties
        this.waveType = config.waveType || 'sine'; // sine, cosine, spiral, figure8, both
        this.amplitude = config.amplitude || 30; // Wave height
        this.frequency = config.frequency || 0.1; // Wave speed (radians per frame)
        this.phaseOffset = config.phaseOffset || 0; // Starting phase
        
        // Base direction (the "forward" direction)
        this.baseVx = vx;
        this.baseVy = vy;
        this.baseSpeed = Math.sqrt(vx * vx + vy * vy);
        this.baseAngle = Math.atan2(vy, vx);
        
        // Wave axis (perpendicular to base direction)
        this.waveAxisX = -Math.sin(this.baseAngle);
        this.waveAxisY = Math.cos(this.baseAngle);
        
        // Tracking
        this.waveTime = 0;
        this.centerX = x; // Track the "center line" position
        this.centerY = y;
        
        // Visual effects
        this.trail = [];
        this.trailLength = config.trailLength || 8;
        this.showTrail = config.showTrail !== undefined ? config.showTrail : true;
        this.rotateWithDirection = config.rotateWithDirection !== undefined ? config.rotateWithDirection : true;
        
        // Spiral-specific
        this.spiralRadiusGrowth = config.spiralRadiusGrowth || 0; // Radius increase per frame
        this.spiralAngleSpeed = config.spiralAngleSpeed || 0.1; // Rotation speed
        
        // Figure-8 specific
        this.figure8Scale = config.figure8Scale || 1.0;
    }
    
    update() {
        // Call parent update for modifiers and state machine
        super.update();
        
        // Store previous position for trail
        if (this.showTrail) {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > this.trailLength) {
                this.trail.shift();
            }
        }
        
        // Increment wave time
        this.waveTime += this.frequency;
        
        // Update center line position (base movement)
        this.centerX += this.baseVx;
        this.centerY += this.baseVy;
        
        // Calculate wave offset based on type
        let offsetX = 0;
        let offsetY = 0;
        
        switch (this.waveType) {
            case 'sine':
                // Standard sine wave perpendicular to direction
                const sineOffset = Math.sin(this.waveTime + this.phaseOffset) * this.amplitude;
                offsetX = this.waveAxisX * sineOffset;
                offsetY = this.waveAxisY * sineOffset;
                break;
                
            case 'cosine':
                // Cosine wave (90 degree phase shift from sine)
                const cosineOffset = Math.cos(this.waveTime + this.phaseOffset) * this.amplitude;
                offsetX = this.waveAxisX * cosineOffset;
                offsetY = this.waveAxisY * cosineOffset;
                break;
                
            case 'both':
                // Sine on X, Cosine on Y (creates circular/elliptical motion)
                const sineX = Math.sin(this.waveTime + this.phaseOffset) * this.amplitude;
                const cosineY = Math.cos(this.waveTime + this.phaseOffset) * this.amplitude;
                offsetX = this.waveAxisX * sineX + Math.cos(this.baseAngle) * cosineY * 0.5;
                offsetY = this.waveAxisY * sineX + Math.sin(this.baseAngle) * cosineY * 0.5;
                break;
                
            case 'spiral':
                // Spiral pattern (expanding circle)
                const spiralRadius = this.amplitude + (this.waveTime * this.spiralRadiusGrowth);
                const spiralAngle = this.waveTime * this.spiralAngleSpeed + this.phaseOffset;
                offsetX = Math.cos(spiralAngle) * spiralRadius;
                offsetY = Math.sin(spiralAngle) * spiralRadius;
                break;
                
            case 'figure8':
                // Figure-8 / lemniscate pattern
                const t = this.waveTime + this.phaseOffset;
                const scale = this.amplitude * this.figure8Scale;
                // Lemniscate parametric equations
                const denom = 1 + Math.sin(t) * Math.sin(t);
                offsetX = (Math.cos(t) * scale) / denom;
                offsetY = (Math.sin(t) * Math.cos(t) * scale) / denom;
                // Rotate to align with movement direction
                const rotatedX = offsetX * Math.cos(this.baseAngle) - offsetY * Math.sin(this.baseAngle);
                const rotatedY = offsetX * Math.sin(this.baseAngle) + offsetY * Math.cos(this.baseAngle);
                offsetX = rotatedX;
                offsetY = rotatedY;
                break;
        }
        
        // Apply wave offset to center position
        this.x = this.centerX + offsetX;
        this.y = this.centerY + offsetY;
        
        // Update vx, vy for collision/parent compatibility
        if (this.trail.length > 1) {
            const prevPos = this.trail[this.trail.length - 2];
            this.vx = this.x - prevPos.x;
            this.vy = this.y - prevPos.y;
        }
        
        // Rotation
        if (this.rotateWithDirection && (this.vx !== 0 || this.vy !== 0)) {
            this.rotation = Math.atan2(this.vy, this.vx);
        }
        
        // Deactivate if out of bounds
        const margin = 50;
        const box = CONFIG.BATTLE_BOX;
        if (this.centerX < box.x - margin ||
            this.centerX > box.x + box.width + margin ||
            this.centerY < box.y - margin ||
            this.centerY > box.y + box.height + margin) {
            this.active = false;
        }
    }
    
    drawDefault(ctx) {
        // Draw trail
        if (this.showTrail && this.trail.length > 1) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x - this.x, this.trail[0].y - this.y);
            
            for (let i = 1; i < this.trail.length; i++) {
                const alpha = (i / this.trail.length) * 0.5;
                ctx.globalAlpha = alpha;
                ctx.lineTo(this.trail[i].x - this.x, this.trail[i].y - this.y);
            }
            
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        
        // Draw main projectile
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        
        // Glow effect for wave projectiles
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.size / 2 - 2, -this.size / 2 - 2, this.size + 4, this.size + 4);
        ctx.globalAlpha = 1;
    }
}

/**
 * Rotating Beam Attack - sweeping laser beam
 * Features:
 * - Rotating beam from fixed origin point
 * - Configurable rotation speed and direction
 * - Telegraph/warning phase before activation
 * - Variable beam length and width
 * - Angular range (full rotation or limited arc)
 * - Safe zones at origin
 * - Visual charging effect
 * 
 * Perfect for:
 * - Mettaton EX spinning attacks
 * - Photoshop Flowey laser sweeps
 * - Boss arena-clearing moves
 * - Dramatic sweeping patterns
 */
export class RotatingBeam extends AttackObject {
    constructor(x, y, config = {}) {
        super(x, y, { ...config, type: 'rotating_beam' });
        
        // Beam properties
        this.beamLength = config.beamLength || 200;
        this.beamWidth = config.beamWidth || 20;
        this.color = config.color || '#ff0000';
        
        // Rotation properties
        this.angle = config.startAngle || 0; // Current angle (radians)
        this.rotationSpeed = config.rotationSpeed || 0.05; // Radians per frame
        this.rotationDirection = config.rotationDirection || 1; // 1 or -1
        
        // Angular range
        this.hasAngularLimit = config.hasAngularLimit || false;
        this.minAngle = config.minAngle || 0;
        this.maxAngle = config.maxAngle || Math.PI * 2;
        this.reverseAtLimit = config.reverseAtLimit || false; // Oscillate instead of stop
        
        // Lifecycle phases
        this.phase = 'telegraph'; // telegraph, active, fadeout, complete
        this.telegraphDuration = config.telegraphDuration || 60; // Frames
        this.activeDuration = config.activeDuration || 180; // Frames
        this.fadeoutDuration = config.fadeoutDuration || 20; // Frames
        this.phaseTimer = 0;
        
        // Visual effects
        this.telegraphAlpha = 0;
        this.beamAlpha = 0;
        this.pulseTimer = 0;
        
        // Origin safe zone
        this.safeZoneRadius = config.safeZoneRadius || 30;
        
        // Battle box reference (for clamping length)
        this.battleBox = config.battleBox || CONFIG.BATTLE_BOX;
        
        // Callbacks
        this.onActivate = config.onActivate || null;
        this.onComplete = config.onComplete || null;
    }
    
    update() {
        // Call parent update for modifiers and state machine
        super.update();
        
        this.phaseTimer++;
        this.pulseTimer += 0.1;
        
        // Phase management
        switch (this.phase) {
            case 'telegraph':
                // Warning phase - show where beam will be
                this.telegraphAlpha = Math.min(this.phaseTimer / 30, 1) * 0.5;
                
                if (this.phaseTimer >= this.telegraphDuration) {
                    this.phase = 'active';
                    this.phaseTimer = 0;
                    this.beamAlpha = 1;
                    if (this.onActivate) this.onActivate(this);
                }
                break;
                
            case 'active':
                // Beam is active and rotating
                this.beamAlpha = 1;
                
                // Rotate beam
                this.angle += this.rotationSpeed * this.rotationDirection;
                
                // Handle angular limits
                if (this.hasAngularLimit) {
                    if (this.angle > this.maxAngle || this.angle < this.minAngle) {
                        if (this.reverseAtLimit) {
                            // Oscillate back and forth
                            this.rotationDirection *= -1;
                            this.angle = Math.max(this.minAngle, Math.min(this.maxAngle, this.angle));
                        } else {
                            // Clamp to range
                            this.angle = Math.max(this.minAngle, Math.min(this.maxAngle, this.angle));
                        }
                    }
                }
                
                // Normalize angle
                while (this.angle > Math.PI * 2) this.angle -= Math.PI * 2;
                while (this.angle < 0) this.angle += Math.PI * 2;
                
                if (this.phaseTimer >= this.activeDuration) {
                    this.phase = 'fadeout';
                    this.phaseTimer = 0;
                }
                break;
                
            case 'fadeout':
                // Beam fading out
                this.beamAlpha = 1 - (this.phaseTimer / this.fadeoutDuration);
                
                if (this.phaseTimer >= this.fadeoutDuration) {
                    this.phase = 'complete';
                    this.active = false;
                    if (this.onComplete) this.onComplete(this);
                }
                break;
        }
    }
    
    /**
     * Check if a point collides with the beam
     * @param {number} px - Point X
     * @param {number} py - Point Y
     * @param {number} radius - Point radius (for circle collision)
     * @returns {boolean} - True if collision
     */
    collidesWith(px, py, radius = 0) {
        // Only collide during active phase
        if (this.phase !== 'active') return false;
        
        // Check if point is in safe zone
        const dx = px - this.x;
        const dy = py - this.y;
        const distFromOrigin = Math.sqrt(dx * dx + dy * dy);
        
        if (distFromOrigin < this.safeZoneRadius) return false;
        
        // Calculate beam end point
        const beamEndX = this.x + Math.cos(this.angle) * this.beamLength;
        const beamEndY = this.y + Math.sin(this.angle) * this.beamLength;
        
        // Line segment collision with circle (point + radius)
        // Using distance from point to line segment
        const lineLength = this.beamLength;
        if (lineLength === 0) return false;
        
        // Vector from beam start to point
        const vectorX = px - this.x;
        const vectorY = py - this.y;
        
        // Vector along beam
        const beamDirX = Math.cos(this.angle);
        const beamDirY = Math.sin(this.angle);
        
        // Project point onto beam line
        const projection = (vectorX * beamDirX + vectorY * beamDirY);
        
        // Clamp projection to beam length
        const clampedProjection = Math.max(this.safeZoneRadius, Math.min(lineLength, projection));
        
        // Closest point on beam to the point
        const closestX = this.x + beamDirX * clampedProjection;
        const closestY = this.y + beamDirY * clampedProjection;
        
        // Distance from point to closest point on beam
        const distX = px - closestX;
        const distY = py - closestY;
        const distance = Math.sqrt(distX * distX + distY * distY);
        
        // Check if within beam width + point radius
        return distance < (this.beamWidth / 2 + radius);
    }
    
    drawDefault(ctx) {
        // Draw telegraph phase
        if (this.phase === 'telegraph' && this.telegraphAlpha > 0) {
            ctx.save();
            ctx.globalAlpha = this.telegraphAlpha;
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            
            // Draw telegraph line
            ctx.beginPath();
            ctx.moveTo(this.safeZoneRadius, 0);
            ctx.lineTo(this.beamLength, 0);
            ctx.stroke();
            
            // Draw pulsing warning
            const pulseAlpha = (Math.sin(this.pulseTimer) * 0.5 + 0.5) * 0.3;
            ctx.fillStyle = `rgba(255, 255, 0, ${pulseAlpha})`;
            ctx.fillRect(this.safeZoneRadius, -this.beamWidth / 2, this.beamLength - this.safeZoneRadius, this.beamWidth);
            
            ctx.setLineDash([]);
            ctx.restore();
        }
        
        // Draw active beam
        if (this.phase === 'active' || this.phase === 'fadeout') {
            ctx.save();
            ctx.globalAlpha = this.beamAlpha;
            
            // Draw beam gradient
            const gradient = ctx.createLinearGradient(this.safeZoneRadius, 0, this.beamLength, 0);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(0.5, this.color);
            gradient.addColorStop(1, this.color + '00'); // Fade at end
            
            ctx.fillStyle = gradient;
            ctx.fillRect(this.safeZoneRadius, -this.beamWidth / 2, this.beamLength - this.safeZoneRadius, this.beamWidth);
            
            // Draw beam core (brighter center)
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = this.beamAlpha * 0.5;
            ctx.fillRect(this.safeZoneRadius, -this.beamWidth / 4, this.beamLength - this.safeZoneRadius, this.beamWidth / 2);
            
            ctx.restore();
        }
        
        // Draw origin point (safe zone indicator)
        if (this.phase !== 'complete') {
            ctx.fillStyle = this.phase === 'active' ? '#ff0000' : '#ffff00';
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(0, 0, this.safeZoneRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            
            // Origin marker
            ctx.strokeStyle = this.phase === 'active' ? '#ff0000' : '#ffff00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, this.safeZoneRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    getBounds() {
        // Return circular bounds covering entire rotation
        return {
            x: this.x - this.beamLength + this.hitboxOffsetX,
            y: this.y - this.beamLength + this.hitboxOffsetY,
            width: this.beamLength * 2,
            height: this.beamLength * 2
        };
    }
}

/**
 * Circle attack - expands or contracts - ENHANCED
 */
export class CircleAttack extends AttackObject {
    constructor(x, y, startRadius, endRadius, duration, color = '#ffffff', config = {}) {
        super(x, y, { ...config, type: 'circle' });
        this.startRadius = startRadius;
        this.endRadius = endRadius;
        this.radius = startRadius;
        this.duration = duration;
        this.elapsed = 0;
        this.color = color;
    }
    
    update() {
        // Call parent update for modifiers and state machine
        super.update();
        
        this.elapsed++;
        const progress = Math.min(this.elapsed / this.duration, 1);
        this.radius = this.startRadius + (this.endRadius - this.startRadius) * progress;
        
        if (progress >= 1) {
            this.active = false;
        }
    }
    
    drawDefault(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = ATTACK.CIRCLE_LINE_WIDTH;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    getBounds() {
        // Ring collision - only the outline
        return {
            x: this.x - this.radius + this.hitboxOffsetX,
            y: this.y - this.radius + this.hitboxOffsetY,
            width: this.radius * 2 * this.scale,
            height: this.radius * 2 * this.scale
        };
    }
}

/**
 * WallAttack class - Moving walls with gaps that player must dodge through
 * Essential for Sans bone wall patterns and similar attacks
 * 
 * Features:
 * - Moves from one side of battle box to opposite side
 * - One or more gaps that player must pass through
 * - Configurable wall thickness, speed, and gap positions
 * - Telegraph warning before wall appears
 * - Can be horizontal or vertical orientation
 * 
 * Usage:
 * spawnWallAttack({
 *     side: 'left',           // Starting side: 'left', 'right', 'top', 'bottom'
 *     thickness: 60,          // Wall thickness in pixels
 *     speed: 3,               // Movement speed
 *     gaps: [                 // Array of gap definitions
 *         { position: 0.3, size: 80 },  // Gap at 30% along wall, 80px wide
 *         { position: 0.7, size: 70 }   // Gap at 70% along wall, 70px wide
 *     ],
 *     color: '#ffffff'
 * });
 */
export class WallAttack extends AttackObject {
    constructor(x, y, options = {}) {
        super(x, y, 1, 1); // Dimensions set by orientation
        
        // Wall configuration
        this.side = options.side || 'left'; // Starting side
        this.thickness = options.thickness || 60;
        this.speed = options.speed || 3;
        this.color = options.color || '#ffffff';
        this.damage = options.damage || 1;
        
        // Gap configuration - array of { position, size }
        // position: 0-1 representing position along wall length
        // size: gap width/height in pixels
        this.gaps = options.gaps || [{ position: 0.5, size: 80 }];
        
        // Telegraph configuration
        this.telegraphDuration = options.telegraphDuration || 45; // frames
        this.phase = 'telegraph'; // 'telegraph' -> 'active'
        this.phaseFrameCount = 0;
        
        // Movement configuration
        this.isHorizontal = (this.side === 'top' || this.side === 'bottom');
        this.direction = this.calculateDirection();
        
        // Set initial position and dimensions
        this.setupWall();
        
        // Visual effects
        this.alpha = 1.0;
        this.warningAlpha = 0.5;
        
        // Callbacks
        this.onComplete = options.onComplete || null;
        
        // Track frame count
        this.frameCount = 0;
    }
    
    /**
     * Calculate movement direction based on starting side
     */
    calculateDirection() {
        switch (this.side) {
            case 'left': return { x: 1, y: 0 };
            case 'right': return { x: -1, y: 0 };
            case 'top': return { y: 1, x: 0 };
            case 'bottom': return { y: -1, x: 0 };
            default: return { x: 1, y: 0 };
        }
    }
    
    /**
     * Setup wall position and dimensions based on side
     */
    setupWall() {
        const battleBox = CONFIG.BATTLE_BOX;
        
        if (this.isHorizontal) {
            // Horizontal wall (top/bottom)
            this.width = battleBox.width;
            this.height = this.thickness;
            this.x = battleBox.x;
            
            if (this.side === 'top') {
                this.y = battleBox.y - this.thickness; // Start above box
            } else {
                this.y = battleBox.y + battleBox.height; // Start below box
            }
        } else {
            // Vertical wall (left/right)
            this.width = this.thickness;
            this.height = battleBox.height;
            this.y = battleBox.y;
            
            if (this.side === 'left') {
                this.x = battleBox.x - this.thickness; // Start left of box
            } else {
                this.x = battleBox.x + battleBox.width; // Start right of box
            }
        }
    }
    
    /**
     * Update wall position and phase
     */
    update() {
        super.update();
        
        this.frameCount++;
        this.phaseFrameCount++;
        
        // Handle phase transitions
        if (this.phase === 'telegraph') {
            if (this.phaseFrameCount >= this.telegraphDuration) {
                this.phase = 'active';
                this.phaseFrameCount = 0;
            }
            // Pulse warning alpha during telegraph
            this.warningAlpha = 0.3 + Math.sin(this.frameCount * 0.15) * 0.3;
            return; // Don't move during telegraph
        }
        
        // Active phase - move wall
        if (this.phase === 'active') {
            this.x += this.direction.x * this.speed;
            this.y += this.direction.y * this.speed;
            
            // Check if wall has completely passed through battle box
            if (this.hasPassedBattleBox()) {
                this.active = false;
                if (this.onComplete) this.onComplete();
            }
        }
    }
    
    /**
     * Check if wall has completely passed through battle box
     */
    hasPassedBattleBox() {
        const battleBox = CONFIG.BATTLE_BOX;
        
        switch (this.side) {
            case 'left':
                return this.x > battleBox.x + battleBox.width;
            case 'right':
                return this.x + this.width < battleBox.x;
            case 'top':
                return this.y > battleBox.y + battleBox.height;
            case 'bottom':
                return this.y + this.height < battleBox.y;
            default:
                return false;
        }
    }
    
    /**
     * Custom collision detection - check if soul is in wall but not in gap
     */
    collidesWith(soulCenterX, soulCenterY, soulRadius) {
        // No collision during telegraph
        if (this.phase === 'telegraph') return false;
        
        // First check if soul is within wall bounds at all
        const soulLeft = soulCenterX - soulRadius;
        const soulRight = soulCenterX + soulRadius;
        const soulTop = soulCenterY - soulRadius;
        const soulBottom = soulCenterY + soulRadius;
        
        const wallLeft = this.x;
        const wallRight = this.x + this.width;
        const wallTop = this.y;
        const wallBottom = this.y + this.height;
        
        // Check basic AABB collision
        const inWall = (
            soulLeft < wallRight &&
            soulRight > wallLeft &&
            soulTop < wallBottom &&
            soulBottom > wallTop
        );
        
        if (!inWall) return false;
        
        // Soul is in wall - check if it's in any gap
        for (const gap of this.gaps) {
            if (this.isInGap(soulCenterX, soulCenterY, soulRadius, gap)) {
                return false; // In gap - no collision
            }
        }
        
        // In wall but not in gap - collision!
        return true;
    }
    
    /**
     * Check if soul is within a gap
     */
    isInGap(soulCenterX, soulCenterY, soulRadius, gap) {
        if (this.isHorizontal) {
            // Horizontal wall - gaps run vertically
            const gapX = this.x + (this.width * gap.position);
            const gapLeft = gapX - gap.size / 2;
            const gapRight = gapX + gap.size / 2;
            
            return (soulCenterX + soulRadius > gapLeft && 
                    soulCenterX - soulRadius < gapRight);
        } else {
            // Vertical wall - gaps run horizontally
            const gapY = this.y + (this.height * gap.position);
            const gapTop = gapY - gap.size / 2;
            const gapBottom = gapY + gap.size / 2;
            
            return (soulCenterY + soulRadius > gapTop && 
                    soulCenterY - soulRadius < gapBottom);
        }
    }
    
    /**
     * Draw wall with gaps
     */
    drawDefault(ctx) {
        ctx.globalAlpha = this.alpha;
        
        if (this.phase === 'telegraph') {
            // Draw warning indicator at spawn position
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 3;
            ctx.globalAlpha = this.warningAlpha;
            ctx.setLineDash([8, 8]);
            ctx.strokeRect(0, 0, this.width, this.height);
            ctx.setLineDash([]);
            ctx.globalAlpha = this.alpha;
            return;
        }
        
        // Active phase - draw solid wall with gaps
        ctx.fillStyle = this.color;
        
        if (this.isHorizontal) {
            // Draw horizontal wall with vertical gaps
            let lastX = 0;
            
            // Sort gaps by position
            const sortedGaps = [...this.gaps].sort((a, b) => a.position - b.position);
            
            for (const gap of sortedGaps) {
                const gapX = this.width * gap.position;
                const gapLeft = gapX - gap.size / 2;
                
                // Draw wall segment before gap
                if (gapLeft > lastX) {
                    ctx.fillRect(lastX, 0, gapLeft - lastX, this.height);
                }
                
                lastX = gapX + gap.size / 2;
            }
            
            // Draw final segment after last gap
            if (lastX < this.width) {
                ctx.fillRect(lastX, 0, this.width - lastX, this.height);
            }
        } else {
            // Draw vertical wall with horizontal gaps
            let lastY = 0;
            
            // Sort gaps by position
            const sortedGaps = [...this.gaps].sort((a, b) => a.position - b.position);
            
            for (const gap of sortedGaps) {
                const gapY = this.height * gap.position;
                const gapTop = gapY - gap.size / 2;
                
                // Draw wall segment before gap
                if (gapTop > lastY) {
                    ctx.fillRect(0, lastY, this.width, gapTop - lastY);
                }
                
                lastY = gapY + gap.size / 2;
            }
            
            // Draw final segment after last gap
            if (lastY < this.height) {
                ctx.fillRect(0, lastY, this.width, this.height - lastY);
            }
        }
        
        ctx.globalAlpha = 1.0;
    }
    
    /**
     * Get bounds for culling
     */
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
 * GasterBlaster class - Sans' signature attack
 * Skull appears with telegraph, charges up, then fires a directional beam
 * 
 * Features:
 * - Three-phase lifecycle: appear → charge → fire → fadeout
 * - Skull sprite with glowing eye during charge
 * - Directional beam firing toward target
 * - Custom collision detection for beam
 * - Visual charge-up effects (shake, glow pulse)
 * 
 * Usage:
 * spawnGasterBlaster({
 *     x: 100,                    // Spawn position X
 *     y: 100,                    // Spawn position Y
 *     targetX: 320,              // Aim toward this X
 *     targetY: 240,              // Aim toward this Y
 *     appearDuration: 30,        // Skull appear phase
 *     chargeDuration: 60,        // Charge-up phase
 *     fireDuration: 45,          // Beam active phase
 *     fadeoutDuration: 20        // Disappear phase
 * });
 */
export class GasterBlaster extends AttackObject {
    constructor(x, y, options = {}) {
        super(x, y, 60, 60); // Base skull size
        
        // Target position (where to aim)
        this.targetX = options.targetX || (CONFIG.BATTLE_BOX.x + CONFIG.BATTLE_BOX.width / 2);
        this.targetY = options.targetY || (CONFIG.BATTLE_BOX.y + CONFIG.BATTLE_BOX.height / 2);
        
        // Calculate angle to target
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        this.angle = Math.atan2(dy, dx);
        
        // Beam configuration
        this.beamLength = options.beamLength || 400;
        this.beamWidth = options.beamWidth || 30;
        this.beamColor = options.beamColor || '#ffffff';
        this.damage = options.damage || 1;
        
        // Phase durations (in frames)
        this.appearDuration = options.appearDuration || 30;
        this.chargeDuration = options.chargeDuration || 60;
        this.fireDuration = options.fireDuration || 45;
        this.fadeoutDuration = options.fadeoutDuration || 20;
        
        // Phase state machine
        this.phase = 'appear'; // 'appear' -> 'charge' -> 'fire' -> 'fadeout'
        this.phaseFrameCount = 0;
        
        // Visual effects
        this.alpha = 0;
        this.skullScale = 0.5;
        this.chargeGlow = 0;
        this.shakeX = 0;
        this.shakeY = 0;
        this.eyeGlow = 0;
        
        // Skull visual properties
        this.skullWidth = 60;
        this.skullHeight = 60;
        this.jawOffset = 0; // Jaw opens during charge
        
        // Callbacks
        this.onCharge = options.onCharge || null;
        this.onFire = options.onFire || null;
        this.onComplete = options.onComplete || null;
        
        // Frame counter
        this.frameCount = 0;
    }
    
    /**
     * Update blaster state and phase transitions
     */
    update() {
        super.update();
        
        this.frameCount++;
        this.phaseFrameCount++;
        
        switch (this.phase) {
            case 'appear':
                this.updateAppear();
                break;
            case 'charge':
                this.updateCharge();
                break;
            case 'fire':
                this.updateFire();
                break;
            case 'fadeout':
                this.updateFadeout();
                break;
        }
    }
    
    /**
     * Appear phase - skull materializes
     */
    updateAppear() {
        const progress = this.phaseFrameCount / this.appearDuration;
        
        // Fade in and scale up
        this.alpha = progress;
        this.skullScale = 0.5 + (progress * 0.5); // 0.5 to 1.0
        
        if (this.phaseFrameCount >= this.appearDuration) {
            this.phase = 'charge';
            this.phaseFrameCount = 0;
            if (this.onCharge) this.onCharge();
        }
    }
    
    /**
     * Charge phase - building up energy
     */
    updateCharge() {
        const progress = this.phaseFrameCount / this.chargeDuration;
        
        // Full opacity
        this.alpha = 1.0;
        
        // Pulsing glow effect
        this.chargeGlow = Math.sin(this.phaseFrameCount * 0.15) * 0.5 + 0.5;
        
        // Eye glow intensifies
        this.eyeGlow = progress;
        
        // Jaw opens
        this.jawOffset = progress * 15;
        
        // Shake effect (increases with charge)
        const shakeIntensity = progress * 2;
        this.shakeX = (Math.random() - 0.5) * shakeIntensity;
        this.shakeY = (Math.random() - 0.5) * shakeIntensity;
        
        if (this.phaseFrameCount >= this.chargeDuration) {
            this.phase = 'fire';
            this.phaseFrameCount = 0;
            this.shakeX = 0;
            this.shakeY = 0;
            if (this.onFire) this.onFire();
        }
    }
    
    /**
     * Fire phase - beam is active
     */
    updateFire() {
        const progress = this.phaseFrameCount / this.fireDuration;
        
        // Full opacity
        this.alpha = 1.0;
        
        // Jaw fully open
        this.jawOffset = 20;
        
        // Eye at max glow
        this.eyeGlow = 1.0;
        
        // Pulsing beam intensity
        this.chargeGlow = 0.7 + Math.sin(this.frameCount * 0.2) * 0.3;
        
        if (this.phaseFrameCount >= this.fireDuration) {
            this.phase = 'fadeout';
            this.phaseFrameCount = 0;
        }
    }
    
    /**
     * Fadeout phase - skull disappears
     */
    updateFadeout() {
        const progress = this.phaseFrameCount / this.fadeoutDuration;
        
        // Fade out
        this.alpha = 1.0 - progress;
        
        // Jaw closes
        this.jawOffset = 20 - (progress * 20);
        
        // Eye dims
        this.eyeGlow = 1.0 - progress;
        
        if (this.phaseFrameCount >= this.fadeoutDuration) {
            this.active = false;
            if (this.onComplete) this.onComplete();
        }
    }
    
    /**
     * Custom collision detection - only during fire phase, checks beam line
     */
    collidesWith(soulCenterX, soulCenterY, soulRadius) {
        // Only collide during fire phase
        if (this.phase !== 'fire') return false;
        
        // Calculate beam starting point (from skull mouth)
        const mouthOffsetX = Math.cos(this.angle) * (this.skullWidth / 2);
        const mouthOffsetY = Math.sin(this.angle) * (this.skullHeight / 2);
        const beamStartX = this.x + mouthOffsetX;
        const beamStartY = this.y + mouthOffsetY;
        
        // Calculate beam end point
        const beamEndX = beamStartX + Math.cos(this.angle) * this.beamLength;
        const beamEndY = beamStartY + Math.sin(this.angle) * this.beamLength;
        
        // Line segment to circle collision
        const dx = beamEndX - beamStartX;
        const dy = beamEndY - beamStartY;
        const len2 = dx * dx + dy * dy;
        
        if (len2 === 0) return false;
        
        let t = ((soulCenterX - beamStartX) * dx + (soulCenterY - beamStartY) * dy) / len2;
        t = Math.max(0, Math.min(1, t));
        
        // Find nearest point on beam
        const nearestX = beamStartX + t * dx;
        const nearestY = beamStartY + t * dy;
        
        // Calculate distance to nearest point
        const distance = Math.sqrt(
            Math.pow(soulCenterX - nearestX, 2) + 
            Math.pow(soulCenterY - nearestY, 2)
        );
        
        return distance < (this.beamWidth / 2 + soulRadius);
    }
    
    /**
     * Draw Gaster Blaster
     */
    drawDefault(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Apply shake during charge
        ctx.translate(this.shakeX, this.shakeY);
        
        // Rotate to face target
        ctx.rotate(this.angle);
        ctx.scale(this.skullScale, this.skullScale);
        
        // Draw skull (simplified representation)
        this.drawSkull(ctx);
        
        ctx.restore();
        
        // Draw beam during fire phase
        if (this.phase === 'fire') {
            this.drawBeam(ctx);
        }
    }
    
    /**
     * Draw skull sprite (simplified)
     */
    drawSkull(ctx) {
        const halfWidth = this.skullWidth / 2;
        const halfHeight = this.skullHeight / 2;
        
        // Main skull body
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        // Upper skull (rounded rectangle)
        ctx.beginPath();
        ctx.ellipse(-halfWidth * 0.3, -halfHeight * 0.3, halfWidth * 0.8, halfHeight * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Eye socket (left when facing right)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(-halfWidth * 0.3, -halfHeight * 0.3, halfWidth * 0.2, halfHeight * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye glow during charge/fire
        if (this.eyeGlow > 0) {
            const glowSize = this.eyeGlow * 0.15;
            const gradient = ctx.createRadialGradient(
                -halfWidth * 0.3, -halfHeight * 0.3, 0,
                -halfWidth * 0.3, -halfHeight * 0.3, halfWidth * glowSize
            );
            gradient.addColorStop(0, `rgba(0, 255, 255, ${this.eyeGlow})`);
            gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(-halfWidth * 0.3, -halfHeight * 0.3, halfWidth * glowSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Lower jaw
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(-halfWidth * 0.2, halfHeight * 0.2 + this.jawOffset, halfWidth * 0.7, halfHeight * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Teeth (simple lines)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const toothX = -halfWidth * 0.6 + (i * halfWidth * 0.3);
            ctx.beginPath();
            ctx.moveTo(toothX, 0);
            ctx.lineTo(toothX, this.jawOffset * 0.5);
            ctx.stroke();
        }
        
        // Charge glow around skull
        if (this.chargeGlow > 0 && (this.phase === 'charge' || this.phase === 'fire')) {
            const gradient = ctx.createRadialGradient(
                0, 0, 0,
                0, 0, halfWidth * 1.5
            );
            gradient.addColorStop(0, `rgba(0, 255, 255, ${this.chargeGlow * 0.3})`);
            gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, halfWidth * 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    /**
     * Draw beam during fire phase
     */
    drawBeam(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha * this.chargeGlow;
        
        // Calculate beam starting point (from skull mouth)
        const mouthOffsetX = Math.cos(this.angle) * (this.skullWidth / 2);
        const mouthOffsetY = Math.sin(this.angle) * (this.skullHeight / 2);
        const beamStartX = mouthOffsetX;
        const beamStartY = mouthOffsetY;
        
        // Calculate beam end point
        const beamEndX = beamStartX + Math.cos(this.angle) * this.beamLength;
        const beamEndY = beamStartY + Math.sin(this.angle) * this.beamLength;
        
        // Draw beam with gradient
        const gradient = ctx.createLinearGradient(beamStartX, beamStartY, beamEndX, beamEndY);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#00ffff');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0.3)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = this.beamWidth;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(beamStartX, beamStartY);
        ctx.lineTo(beamEndX, beamEndY);
        ctx.stroke();
        
        // Inner white core
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = this.beamWidth * 0.4;
        ctx.beginPath();
        ctx.moveTo(beamStartX, beamStartY);
        ctx.lineTo(beamEndX, beamEndY);
        ctx.stroke();
        
        ctx.restore();
    }
    
    /**
     * Get bounds for culling
     */
    getBounds() {
        // Encompass skull and beam
        const maxExtent = Math.max(this.skullWidth, this.beamLength);
        return {
            x: this.x - maxExtent,
            y: this.y - maxExtent,
            width: maxExtent * 2,
            height: maxExtent * 2
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
            case 'blue_bones':
                this.spawnBlueBones(wave, box);
                break;
            case 'orange_bones':
                this.spawnOrangeBones(wave, box);
                break;
            case 'blue_projectiles':
                this.spawnBlueProjectiles(wave, box);
                break;
            case 'orange_projectiles':
                this.spawnOrangeProjectiles(wave, box);
                break;
            case 'homing_projectiles':
                this.spawnHomingProjectiles(wave, box);
                break;
            case 'bouncing_projectiles':
                this.spawnBouncingProjectiles(wave, box);
                break;
            case 'exploding_projectiles':
                this.spawnExplodingProjectiles(wave, box);
                break;
            case 'arc_projectiles':
                this.spawnArcProjectiles(wave, box);
                break;
            case 'wave_projectiles':
                this.spawnWaveProjectiles(wave, box);
                break;
            case 'rotating_beam':
                this.spawnRotatingBeam(wave, box);
                break;
            case 'wall_attack':
                this.spawnWallAttack(wave, box);
                break;
            case 'gaster_blaster':
                this.spawnGasterBlaster(wave, box);
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
     * Spawn blue bone attacks (must stand still)
     */
    spawnBlueBones(wave, box) {
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
            
            this.objects.push(new BlueBone(x, y, width, height, vx, vy));
        }
    }
    
    /**
     * Spawn orange bone attacks (must be moving)
     */
    spawnOrangeBones(wave, box) {
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
            
            this.objects.push(new OrangeBone(x, y, width, height, vx, vy));
        }
    }
    
    /**
     * Spawn blue projectile attacks (must stand still)
     */
    spawnBlueProjectiles(wave, box) {
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
            
            this.objects.push(new BlueProjectile(x, y, vx, vy, size));
        }
    }
    
    /**
     * Spawn orange projectile attacks (must be moving)
     */
    spawnOrangeProjectiles(wave, box) {
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
            
            this.objects.push(new OrangeProjectile(x, y, vx, vy, size));
        }
    }
    
    /**
     * Spawn homing projectiles (TODO #4)
     */
    spawnHomingProjectiles(wave, box) {
        const count = wave.count || 1;
        const speed = wave.speed || 2;
        const size = wave.size || ATTACK.DEFAULT_PROJECTILE_SIZE;
        const color = wave.color || '#ff00ff';
        
        for (let i = 0; i < count; i++) {
            const side = wave.side || ['left', 'right', 'top', 'bottom'][randomInt(0, 3)];
            let x, y, initialVx = 0, initialVy = 0;
            
            // Spawn from side
            switch (side) {
                case 'left':
                    x = box.x - 50;
                    y = box.y + randomInt(0, box.height);
                    initialVx = speed * 0.5;
                    break;
                case 'right':
                    x = box.x + box.width + 50;
                    y = box.y + randomInt(0, box.height);
                    initialVx = -speed * 0.5;
                    break;
                case 'top':
                    x = box.x + randomInt(0, box.width);
                    y = box.y - 50;
                    initialVy = speed * 0.5;
                    break;
                case 'bottom':
                    x = box.x + randomInt(0, box.width);
                    y = box.y + box.height + 50;
                    initialVy = -speed * 0.5;
                    break;
            }
            
            const homing = new HomingProjectile(x, y, speed, size, color, {
                homingStrength: wave.homingStrength || 0.1,
                homingDelay: wave.homingDelay || 0,
                initialVx: initialVx,
                initialVy: initialVy,
                useAcceleration: wave.useAcceleration || false,
                acceleration: wave.acceleration || 0.2,
                maxSpeed: wave.maxSpeed || speed * 2,
                stateMachine: wave.stateMachine || null
            });
            
            this.objects.push(homing);
        }
    }
    
    /**
     * Spawn bouncing projectiles (TODO #5)
     */
    spawnBouncingProjectiles(wave, box) {
        const count = wave.count || 1;
        const speed = wave.speed || 3;
        const size = wave.size || ATTACK.DEFAULT_PROJECTILE_SIZE;
        const color = wave.color || '#00ffff';
        
        for (let i = 0; i < count; i++) {
            // Spawn position
            let x, y;
            if (wave.spawnPosition === 'random') {
                x = box.x + randomInt(box.width * 0.2, box.width * 0.8);
                y = box.y + randomInt(box.height * 0.2, box.height * 0.8);
            } else if (wave.spawnPosition === 'center') {
                x = box.x + box.width / 2;
                y = box.y + box.height / 2;
            } else {
                // Spawn from sides like homing
                const side = wave.side || ['left', 'right', 'top', 'bottom'][randomInt(0, 3)];
                switch (side) {
                    case 'left':
                        x = box.x + 10;
                        y = box.y + randomInt(0, box.height);
                        break;
                    case 'right':
                        x = box.x + box.width - 10;
                        y = box.y + randomInt(0, box.height);
                        break;
                    case 'top':
                        x = box.x + randomInt(0, box.width);
                        y = box.y + 10;
                        break;
                    case 'bottom':
                        x = box.x + randomInt(0, box.width);
                        y = box.y + box.height - 10;
                        break;
                }
            }
            
            // Initial velocity (random or specified)
            let vx, vy;
            if (wave.angle !== undefined) {
                vx = Math.cos(wave.angle) * speed;
                vy = Math.sin(wave.angle) * speed;
            } else if (wave.randomAngle) {
                const angle = randomFloat(0, Math.PI * 2);
                vx = Math.cos(angle) * speed;
                vy = Math.sin(angle) * speed;
            } else {
                // Random velocity
                vx = randomFloat(-speed, speed);
                vy = randomFloat(-speed, speed);
            }
            
            const bouncing = new BouncingProjectile(x, y, vx, vy, size, color, {
                maxBounces: wave.maxBounces !== undefined ? wave.maxBounces : -1,
                energyLoss: wave.energyLoss || 0,
                minSpeed: wave.minSpeed || 0.5,
                battleBox: box,
                wallMargin: wave.wallMargin || 2,
                spinDecay: wave.spinDecay || 0.95,
                stateMachine: wave.stateMachine || null,
                onBounce: wave.onBounce || null
            });
            
            this.objects.push(bouncing);
        }
    }
    
    /**
     * Spawn exploding projectiles (TODO #6)
     */
    spawnExplodingProjectiles(wave, box) {
        const count = wave.count || 1;
        const speed = wave.speed || 2;
        const size = wave.size || ATTACK.DEFAULT_PROJECTILE_SIZE;
        const color = wave.color || '#ff6600';
        
        for (let i = 0; i < count; i++) {
            // Spawn position
            let x, y;
            if (wave.spawnPosition === 'random') {
                x = box.x + randomInt(box.width * 0.2, box.width * 0.8);
                y = box.y + randomInt(box.height * 0.2, box.height * 0.8);
            } else if (wave.spawnPosition === 'center') {
                x = box.x + box.width / 2;
                y = box.y + box.height / 2;
            } else {
                // Spawn from sides
                const side = wave.side || ['left', 'right', 'top', 'bottom'][randomInt(0, 3)];
                switch (side) {
                    case 'left':
                        x = box.x - 50;
                        y = box.y + randomInt(0, box.height);
                        break;
                    case 'right':
                        x = box.x + box.width + 50;
                        y = box.y + randomInt(0, box.height);
                        break;
                    case 'top':
                        x = box.x + randomInt(0, box.width);
                        y = box.y - 50;
                        break;
                    case 'bottom':
                        x = box.x + randomInt(0, box.width);
                        y = box.y + box.height + 50;
                        break;
                }
            }
            
            // Initial velocity
            let vx, vy;
            if (wave.angle !== undefined) {
                vx = Math.cos(wave.angle) * speed;
                vy = Math.sin(wave.angle) * speed;
            } else if (wave.targetCenter) {
                // Aim toward center
                const centerX = box.x + box.width / 2;
                const centerY = box.y + box.height / 2;
                const dx = centerX - x;
                const dy = centerY - y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                vx = (dx / distance) * speed;
                vy = (dy / distance) * speed;
            } else if (wave.randomAngle) {
                const angle = randomFloat(0, Math.PI * 2);
                vx = Math.cos(angle) * speed;
                vy = Math.sin(angle) * speed;
            } else {
                // Default based on side
                const side = wave.side || 'left';
                switch (side) {
                    case 'left':
                        vx = speed;
                        vy = randomFloat(-speed * 0.3, speed * 0.3);
                        break;
                    case 'right':
                        vx = -speed;
                        vy = randomFloat(-speed * 0.3, speed * 0.3);
                        break;
                    case 'top':
                        vx = randomFloat(-speed * 0.3, speed * 0.3);
                        vy = speed;
                        break;
                    case 'bottom':
                        vx = randomFloat(-speed * 0.3, speed * 0.3);
                        vy = -speed;
                        break;
                }
            }
            
            const exploding = new ExplodingProjectile(x, y, vx, vy, size, color, {
                explosionTimer: wave.explosionTimer || 120,
                explodeOnCollision: wave.explodeOnCollision || false,
                explodeOnBounds: wave.explodeOnBounds !== undefined ? wave.explodeOnBounds : true,
                battleBox: box,
                fragmentCount: wave.fragmentCount || 8,
                fragmentSpeed: wave.fragmentSpeed || 2,
                fragmentSize: wave.fragmentSize || size * 0.5,
                fragmentColor: wave.fragmentColor || color,
                fragmentPattern: wave.fragmentPattern || 'uniform',
                fragmentAngleOffset: wave.fragmentAngleOffset || 0,
                fragmentLifespan: wave.fragmentLifespan || 180,
                fragmentFadeOut: wave.fragmentFadeOut !== undefined ? wave.fragmentFadeOut : true,
                warningTime: wave.warningTime || 30,
                pulseSpeed: wave.pulseSpeed || 0.15,
                canChainExplode: wave.canChainExplode || false,
                chainRadius: wave.chainRadius || 50,
                stateMachine: wave.stateMachine || null,
                onExplode: wave.onExplode || null
            });
            
            // Set object array reference for spawning fragments
            exploding.setObjectArray(this.objects);
            
            this.objects.push(exploding);
        }
    }
    
    /**
     * Spawn arc projectiles (TODO #7)
     */
    spawnArcProjectiles(wave, box) {
        const count = wave.count || 1;
        const size = wave.size || ATTACK.DEFAULT_PROJECTILE_SIZE;
        const color = wave.color || '#ff8800';
        const gravity = wave.gravity || 0.15;
        
        for (let i = 0; i < count; i++) {
            let x, y, vx, vy;
            
            // Spawn position
            if (wave.spawnPosition === 'random') {
                x = box.x + randomInt(box.width * 0.2, box.width * 0.8);
                y = box.y + randomInt(box.height * 0.2, box.height * 0.4); // Upper area
            } else if (wave.spawnPosition === 'center') {
                x = box.x + box.width / 2;
                y = box.y + box.height * 0.3;
            } else {
                // Spawn from sides
                const side = wave.side || ['left', 'right', 'top'][randomInt(0, 2)];
                switch (side) {
                    case 'left':
                        x = box.x - 30;
                        y = box.y + randomInt(0, box.height * 0.5);
                        break;
                    case 'right':
                        x = box.x + box.width + 30;
                        y = box.y + randomInt(0, box.height * 0.5);
                        break;
                    case 'top':
                        x = box.x + randomInt(0, box.width);
                        y = box.y - 30;
                        break;
                    case 'bottom':
                        x = box.x + randomInt(0, box.width);
                        y = box.y + box.height + 30;
                        break;
                }
            }
            
            // Velocity calculation
            if (wave.targetPosition) {
                // Arc to specific target
                const targetX = wave.targetPosition.x || (box.x + box.width / 2);
                const targetY = wave.targetPosition.y || (box.y + box.height);
                const arcHeight = wave.arcHeight || 1.0;
                const result = ArcProjectile.calculateArcToTarget(x, y, targetX, targetY, gravity, arcHeight);
                vx = result.vx;
                vy = result.vy;
            } else if (wave.targetSoul) {
                // Arc toward soul position (set by battle system)
                // This would need soul reference - for now use center
                const targetX = box.x + box.width / 2;
                const targetY = box.y + box.height * 0.7;
                const arcHeight = wave.arcHeight || 1.0;
                const result = ArcProjectile.calculateArcToTarget(x, y, targetX, targetY, gravity, arcHeight);
                vx = result.vx;
                vy = result.vy;
            } else if (wave.angle !== undefined && wave.speed !== undefined) {
                // Manual angle and speed
                const speed = wave.speed;
                vx = Math.cos(wave.angle) * speed;
                vy = Math.sin(wave.angle) * speed;
            } else {
                // Random arc pattern
                const side = wave.side || 'left';
                const speed = wave.speed || 3;
                
                switch (side) {
                    case 'left':
                        vx = speed * randomFloat(0.8, 1.2);
                        vy = -speed * randomFloat(1.5, 2.5);
                        break;
                    case 'right':
                        vx = -speed * randomFloat(0.8, 1.2);
                        vy = -speed * randomFloat(1.5, 2.5);
                        break;
                    case 'top':
                        vx = speed * randomFloat(-0.5, 0.5);
                        vy = speed * randomFloat(0.5, 1.5);
                        break;
                    case 'bottom':
                        vx = speed * randomFloat(-0.5, 0.5);
                        vy = -speed * randomFloat(1.5, 2.5);
                        break;
                }
            }
            
            const arc = new ArcProjectile(x, y, vx, vy, size, color, {
                gravity: gravity,
                airResistance: wave.airResistance || 0,
                canBounce: wave.canBounce || false,
                maxBounces: wave.maxBounces || 3,
                bounceDampening: wave.bounceDampening || 0.6,
                groundY: wave.groundY || (box.y + box.height),
                battleBox: box,
                trailLength: wave.trailLength || 5,
                showTrail: wave.showTrail !== undefined ? wave.showTrail : true,
                stateMachine: wave.stateMachine || null,
                onPeak: wave.onPeak || null,
                onGround: wave.onGround || null
            });
            
            this.objects.push(arc);
        }
    }
    
    /**
     * Spawn wave motion projectiles (TODO #8)
     */
    spawnWaveProjectiles(wave, box) {
        const count = wave.count || 1;
        const speed = wave.speed || 2;
        const size = wave.size || ATTACK.DEFAULT_PROJECTILE_SIZE;
        const color = wave.color || '#00ffff';
        
        for (let i = 0; i < count; i++) {
            let x, y, vx, vy;
            
            // Spawn position
            const side = wave.side || ['left', 'right', 'top', 'bottom'][randomInt(0, 3)];
            
            switch (side) {
                case 'left':
                    x = box.x - 30;
                    y = box.y + (wave.spacing ? (box.height / (count + 1)) * (i + 1) : randomInt(0, box.height));
                    vx = speed;
                    vy = 0;
                    break;
                case 'right':
                    x = box.x + box.width + 30;
                    y = box.y + (wave.spacing ? (box.height / (count + 1)) * (i + 1) : randomInt(0, box.height));
                    vx = -speed;
                    vy = 0;
                    break;
                case 'top':
                    x = box.x + (wave.spacing ? (box.width / (count + 1)) * (i + 1) : randomInt(0, box.width));
                    y = box.y - 30;
                    vx = 0;
                    vy = speed;
                    break;
                case 'bottom':
                    x = box.x + (wave.spacing ? (box.width / (count + 1)) * (i + 1) : randomInt(0, box.width));
                    y = box.y + box.height + 30;
                    vx = 0;
                    vy = -speed;
                    break;
            }
            
            // Custom angle override
            if (wave.angle !== undefined) {
                vx = Math.cos(wave.angle) * speed;
                vy = Math.sin(wave.angle) * speed;
            }
            
            // Phase offset for synchronized waves
            const phaseOffset = wave.phaseOffset !== undefined ? wave.phaseOffset : (i * (Math.PI * 2 / count));
            
            const waveProj = new WaveProjectile(x, y, vx, vy, size, color, {
                waveType: wave.waveType || 'sine',
                amplitude: wave.amplitude || 30,
                frequency: wave.frequency || 0.1,
                phaseOffset: phaseOffset,
                trailLength: wave.trailLength || 8,
                showTrail: wave.showTrail !== undefined ? wave.showTrail : true,
                rotateWithDirection: wave.rotateWithDirection !== undefined ? wave.rotateWithDirection : true,
                spiralRadiusGrowth: wave.spiralRadiusGrowth || 0,
                spiralAngleSpeed: wave.spiralAngleSpeed || 0.1,
                figure8Scale: wave.figure8Scale || 1.0,
                stateMachine: wave.stateMachine || null
            });
            
            this.objects.push(waveProj);
        }
    }
    
    /**
     * Spawn rotating beam (TODO #9)
     */
    spawnRotatingBeam(wave, box) {
        // Origin position
        let x, y;
        
        if (wave.origin === 'center') {
            x = box.x + box.width / 2;
            y = box.y + box.height / 2;
        } else if (wave.origin === 'random') {
            x = box.x + randomInt(box.width * 0.3, box.width * 0.7);
            y = box.y + randomInt(box.height * 0.3, box.height * 0.7);
        } else if (wave.originPosition) {
            x = wave.originPosition.x || (box.x + box.width / 2);
            y = wave.originPosition.y || (box.y + box.height / 2);
        } else {
            // Default to center
            x = box.x + box.width / 2;
            y = box.y + box.height / 2;
        }
        
        const beam = new RotatingBeam(x, y, {
            beamLength: wave.beamLength || 200,
            beamWidth: wave.beamWidth || 20,
            color: wave.color || '#ff0000',
            startAngle: wave.startAngle || 0,
            rotationSpeed: wave.rotationSpeed || 0.05,
            rotationDirection: wave.rotationDirection || 1,
            hasAngularLimit: wave.hasAngularLimit || false,
            minAngle: wave.minAngle || 0,
            maxAngle: wave.maxAngle || Math.PI * 2,
            reverseAtLimit: wave.reverseAtLimit || false,
            telegraphDuration: wave.telegraphDuration || 60,
            activeDuration: wave.activeDuration || 180,
            fadeoutDuration: wave.fadeoutDuration || 20,
            safeZoneRadius: wave.safeZoneRadius || 30,
            battleBox: box,
            stateMachine: wave.stateMachine || null,
            onActivate: wave.onActivate || null,
            onComplete: wave.onComplete || null
        });
        
        this.objects.push(beam);
    }
    
    /**
     * Spawn wall attack with gaps (TODO #10)
     */
    spawnWallAttack(wave, box) {
        const wall = new WallAttack(0, 0, {
            side: wave.side || 'left',
            thickness: wave.thickness || 60,
            speed: wave.speed || 3,
            color: wave.color || '#ffffff',
            damage: wave.damage || 1,
            gaps: wave.gaps || [{ position: 0.5, size: 80 }],
            telegraphDuration: wave.telegraphDuration || 45,
            stateMachine: wave.stateMachine || null,
            onComplete: wave.onComplete || null
        });
        
        this.objects.push(wall);
    }
    
    /**
     * Spawn Gaster Blaster (TODO #11)
     */
    spawnGasterBlaster(wave, box) {
        // Determine spawn position
        let spawnX, spawnY;
        
        if (wave.position) {
            // Specific position
            spawnX = wave.position.x || (box.x + box.width / 2);
            spawnY = wave.position.y || (box.y + box.height / 2);
        } else if (wave.side) {
            // Position based on side
            const margin = 80;
            switch (wave.side) {
                case 'left':
                    spawnX = box.x - margin;
                    spawnY = box.y + (box.height * (wave.verticalPosition || 0.5));
                    break;
                case 'right':
                    spawnX = box.x + box.width + margin;
                    spawnY = box.y + (box.height * (wave.verticalPosition || 0.5));
                    break;
                case 'top':
                    spawnX = box.x + (box.width * (wave.horizontalPosition || 0.5));
                    spawnY = box.y - margin;
                    break;
                case 'bottom':
                    spawnX = box.x + (box.width * (wave.horizontalPosition || 0.5));
                    spawnY = box.y + box.height + margin;
                    break;
                default:
                    spawnX = box.x + box.width / 2;
                    spawnY = box.y + box.height / 2;
            }
        } else {
            // Default to center
            spawnX = box.x + box.width / 2;
            spawnY = box.y + box.height / 2;
        }
        
        // Determine target position
        let targetX, targetY;
        
        if (wave.target) {
            targetX = wave.target.x || (box.x + box.width / 2);
            targetY = wave.target.y || (box.y + box.height / 2);
        } else if (wave.targetSoul) {
            // Target will be set dynamically to soul position
            targetX = box.x + box.width / 2;
            targetY = box.y + box.height / 2;
            // TODO: Could enhance to track soul position in real-time
        } else {
            // Default to center
            targetX = box.x + box.width / 2;
            targetY = box.y + box.height / 2;
        }
        
        const blaster = new GasterBlaster(spawnX, spawnY, {
            targetX: targetX,
            targetY: targetY,
            beamLength: wave.beamLength || 400,
            beamWidth: wave.beamWidth || 30,
            beamColor: wave.beamColor || '#ffffff',
            damage: wave.damage || 1,
            appearDuration: wave.appearDuration || 30,
            chargeDuration: wave.chargeDuration || 60,
            fireDuration: wave.fireDuration || 45,
            fadeoutDuration: wave.fadeoutDuration || 20,
            stateMachine: wave.stateMachine || null,
            onCharge: wave.onCharge || null,
            onFire: wave.onFire || null,
            onComplete: wave.onComplete || null
        });
        
        this.objects.push(blaster);
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
