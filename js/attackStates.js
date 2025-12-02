/**
 * attackStates.js
 * State machine for attack lifecycle management
 */

/**
 * Attack states
 */
export const AttackState = {
    WARMING_UP: 'warming_up',    // Telegraphing/preparing
    ACTIVE: 'active',            // Damaging phase
    COOLING_DOWN: 'cooling_down', // Ending/fading
    COMPLETE: 'complete'          // Ready for cleanup
};

/**
 * Attack state machine
 */
export class AttackStateMachine {
    constructor(config = {}) {
        this.state = AttackState.WARMING_UP;
        this.elapsed = 0;
        
        // State durations
        this.warmupDuration = config.warmupDuration || 0;
        this.activeDuration = config.activeDuration || 60;
        this.cooldownDuration = config.cooldownDuration || 0;
        
        // Callbacks
        this.onWarmupStart = config.onWarmupStart || null;
        this.onActiveStart = config.onActiveStart || null;
        this.onCooldownStart = config.onCooldownStart || null;
        this.onComplete = config.onComplete || null;
        
        // State-specific properties
        this.canDamage = false;
        this.alpha = 1.0;
        
        // Execute warmup start callback
        if (this.onWarmupStart) {
            this.onWarmupStart();
        }
    }
    
    /**
     * Update state machine
     */
    update() {
        this.elapsed++;
        
        switch (this.state) {
            case AttackState.WARMING_UP:
                this.updateWarmup();
                break;
            case AttackState.ACTIVE:
                this.updateActive();
                break;
            case AttackState.COOLING_DOWN:
                this.updateCooldown();
                break;
            case AttackState.COMPLETE:
                // Do nothing, ready for cleanup
                break;
        }
    }
    
    /**
     * Update warmup state
     */
    updateWarmup() {
        if (this.warmupDuration === 0 || this.elapsed >= this.warmupDuration) {
            this.transitionTo(AttackState.ACTIVE);
        } else {
            // Fade in during warmup
            this.alpha = this.elapsed / this.warmupDuration;
            this.canDamage = false;
        }
    }
    
    /**
     * Update active state
     */
    updateActive() {
        const activeElapsed = this.elapsed - this.warmupDuration;
        
        if (activeElapsed >= this.activeDuration) {
            this.transitionTo(AttackState.COOLING_DOWN);
        } else {
            this.canDamage = true;
            this.alpha = 1.0;
        }
    }
    
    /**
     * Update cooldown state
     */
    updateCooldown() {
        const cooldownElapsed = this.elapsed - this.warmupDuration - this.activeDuration;
        
        if (this.cooldownDuration === 0 || cooldownElapsed >= this.cooldownDuration) {
            this.transitionTo(AttackState.COMPLETE);
        } else {
            // Fade out during cooldown
            this.alpha = 1.0 - (cooldownElapsed / this.cooldownDuration);
            this.canDamage = false;
        }
    }
    
    /**
     * Transition to a new state
     * @param {string} newState - State to transition to
     */
    transitionTo(newState) {
        this.state = newState;
        
        // Execute callbacks
        switch (newState) {
            case AttackState.ACTIVE:
                if (this.onActiveStart) this.onActiveStart();
                break;
            case AttackState.COOLING_DOWN:
                if (this.onCooldownStart) this.onCooldownStart();
                break;
            case AttackState.COMPLETE:
                if (this.onComplete) this.onComplete();
                break;
        }
    }
    
    /**
     * Check if attack can deal damage
     * @returns {boolean} True if can damage
     */
    canDealDamage() {
        return this.canDamage;
    }
    
    /**
     * Get current alpha value for rendering
     * @returns {number} Alpha value (0-1)
     */
    getAlpha() {
        return this.alpha;
    }
    
    /**
     * Check if state machine is complete
     * @returns {boolean} True if complete
     */
    isComplete() {
        return this.state === AttackState.COMPLETE;
    }
    
    /**
     * Get current state
     * @returns {string} Current state
     */
    getState() {
        return this.state;
    }
    
    /**
     * Force skip to active state
     */
    skipToActive() {
        this.elapsed = this.warmupDuration;
        this.transitionTo(AttackState.ACTIVE);
    }
    
    /**
     * Force completion
     */
    forceComplete() {
        this.transitionTo(AttackState.COMPLETE);
    }
}

/**
 * Sequence state machine for chaining multiple attack phases
 */
export class SequenceStateMachine {
    constructor(phases = []) {
        this.phases = phases;
        this.currentPhaseIndex = 0;
        this.phaseElapsed = 0;
    }
    
    /**
     * Add a phase to the sequence
     * @param {Object} phase - Phase configuration {duration, onStart, onUpdate, onEnd}
     */
    addPhase(phase) {
        this.phases.push(phase);
    }
    
    /**
     * Update sequence
     */
    update() {
        if (this.isComplete()) return;
        
        const currentPhase = this.phases[this.currentPhaseIndex];
        
        // Execute onStart on first frame of phase
        if (this.phaseElapsed === 0 && currentPhase.onStart) {
            currentPhase.onStart();
        }
        
        // Execute onUpdate every frame
        if (currentPhase.onUpdate) {
            currentPhase.onUpdate(this.phaseElapsed);
        }
        
        this.phaseElapsed++;
        
        // Check if phase is complete
        if (this.phaseElapsed >= currentPhase.duration) {
            // Execute onEnd
            if (currentPhase.onEnd) {
                currentPhase.onEnd();
            }
            
            // Move to next phase
            this.currentPhaseIndex++;
            this.phaseElapsed = 0;
        }
    }
    
    /**
     * Check if sequence is complete
     * @returns {boolean} True if all phases complete
     */
    isComplete() {
        return this.currentPhaseIndex >= this.phases.length;
    }
    
    /**
     * Get current phase index
     * @returns {number} Current phase index
     */
    getCurrentPhaseIndex() {
        return this.currentPhaseIndex;
    }
    
    /**
     * Get current phase
     * @returns {Object|null} Current phase or null if complete
     */
    getCurrentPhase() {
        if (this.isComplete()) return null;
        return this.phases[this.currentPhaseIndex];
    }
    
    /**
     * Skip to specific phase
     * @param {number} phaseIndex - Phase index to skip to
     */
    skipToPhase(phaseIndex) {
        if (phaseIndex >= 0 && phaseIndex < this.phases.length) {
            this.currentPhaseIndex = phaseIndex;
            this.phaseElapsed = 0;
        }
    }
    
    /**
     * Reset sequence
     */
    reset() {
        this.currentPhaseIndex = 0;
        this.phaseElapsed = 0;
    }
}
