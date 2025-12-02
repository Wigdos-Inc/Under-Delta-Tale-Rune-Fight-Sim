/**
 * advancedAttackExamples.js
 * Examples demonstrating the advanced attack system capabilities
 */

import { Projectile, Bone, BlueBone, OrangeBone } from './attacks.js';
import { ScaleModifier, RotationModifier, SpeedModifier, AlphaModifier } from './attackModifiers.js';
import { AttackChoreography, WaveFormation, PatternComposer } from './attackComposition.js';
import { Timeline, RhythmTimer } from './attackTiming.js';
import { Easing } from './easing.js';

/**
 * Example 1: Spinning projectile with fade-in
 */
export function createSpinningProjectile(x, y) {
    const projectile = new Projectile(x, y, 2, 0, 20, '#ff00ff', {
        stateMachine: {
            warmupDuration: 30, // 0.5 second fade-in
            activeDuration: 180, // 3 seconds active
            cooldownDuration: 30 // 0.5 second fade-out
        }
    });
    
    // Add spinning rotation
    projectile.addModifier(new RotationModifier(0.1));
    
    // Add pulsing scale
    projectile.addModifier(new ScaleModifier(0.8, 1.2, 60, Easing.sine.inOut));
    
    return projectile;
}

/**
 * Example 2: Accelerating bone
 */
export function createAcceleratingBone(x, y, horizontal = true) {
    const bone = horizontal 
        ? new Bone(x, y, 80, 20, 1, 0)
        : new Bone(x, y, 20, 80, 0, 1);
    
    // Add speed modifier that increases speed over time
    bone.addModifier(new SpeedModifier(1.0, 5.0, 120, Easing.quad.in));
    
    return bone;
}

/**
 * Example 3: Circular wave formation (Sans-style ring)
 */
export function createCircularWave(centerX, centerY, radius, count) {
    return WaveFormation.circular(
        (x, y, angle) => {
            // Create projectile pointing outward
            const speed = 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            return new Projectile(x, y, vx, vy, 15, '#ffffff');
        },
        centerX,
        centerY,
        radius,
        count,
        0
    );
}

/**
 * Example 4: Rotating circular wave (continuously spawning)
 */
export function createRotatingWave(centerX, centerY, duration) {
    const choreography = new AttackChoreography();
    const radius = 50;
    const projectileCount = 12;
    
    // Spawn circular waves every 20 frames with increasing rotation
    for (let frame = 0; frame < duration; frame += 20) {
        const rotation = (frame / 20) * (Math.PI / 6); // Rotate each wave
        
        choreography.addSpawn(frame, () => {
            return WaveFormation.circular(
                (x, y, angle) => {
                    const speed = 3;
                    const vx = Math.cos(angle) * speed;
                    const vy = Math.sin(angle) * speed;
                    return new Projectile(x, y, vx, vy, 12, '#00ffff');
                },
                centerX,
                centerY,
                radius,
                projectileCount,
                rotation
            );
        });
    }
    
    return choreography;
}

/**
 * Example 5: Spiral pattern (Asriel Chaos Saber style)
 */
export function createSpiralPattern(centerX, centerY) {
    return WaveFormation.spiral(
        (x, y, angle) => {
            // Projectiles move outward along spiral
            const speed = 1.5;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            const projectile = new Projectile(x, y, vx, vy, 18, '#ff00ff');
            projectile.addModifier(new RotationModifier(0.15));
            return projectile;
        },
        centerX,
        centerY,
        10,  // Start radius
        150, // End radius
        40,  // 40 projectiles
        3    // 3 full rotations
    );
}

/**
 * Example 6: Grid of blue bones (must stand still)
 */
export function createBlueGrid(boxX, boxY, boxWidth, boxHeight) {
    return WaveFormation.grid(
        (x, y) => {
            return new BlueBone(x, y, 15, 60, 0, 2, {
                stateMachine: {
                    warmupDuration: 20,
                    activeDuration: 120,
                    cooldownDuration: 10
                }
            });
        },
        boxX + 20,
        boxY - 80,
        5, // 5 columns
        1, // 1 row
        (boxWidth - 40) / 4, // Spacing
        0
    );
}

/**
 * Example 7: Alternating blue/orange pattern
 */
export function createAlternatingPattern(boxX, boxY, boxWidth) {
    const choreography = new AttackChoreography();
    
    for (let i = 0; i < 8; i++) {
        const frame = i * 40; // Spawn every 40 frames
        const isBlue = i % 2 === 0;
        
        choreography.addSpawn(frame, () => {
            const x = boxX;
            const y = boxY + (i * 20);
            
            if (isBlue) {
                return new BlueBone(x, y, 100, 18, 3, 0, {
                    stateMachine: {
                        warmupDuration: 15,
                        activeDuration: 90
                    }
                });
            } else {
                return new OrangeBone(x, y, 100, 18, 3, 0, {
                    stateMachine: {
                        warmupDuration: 15,
                        activeDuration: 90
                    }
                });
            }
        });
    }
    
    return choreography;
}

/**
 * Example 8: Frame-perfect timeline (Sans-style precise timing)
 */
export function createFramePerfectPattern() {
    const timeline = new Timeline();
    const centerX = 320;
    const centerY = 320;
    
    // Frame 0: First ring
    timeline.addEvent(0, () => {
        console.log('Spawn ring 1');
        return createCircularWave(centerX, centerY, 40, 8);
    });
    
    // Frame 30: Second ring
    timeline.addEvent(30, () => {
        console.log('Spawn ring 2');
        return createCircularWave(centerX, centerY, 60, 12);
    });
    
    // Frame 60: Third ring
    timeline.addEvent(60, () => {
        console.log('Spawn ring 3');
        return createCircularWave(centerX, centerY, 80, 16);
    });
    
    // Frame 90: Bones from sides
    timeline.addEvent(90, () => {
        console.log('Spawn bones');
        return [
            new Bone(0, centerY - 10, 120, 20, 4, 0),
            new Bone(640, centerY + 10, 120, 20, -4, 0)
        ];
    });
    
    return timeline;
}

/**
 * Example 9: Rhythm-based attacks (synced to music)
 */
export function createRhythmPattern(bpm = 120) {
    const timer = new RhythmTimer(bpm, 4);
    const choreography = new AttackChoreography();
    
    // Spawn projectile on every beat
    timer.onBeat((beat) => {
        const angle = (beat / 4) * Math.PI * 2;
        const x = 320 + Math.cos(angle) * 100;
        const y = 320 + Math.sin(angle) * 100;
        
        choreography.addSpawn(timer.frame, () => {
            return new Projectile(x, y, 0, 0, 20, '#ffff00', {
                stateMachine: {
                    activeDuration: 60
                }
            });
        });
    });
    
    // Spawn bone wall on every measure
    timer.onMeasure((measure) => {
        choreography.addSpawn(timer.frame, () => {
            return new Bone(50, 100 + (measure * 30), 150, 15, 3, 0);
        });
    });
    
    return { timer, choreography };
}

/**
 * Example 10: Complex multi-phase pattern (Boss attack)
 */
export function createBossPattern() {
    const composer = new PatternComposer();
    
    // Phase 1: Warming up - slow projectiles (3 seconds)
    composer.addPattern(
        {
            name: 'Warmup',
            spawner: () => createCircularWave(320, 320, 60, 8)
        },
        180, // 3 seconds
        30   // 0.5 second transition
    );
    
    // Phase 2: Intense - fast spiral (4 seconds)
    composer.addPattern(
        {
            name: 'Spiral',
            spawner: () => createSpiralPattern(320, 320)
        },
        240, // 4 seconds
        30
    );
    
    // Phase 3: Climax - everything at once (5 seconds)
    composer.addPattern(
        {
            name: 'Climax',
            spawner: () => {
                const attacks = [];
                attacks.push(...createCircularWave(320, 320, 40, 12));
                attacks.push(...createCircularWave(320, 320, 80, 16));
                attacks.push(...createSpiralPattern(320, 320));
                return attacks;
            }
        },
        300, // 5 seconds
        0
    );
    
    return composer;
}

/**
 * Example 11: Custom attack with callback
 */
export function createCustomAttack(x, y) {
    const projectile = new Projectile(x, y, 0, 0, 25, '#ff0000', {
        // Custom update behavior
        onUpdate: (self) => {
            // Sine wave movement
            self.x += 2;
            self.y += Math.sin(self.frameCount * 0.1) * 3;
        },
        
        // Custom draw
        onDraw: (self, ctx) => {
            // Draw star instead of square
            ctx.fillStyle = self.color;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
                const r = i % 2 === 0 ? 12 : 6;
                const px = Math.cos(angle) * r;
                const py = Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
        },
        
        // Custom destroy
        onDestroy: (self) => {
            console.log('Attack destroyed at', self.x, self.y);
        }
    });
    
    return projectile;
}
