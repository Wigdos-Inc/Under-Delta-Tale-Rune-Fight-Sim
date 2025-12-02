/**
 * easing.js
 * Easing functions for smooth animations and attack movements
 * Based on Robert Penner's easing equations
 */

/**
 * Easing functions
 * All functions take a value t between 0 and 1 and return the eased value
 */
export const Easing = {
    // No easing
    linear: (t) => t,
    
    // Quadratic easing
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    
    // Cubic easing
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => (--t) * t * t + 1,
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    
    // Quartic easing
    easeInQuart: (t) => t * t * t * t,
    easeOutQuart: (t) => 1 - (--t) * t * t * t,
    easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
    
    // Quintic easing
    easeInQuint: (t) => t * t * t * t * t,
    easeOutQuint: (t) => 1 + (--t) * t * t * t * t,
    easeInOutQuint: (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
    
    // Sine easing
    easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
    easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
    easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    
    // Exponential easing
    easeInExpo: (t) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
    easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    easeInOutExpo: (t) => {
        if (t === 0 || t === 1) return t;
        if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
        return (2 - Math.pow(2, -20 * t + 10)) / 2;
    },
    
    // Circular easing
    easeInCirc: (t) => 1 - Math.sqrt(1 - t * t),
    easeOutCirc: (t) => Math.sqrt(1 - (--t) * t),
    easeInOutCirc: (t) => {
        t *= 2;
        if (t < 1) return -(Math.sqrt(1 - t * t) - 1) / 2;
        t -= 2;
        return (Math.sqrt(1 - t * t) + 1) / 2;
    },
    
    // Elastic easing
    easeInElastic: (t) => {
        if (t === 0 || t === 1) return t;
        const c4 = (2 * Math.PI) / 3;
        return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    },
    easeOutElastic: (t) => {
        if (t === 0 || t === 1) return t;
        const c4 = (2 * Math.PI) / 3;
        return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    easeInOutElastic: (t) => {
        if (t === 0 || t === 1) return t;
        const c5 = (2 * Math.PI) / 4.5;
        if (t < 0.5) {
            return -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2;
        }
        return (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
    },
    
    // Back easing (overshoots)
    easeInBack: (t) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return c3 * t * t * t - c1 * t * t;
    },
    easeOutBack: (t) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
    easeInOutBack: (t) => {
        const c1 = 1.70158;
        const c2 = c1 * 1.525;
        if (t < 0.5) {
            return (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2;
        }
        return (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
    },
    
    // Bounce easing
    easeInBounce: (t) => 1 - Easing.easeOutBounce(1 - t),
    easeOutBounce: (t) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    },
    easeInOutBounce: (t) => {
        if (t < 0.5) {
            return Easing.easeInBounce(t * 2) * 0.5;
        }
        return Easing.easeOutBounce(t * 2 - 1) * 0.5 + 0.5;
    }
};

/**
 * Interpolation helper class
 */
export class Interpolator {
    constructor(startValue, endValue, duration, easingFn = Easing.linear) {
        this.startValue = startValue;
        this.endValue = endValue;
        this.duration = duration;
        this.easingFn = easingFn;
        this.elapsed = 0;
        this.isComplete = false;
    }
    
    /**
     * Update interpolator
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime = 1) {
        this.elapsed += deltaTime;
        if (this.elapsed >= this.duration) {
            this.elapsed = this.duration;
            this.isComplete = true;
        }
    }
    
    /**
     * Get current value
     * @returns {number} Interpolated value
     */
    getValue() {
        const t = Math.min(this.elapsed / this.duration, 1);
        const easedT = this.easingFn(t);
        return this.startValue + (this.endValue - this.startValue) * easedT;
    }
    
    /**
     * Reset interpolator
     */
    reset() {
        this.elapsed = 0;
        this.isComplete = false;
    }
    
    /**
     * Set new target
     */
    setTarget(newTarget, newDuration = null) {
        this.startValue = this.getValue();
        this.endValue = newTarget;
        if (newDuration !== null) {
            this.duration = newDuration;
        }
        this.reset();
    }
}

/**
 * Multi-value interpolator for objects
 */
export class MultiInterpolator {
    constructor(startValues, endValues, duration, easingFn = Easing.linear) {
        this.interpolators = {};
        for (const key in startValues) {
            this.interpolators[key] = new Interpolator(
                startValues[key],
                endValues[key],
                duration,
                easingFn
            );
        }
    }
    
    /**
     * Update all interpolators
     */
    update(deltaTime = 1) {
        for (const key in this.interpolators) {
            this.interpolators[key].update(deltaTime);
        }
    }
    
    /**
     * Get all current values
     * @returns {Object} Object with interpolated values
     */
    getValues() {
        const values = {};
        for (const key in this.interpolators) {
            values[key] = this.interpolators[key].getValue();
        }
        return values;
    }
    
    /**
     * Check if all interpolations are complete
     * @returns {boolean} True if all complete
     */
    isComplete() {
        for (const key in this.interpolators) {
            if (!this.interpolators[key].isComplete) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Reset all interpolators
     */
    reset() {
        for (const key in this.interpolators) {
            this.interpolators[key].reset();
        }
    }
}
