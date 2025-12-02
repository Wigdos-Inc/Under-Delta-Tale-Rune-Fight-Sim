/**
 * attackModifiers.js
 * System for modifying attack properties dynamically
 */

import { Easing, Interpolator } from './easing.js';

/**
 * Attack modifier base class
 */
export class AttackModifier {
    constructor() {
        this.active = true;
    }
    
    /**
     * Apply modifier to attack object
     * @param {Object} attackObj - Attack object to modify
     */
    apply(attackObj) {
        // Override in subclasses
    }
    
    /**
     * Update modifier state
     */
    update() {
        // Override in subclasses
    }
    
    /**
     * Check if modifier is complete
     * @returns {boolean} True if complete
     */
    isComplete() {
        return !this.active;
    }
}

/**
 * Scale modifier - changes size over time
 */
export class ScaleModifier extends AttackModifier {
    constructor(startScale, endScale, duration, easingFn = Easing.linear) {
        super();
        this.scaleInterpolator = new Interpolator(startScale, endScale, duration, easingFn);
        this.originalSize = null;
    }
    
    apply(attackObj) {
        if (this.originalSize === null && attackObj.size) {
            this.originalSize = attackObj.size;
        }
        
        const scale = this.scaleInterpolator.getValue();
        
        if (attackObj.size !== undefined) {
            attackObj.size = this.originalSize * scale;
        }
        if (attackObj.width !== undefined && attackObj.height !== undefined) {
            if (!attackObj.originalWidth) {
                attackObj.originalWidth = attackObj.width;
                attackObj.originalHeight = attackObj.height;
            }
            attackObj.width = attackObj.originalWidth * scale;
            attackObj.height = attackObj.originalHeight * scale;
        }
    }
    
    update() {
        this.scaleInterpolator.update();
        if (this.scaleInterpolator.isComplete) {
            this.active = false;
        }
    }
}

/**
 * Rotation modifier - rotates attack
 */
export class RotationModifier extends AttackModifier {
    constructor(rotationSpeed) {
        super();
        this.rotationSpeed = rotationSpeed;
        this.currentRotation = 0;
    }
    
    apply(attackObj) {
        attackObj.rotation = this.currentRotation;
    }
    
    update() {
        this.currentRotation += this.rotationSpeed;
        if (this.currentRotation > Math.PI * 2) {
            this.currentRotation -= Math.PI * 2;
        }
    }
}

/**
 * Color fade modifier - changes color over time
 */
export class ColorFadeModifier extends AttackModifier {
    constructor(startColor, endColor, duration, easingFn = Easing.linear) {
        super();
        this.startColor = this.parseColor(startColor);
        this.endColor = this.parseColor(endColor);
        this.duration = duration;
        this.elapsed = 0;
        this.easingFn = easingFn;
    }
    
    parseColor(color) {
        // Parse hex color #RRGGBB
        const hex = color.replace('#', '');
        return {
            r: parseInt(hex.substr(0, 2), 16),
            g: parseInt(hex.substr(2, 2), 16),
            b: parseInt(hex.substr(4, 2), 16)
        };
    }
    
    apply(attackObj) {
        const t = Math.min(this.elapsed / this.duration, 1);
        const easedT = this.easingFn(t);
        
        const r = Math.round(this.startColor.r + (this.endColor.r - this.startColor.r) * easedT);
        const g = Math.round(this.startColor.g + (this.endColor.g - this.startColor.g) * easedT);
        const b = Math.round(this.startColor.b + (this.endColor.b - this.startColor.b) * easedT);
        
        attackObj.color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    update() {
        this.elapsed++;
        if (this.elapsed >= this.duration) {
            this.active = false;
        }
    }
}

/**
 * Speed modifier - changes velocity over time
 */
export class SpeedModifier extends AttackModifier {
    constructor(speedMultiplier, duration = null, easingFn = Easing.linear) {
        super();
        this.speedMultiplier = speedMultiplier;
        this.duration = duration;
        this.elapsed = 0;
        this.easingFn = easingFn;
        this.originalVx = null;
        this.originalVy = null;
    }
    
    apply(attackObj) {
        if (this.originalVx === null && attackObj.vx !== undefined) {
            this.originalVx = attackObj.vx;
            this.originalVy = attackObj.vy || 0;
        }
        
        let multiplier = this.speedMultiplier;
        
        if (this.duration !== null) {
            const t = Math.min(this.elapsed / this.duration, 1);
            multiplier = 1 + (this.speedMultiplier - 1) * this.easingFn(t);
        }
        
        if (attackObj.vx !== undefined) {
            attackObj.vx = this.originalVx * multiplier;
        }
        if (attackObj.vy !== undefined) {
            attackObj.vy = this.originalVy * multiplier;
        }
    }
    
    update() {
        if (this.duration !== null) {
            this.elapsed++;
            if (this.elapsed >= this.duration) {
                this.active = false;
            }
        }
    }
}

/**
 * Alpha/Opacity modifier - fades in/out
 */
export class AlphaModifier extends AttackModifier {
    constructor(startAlpha, endAlpha, duration, easingFn = Easing.linear) {
        super();
        this.alphaInterpolator = new Interpolator(startAlpha, endAlpha, duration, easingFn);
    }
    
    apply(attackObj) {
        attackObj.alpha = this.alphaInterpolator.getValue();
    }
    
    update() {
        this.alphaInterpolator.update();
        if (this.alphaInterpolator.isComplete) {
            this.active = false;
        }
    }
}

/**
 * Mirror modifier - flips attack horizontally or vertically
 */
export class MirrorModifier extends AttackModifier {
    constructor(horizontal = true, vertical = false) {
        super();
        this.horizontal = horizontal;
        this.vertical = vertical;
        this.applied = false;
    }
    
    apply(attackObj) {
        if (!this.applied) {
            if (this.horizontal && attackObj.vx !== undefined) {
                attackObj.vx = -attackObj.vx;
            }
            if (this.vertical && attackObj.vy !== undefined) {
                attackObj.vy = -attackObj.vy;
            }
            this.applied = true;
            this.active = false;
        }
    }
    
    update() {
        // One-time modifier
    }
}

/**
 * Damage modifier - changes damage over time
 */
export class DamageModifier extends AttackModifier {
    constructor(damageMultiplier, duration = null) {
        super();
        this.damageMultiplier = damageMultiplier;
        this.duration = duration;
        this.elapsed = 0;
        this.originalDamage = null;
    }
    
    apply(attackObj) {
        if (this.originalDamage === null && attackObj.damage !== undefined) {
            this.originalDamage = attackObj.damage;
        }
        
        if (attackObj.damage !== undefined) {
            attackObj.damage = this.originalDamage * this.damageMultiplier;
        }
    }
    
    update() {
        if (this.duration !== null) {
            this.elapsed++;
            if (this.elapsed >= this.duration) {
                this.active = false;
            }
        }
    }
}

/**
 * Modifier manager - applies multiple modifiers to an attack
 */
export class ModifierManager {
    constructor() {
        this.modifiers = [];
    }
    
    /**
     * Add a modifier
     * @param {AttackModifier} modifier - Modifier to add
     */
    addModifier(modifier) {
        this.modifiers.push(modifier);
    }
    
    /**
     * Apply all active modifiers to an attack
     * @param {Object} attackObj - Attack object
     */
    applyModifiers(attackObj) {
        for (const modifier of this.modifiers) {
            if (modifier.active) {
                modifier.apply(attackObj);
            }
        }
    }
    
    /**
     * Update all modifiers
     */
    update() {
        for (const modifier of this.modifiers) {
            if (modifier.active) {
                modifier.update();
            }
        }
        
        // Remove completed modifiers
        this.modifiers = this.modifiers.filter(m => !m.isComplete());
    }
    
    /**
     * Check if any modifiers are active
     * @returns {boolean} True if any active
     */
    hasActiveModifiers() {
        return this.modifiers.some(m => m.active);
    }
    
    /**
     * Clear all modifiers
     */
    clear() {
        this.modifiers = [];
    }
}
