/**
 * attackTiming.js
 * Advanced timing and sequencing system for attack patterns
 */

/**
 * Delayed action executor
 */
export class DelayedAction {
    constructor(delay, action) {
        this.delay = delay;
        this.action = action;
        this.elapsed = 0;
        this.executed = false;
    }
    
    update() {
        if (this.executed) return true;
        
        this.elapsed++;
        if (this.elapsed >= this.delay) {
            this.action();
            this.executed = true;
            return true;
        }
        return false;
    }
    
    isComplete() {
        return this.executed;
    }
}

/**
 * Sequence of delayed actions
 */
export class ActionSequence {
    constructor() {
        this.actions = [];
        this.currentIndex = 0;
    }
    
    addAction(delay, action) {
        this.actions.push(new DelayedAction(delay, action));
        return this;
    }
    
    update() {
        if (this.isComplete()) return;
        
        const currentAction = this.actions[this.currentIndex];
        if (currentAction.update()) {
            this.currentIndex++;
        }
    }
    
    isComplete() {
        return this.currentIndex >= this.actions.length;
    }
    
    reset() {
        this.currentIndex = 0;
        this.actions.forEach(action => {
            action.elapsed = 0;
            action.executed = false;
        });
    }
}

/**
 * Parallel action executor (all actions run simultaneously)
 */
export class ParallelActions {
    constructor() {
        this.actions = [];
    }
    
    addAction(delay, action) {
        this.actions.push(new DelayedAction(delay, action));
        return this;
    }
    
    update() {
        this.actions.forEach(action => action.update());
    }
    
    isComplete() {
        return this.actions.every(action => action.isComplete());
    }
    
    reset() {
        this.actions.forEach(action => {
            action.elapsed = 0;
            action.executed = false;
        });
    }
}

/**
 * Looping action executor
 */
export class LoopedAction {
    constructor(interval, action, loopCount = -1) {
        this.interval = interval;
        this.action = action;
        this.loopCount = loopCount; // -1 = infinite
        this.elapsed = 0;
        this.executionCount = 0;
    }
    
    update() {
        if (this.isComplete()) return;
        
        this.elapsed++;
        if (this.elapsed >= this.interval) {
            this.action(this.executionCount);
            this.executionCount++;
            this.elapsed = 0;
        }
    }
    
    isComplete() {
        if (this.loopCount === -1) return false;
        return this.executionCount >= this.loopCount;
    }
    
    reset() {
        this.elapsed = 0;
        this.executionCount = 0;
    }
}

/**
 * Wave spawner with configurable timing
 */
export class WaveSpawner {
    constructor(config = {}) {
        this.waves = config.waves || [];
        this.currentWaveIndex = 0;
        this.elapsed = 0;
        this.waveDelay = config.waveDelay || 60; // Frames between waves
        this.loop = config.loop || false;
        this.loopCount = config.loopCount || 1;
        this.currentLoop = 0;
    }
    
    addWave(wave) {
        this.waves.push(wave);
        return this;
    }
    
    update(spawnCallback) {
        if (this.isComplete()) return;
        
        this.elapsed++;
        
        const currentWave = this.waves[this.currentWaveIndex];
        if (!currentWave) return;
        
        // Check if it's time to spawn this wave
        const waveStartTime = this.currentWaveIndex * this.waveDelay;
        if (this.elapsed === waveStartTime + 1) {
            spawnCallback(currentWave, this.currentWaveIndex);
            this.currentWaveIndex++;
            
            // Check if all waves spawned
            if (this.currentWaveIndex >= this.waves.length) {
                if (this.loop && this.currentLoop < this.loopCount - 1) {
                    this.currentLoop++;
                    this.currentWaveIndex = 0;
                    this.elapsed = 0;
                }
            }
        }
    }
    
    isComplete() {
        return this.currentWaveIndex >= this.waves.length && 
               (!this.loop || this.currentLoop >= this.loopCount - 1);
    }
    
    reset() {
        this.currentWaveIndex = 0;
        this.elapsed = 0;
        this.currentLoop = 0;
    }
}

/**
 * Frame-perfect timeline for complex patterns
 */
export class Timeline {
    constructor() {
        this.events = [];
        this.frame = 0;
    }
    
    /**
     * Add event at specific frame
     * @param {number} frame - Frame number to execute
     * @param {Function} action - Action to execute
     */
    addEvent(frame, action) {
        this.events.push({ frame, action, executed: false });
        // Sort events by frame
        this.events.sort((a, b) => a.frame - b.frame);
        return this;
    }
    
    /**
     * Add multiple events at once
     * @param {Array} events - Array of {frame, action} objects
     */
    addEvents(events) {
        events.forEach(event => this.addEvent(event.frame, event.action));
        return this;
    }
    
    update() {
        this.frame++;
        
        // Execute all events for current frame
        this.events.forEach(event => {
            if (!event.executed && event.frame === this.frame) {
                event.action();
                event.executed = true;
            }
        });
    }
    
    isComplete() {
        return this.events.every(event => event.executed);
    }
    
    reset() {
        this.frame = 0;
        this.events.forEach(event => event.executed = false);
    }
    
    getCurrentFrame() {
        return this.frame;
    }
    
    skipToFrame(frame) {
        this.frame = frame;
    }
}

/**
 * Rhythm-based timing system
 */
export class RhythmTimer {
    constructor(bpm = 120, beatsPerMeasure = 4) {
        this.bpm = bpm;
        this.beatsPerMeasure = beatsPerMeasure;
        this.framesPerBeat = (60 * 60) / bpm; // 60 fps * 60 seconds / bpm
        this.frame = 0;
        this.onBeatCallbacks = [];
        this.onMeasureCallbacks = [];
    }
    
    update() {
        this.frame++;
        
        // Check for beat
        if (this.frame % this.framesPerBeat < 1) {
            const beat = Math.floor(this.frame / this.framesPerBeat) % this.beatsPerMeasure;
            this.onBeatCallbacks.forEach(cb => cb(beat));
            
            // Check for measure
            if (beat === 0) {
                const measure = Math.floor(this.frame / (this.framesPerBeat * this.beatsPerMeasure));
                this.onMeasureCallbacks.forEach(cb => cb(measure));
            }
        }
    }
    
    onBeat(callback) {
        this.onBeatCallbacks.push(callback);
        return this;
    }
    
    onMeasure(callback) {
        this.onMeasureCallbacks.push(callback);
        return this;
    }
    
    reset() {
        this.frame = 0;
    }
    
    setBPM(bpm) {
        this.bpm = bpm;
        this.framesPerBeat = (60 * 60) / bpm;
    }
}

/**
 * Conditional trigger system
 */
export class TriggerSystem {
    constructor() {
        this.triggers = [];
    }
    
    /**
     * Add a trigger that fires when condition is met
     * @param {Function} condition - Function that returns true when trigger should fire
     * @param {Function} action - Action to execute when triggered
     * @param {boolean} once - If true, trigger only fires once
     */
    addTrigger(condition, action, once = true) {
        this.triggers.push({
            condition,
            action,
            once,
            fired: false
        });
        return this;
    }
    
    update(context) {
        this.triggers.forEach(trigger => {
            if (!trigger.fired || !trigger.once) {
                if (trigger.condition(context)) {
                    trigger.action(context);
                    trigger.fired = true;
                }
            }
        });
    }
    
    reset() {
        this.triggers.forEach(trigger => trigger.fired = false);
    }
}
