# Advanced Attack System - Feature Documentation

## Overview
TODO #2: MAJOR: Advanced Attack System Architecture
**Status**: ✅ COMPLETED

The advanced attack system provides a comprehensive, modular architecture for creating complex attack patterns like those seen in Undertale/Deltarune boss fights (Sans, Asriel, Photoshop Flowey, etc.).

## Architecture Components

### 1. Enhanced Attack Base Class (`attacks.js`)

All attack objects now inherit from an enhanced `AttackObject` base class that provides:

#### Core Features
- **State Management**: Integrated state machine for attack lifecycle
- **Modifier System**: Dynamic property modification during runtime
- **Interpolation**: Smooth property transitions using easing functions
- **Custom Callbacks**: Hooks for custom update/draw/destroy logic
- **Hitbox Offsets**: Separate visual rendering from collision detection
- **Frame Counting**: Built-in frame counter for time-based logic

#### Properties
```javascript
{
    x, y: position,
    active: boolean,
    damage: number,
    type: string,
    stateMachine: AttackStateMachine,
    modifierManager: ModifierManager,
    interpolators: Array,
    scale: number,
    rotation: number,
    baseAlpha: number,
    hitboxOffsetX, hitboxOffsetY: number,
    frameCount: number
}
```

#### Usage Example
```javascript
const projectile = new Projectile(x, y, vx, vy, size, color, {
    damage: 2,
    stateMachine: {
        warmupDuration: 30,    // Fade-in
        activeDuration: 180,    // Active phase
        cooldownDuration: 30    // Fade-out
    },
    modifiers: [
        new RotationModifier(0.1),
        new ScaleModifier(0.8, 1.2, 60, Easing.sine.inOut)
    ],
    hitboxOffsetX: 5,
    hitboxOffsetY: 5,
    onUpdate: (self) => { /* custom logic */ },
    onDraw: (self, ctx) => { /* custom rendering */ },
    onDestroy: (self) => { /* cleanup */ }
});
```

---

### 2. Attack State Machine (`attackStates.js`)

Manages attack lifecycle with state transitions and automatic fade in/out.

#### States
- **WARMING_UP**: Telegraphing phase (fade-in, no damage)
- **ACTIVE**: Main attack phase (full damage)
- **COOLING_DOWN**: Ending phase (fade-out, no damage)
- **COMPLETE**: Ready for cleanup

#### Features
- Automatic alpha transitions during warmup/cooldown
- State transition callbacks
- Damage gating (attacks only damage in ACTIVE state)
- Manual state control (skip to active, force complete)

#### Usage Example
```javascript
const stateMachine = new AttackStateMachine({
    warmupDuration: 30,
    activeDuration: 120,
    cooldownDuration: 20,
    onWarmupStart: () => console.log('Telegraphing'),
    onActiveStart: () => console.log('Attack active!'),
    onCooldownStart: () => console.log('Fading out'),
    onComplete: () => console.log('Complete')
});

// In update loop
stateMachine.update();
if (stateMachine.canDealDamage()) {
    // Check collision
}
```

#### Sequence State Machine
For multi-phase attacks with distinct phases:
```javascript
const sequence = new SequenceStateMachine();
sequence.addPhase({
    duration: 60,
    onStart: () => spawnWave1(),
    onUpdate: (elapsed) => updatePhase(elapsed),
    onEnd: () => cleanupPhase()
});
sequence.addPhase({ /* phase 2 */ });
```

---

### 3. Attack Modifiers (`attackModifiers.js`)

Dynamic property modification system for attacks.

#### Available Modifiers

**ScaleModifier**: Smooth size transitions
```javascript
new ScaleModifier(startScale, endScale, duration, easingFunc)
// Example: Pulsing effect
new ScaleModifier(0.8, 1.2, 60, Easing.sine.inOut)
```

**RotationModifier**: Continuous or smooth rotation
```javascript
new RotationModifier(speed) // Continuous
new RotationModifier(startAngle, endAngle, duration, easingFunc) // Smooth
```

**ColorFadeModifier**: Smooth color transitions
```javascript
new ColorFadeModifier('#ff0000', '#0000ff', duration, easingFunc)
```

**SpeedModifier**: Velocity changes over time
```javascript
new SpeedModifier(startSpeed, endSpeed, duration, easingFunc)
// Example: Accelerating bone
new SpeedModifier(1.0, 5.0, 120, Easing.quad.in)
```

**AlphaModifier**: Opacity transitions
```javascript
new AlphaModifier(startAlpha, endAlpha, duration, easingFunc)
```

**MirrorModifier**: Flipping attacks
```javascript
new MirrorModifier('horizontal') // or 'vertical' or 'both'
```

**DamageModifier**: Dynamic damage scaling
```javascript
new DamageModifier(multiplier, duration)
```

#### Usage Example
```javascript
const projectile = new Projectile(x, y, 2, 0);
projectile.addModifier(new RotationModifier(0.1));
projectile.addModifier(new ScaleModifier(0.5, 1.5, 90, Easing.elastic.out));
projectile.addModifier(new SpeedModifier(2, 8, 120, Easing.quad.in));
```

---

### 4. Easing Functions (`easing.js`)

20+ easing functions for smooth animations (Robert Penner equations).

#### Available Easing Types
- **linear**: Constant rate
- **quad, cubic, quartic, quintic**: Polynomial curves
- **sine**: Sinusoidal curves
- **expo**: Exponential curves
- **circ**: Circular curves
- **elastic**: Spring-like motion
- **back**: Overshoot/anticipation
- **bounce**: Bouncing effect

Each has `in`, `out`, and `inOut` variants.

#### Usage Example
```javascript
import { Easing, Interpolator } from './easing.js';

// Direct use
const t = 0.5; // Progress 0-1
const value = Easing.elastic.out(t); // Spring-like

// Interpolator for automatic updates
const interp = new Interpolator(0, 100, 120, Easing.quad.inOut);
interp.update();
const currentValue = interp.getValue(); // Smoothly goes 0 -> 100

// Multi-property interpolation
const multi = new MultiInterpolator({ x: 0, y: 0 }, { x: 100, y: 200 }, 60);
multi.update();
const pos = multi.getValue(); // { x: ..., y: ... }
```

---

### 5. Attack Timing System (`attackTiming.js`)

Precise timing control for complex patterns.

#### DelayedAction
Execute action after delay:
```javascript
const action = new DelayedAction(60, () => spawnProjectile());
// In update loop
action.update();
```

#### ActionSequence
Chain actions sequentially:
```javascript
const seq = new ActionSequence();
seq.addAction(30, () => console.log('After 30 frames'));
seq.addAction(60, () => console.log('After 60 more frames'));
seq.update(); // Call every frame
```

#### ParallelActions
Run actions simultaneously:
```javascript
const parallel = new ParallelActions();
parallel.addAction(30, () => spawnProjectile());
parallel.addAction(45, () => playSound());
parallel.addAction(60, () => shake());
```

#### LoopedAction
Repeat action at intervals:
```javascript
// Spawn every 30 frames, 10 times
const loop = new LoopedAction(30, (count) => {
    spawnProjectile(count);
}, 10);
```

#### WaveSpawner
Spawn waves with delays:
```javascript
const spawner = new WaveSpawner({
    waves: [wave1, wave2, wave3],
    waveDelay: 60,
    loop: true,
    loopCount: 3
});

spawner.update((wave, index) => {
    // Spawn wave
});
```

#### Timeline (Frame-Perfect)
Frame-accurate event scheduling (Sans-style):
```javascript
const timeline = new Timeline();
timeline.addEvent(0, () => spawnRing());
timeline.addEvent(30, () => spawnBones());
timeline.addEvent(60, () => spawnProjectiles());
timeline.addEvent(120, () => finishAttack());
// Update every frame for precise timing
```

#### RhythmTimer
Music-synced attacks:
```javascript
const timer = new RhythmTimer(120, 4); // 120 BPM, 4/4 time
timer.onBeat((beat) => {
    console.log('Beat:', beat); // 0, 1, 2, 3
    spawnOnBeat();
});
timer.onMeasure((measure) => {
    console.log('Measure:', measure);
    spawnOnMeasure();
});
timer.update(); // Call every frame
```

---

### 6. Pattern Composition (`attackComposition.js`)

High-level pattern organization and choreography.

#### PatternComposer
Sequential pattern execution with transitions:
```javascript
const composer = new PatternComposer();
composer.addPattern(pattern1, 180, 30); // Pattern, duration, transition delay
composer.addPattern(pattern2, 240, 30);
composer.addPattern(pattern3, 300, 0);

const current = composer.getCurrentPattern();
composer.update();
```

#### AttackChoreography
Frame-perfect multi-spawn coordination:
```javascript
const choreo = new AttackChoreography();

// Single spawn
choreo.addSpawn(30, () => new Projectile(...));

// Repeating spawns
choreo.addRepeatingSpawn(0, 20, 10, () => new Bone(...));

// Synchronized multi-spawn
choreo.addSynchronizedSpawns(60, [
    () => new Projectile(...),
    () => new Bone(...),
    () => new CircleAttack(...)
]);

choreo.update();
const active = choreo.getActiveObjects();
```

#### WaveFormation
Geometric attack formations:

**Circular**:
```javascript
WaveFormation.circular(
    (x, y, angle) => new Projectile(x, y, vx, vy),
    centerX, centerY, radius, count, rotationOffset
);
```

**Spiral** (Chaos Sabers):
```javascript
WaveFormation.spiral(
    createAttack,
    centerX, centerY,
    startRadius, endRadius,
    count, rotations
);
```

**Grid**:
```javascript
WaveFormation.grid(
    createAttack,
    startX, startY,
    cols, rows,
    spacingX, spacingY
);
```

**Line**:
```javascript
WaveFormation.line(
    createAttack,
    startX, startY, endX, endY,
    count
);
```

**Wave** (Sine wave):
```javascript
WaveFormation.wave(
    createAttack,
    startX, startY, endX,
    count, amplitude, frequency
);
```

**Random**:
```javascript
WaveFormation.random(
    createAttack,
    minX, minY, maxX, maxY,
    count
);
```

#### PatternMixer
Layer multiple patterns simultaneously:
```javascript
const mixer = new PatternMixer();
mixer.addLayer(patternA, 1.0); // Weight 1.0
mixer.addLayer(patternB, 0.5); // Weight 0.5 (half frequency)
mixer.update();
const toSpawn = mixer.getPatternsToSpawn();
```

---

## Complete Examples

### Example 1: Sans-Style Bone Wall
```javascript
function createSansBoneWall(boxX, boxY, boxWidth) {
    const choreo = new AttackChoreography();
    
    // Spawn bones from left
    choreo.addRepeatingSpawn(0, 20, 8, () => {
        return new Bone(
            boxX - 80,
            boxY + Math.random() * 100,
            80, 20,
            4, 0,
            '#ffffff',
            {
                stateMachine: {
                    warmupDuration: 10,
                    activeDuration: 150,
                    cooldownDuration: 10
                }
            }
        );
    });
    
    return choreo;
}
```

### Example 2: Asriel Chaos Sabers
```javascript
function createChaosSabers(centerX, centerY) {
    const sabers = WaveFormation.circular(
        (x, y, angle) => {
            const projectile = new Projectile(x, y, 0, 0, 30, '#ff00ff');
            
            // Add continuous rotation around center
            projectile.orbitCenter = { x: centerX, y: centerY };
            projectile.orbitRadius = 100;
            projectile.orbitAngle = angle;
            projectile.orbitSpeed = 0.05;
            
            projectile.addModifier(new RotationModifier(0.2));
            projectile.addModifier(new ScaleModifier(0.8, 1.2, 40, Easing.sine.inOut));
            
            projectile.onUpdateCallback = (self) => {
                self.orbitAngle += self.orbitSpeed;
                self.x = self.orbitCenter.x + Math.cos(self.orbitAngle) * self.orbitRadius;
                self.y = self.orbitCenter.y + Math.sin(self.orbitAngle) * self.orbitRadius;
            };
            
            return projectile;
        },
        centerX, centerY, 100, 12, 0
    );
    
    return sabers;
}
```

### Example 3: Multi-Phase Boss Attack
```javascript
function createBossAttackSequence() {
    const composer = new PatternComposer();
    
    // Phase 1: Warmup (2 seconds)
    composer.addPattern({
        spawner: () => createSlowProjectiles()
    }, 120, 30);
    
    // Phase 2: Intensity rises (3 seconds)
    composer.addPattern({
        spawner: () => createFastBones()
    }, 180, 30);
    
    // Phase 3: Climax (4 seconds)
    composer.addPattern({
        spawner: () => [
            ...createCircularWave(),
            ...createChaosSabers(),
            ...createBoneWall()
        ]
    }, 240, 60);
    
    // Phase 4: Cool down (2 seconds)
    composer.addPattern({
        spawner: () => createSlowFade()
    }, 120, 0);
    
    return composer;
}
```

### Example 4: Blue/Orange Alternating Pattern
```javascript
function createBlueOrangePattern(boxX, boxY) {
    const timeline = new Timeline();
    
    for (let i = 0; i < 10; i++) {
        const frame = i * 40;
        const isBlue = i % 2 === 0;
        
        timeline.addEvent(frame, () => {
            const attacks = [];
            for (let j = 0; j < 3; j++) {
                const y = boxY + j * 30;
                if (isBlue) {
                    attacks.push(new BlueBone(boxX, y, 100, 18, 3, 0, {
                        stateMachine: { warmupDuration: 15, activeDuration: 90 }
                    }));
                } else {
                    attacks.push(new OrangeBone(boxX, y, 100, 18, 3, 0, {
                        stateMachine: { warmupDuration: 15, activeDuration: 90 }
                    }));
                }
            }
            return attacks;
        });
    }
    
    return timeline;
}
```

---

## Benefits of the Advanced System

### 1. **Modularity**
- Attack behaviors are composable
- Modifiers can be mixed and matched
- Reusable formations and patterns

### 2. **Performance**
- State machines manage lifecycle efficiently
- Automatic cleanup of complete attacks
- Object pooling compatible (integration ready)

### 3. **Flexibility**
- Custom callbacks for unique behaviors
- Easing functions for professional animations
- Frame-perfect timing for precise patterns

### 4. **Boss-Ready**
- Supports Sans's frame-perfect attacks
- Handles Asriel's bullet hell patterns
- Enables Photoshop Flowey complexity
- Multi-phase attack sequences

### 5. **Maintainability**
- Separation of concerns (timing, rendering, logic)
- Clear API for creating new attacks
- Comprehensive examples provided

---

## Files Created/Modified

### New Files
1. **js/easing.js** - 250+ lines, 20+ easing functions, Interpolator classes
2. **js/attackModifiers.js** - 300+ lines, 7 modifier types, ModifierManager
3. **js/attackStates.js** - State machine for attack lifecycle
4. **js/attackTiming.js** - Timing, sequencing, rhythm systems
5. **js/attackComposition.js** - Pattern composition, formations, choreography
6. **js/advancedAttackExamples.js** - 11 complete usage examples

### Modified Files
1. **js/attacks.js** - Enhanced base class, updated all attack types

---

## Next Steps

With this advanced architecture in place, implementing the 61 enemies will be significantly easier:

1. **Sans**: Use Timeline for frame-perfect bone sequences
2. **Asriel**: Use WaveFormation.spiral and circular patterns
3. **Photoshop Flowey**: Use PatternComposer for multi-phase attacks
4. **Undyne**: Use state machines for spear telegraphing
5. **Mettaton**: Use RhythmTimer for music-synced attacks
6. **Muffet**: Use WaveFormation for spider/web patterns

The system is now ready to handle any attack complexity the game requires!
