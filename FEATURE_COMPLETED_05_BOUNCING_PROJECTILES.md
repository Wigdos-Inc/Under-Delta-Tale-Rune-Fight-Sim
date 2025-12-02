# Feature Completed: Bouncing Projectiles (TODO #5)

## Overview
Implemented a complete bouncing projectile system that allows projectiles to bounce off battle box walls with realistic physics, visual feedback, and extensive customization options.

## Implementation Details

### Core Class: BouncingProjectile
**Location**: `js/attacks.js`

**Features**:
- **Wall Collision Detection**: Precise collision with all four battle box walls
- **Velocity Reflection**: Realistic bounce physics with proper velocity inversion
- **Bounce Limiting**: Configurable maximum bounces (or infinite)
- **Energy Loss**: Optional dampening that reduces speed with each bounce
- **Minimum Speed**: Auto-deactivation when speed drops too low
- **Visual Spin**: Rotation effect triggered by bounces
- **Bounce Flash**: Brief visual flash on wall impact
- **Bounce Counter**: Visual indicator showing bounces remaining
- **Custom Callbacks**: Hook for sound effects and particle systems

### Constructor Parameters
```javascript
new BouncingProjectile(x, y, vx, vy, size, color, config)
```

**Config Options**:
- `maxBounces`: Maximum number of bounces (-1 = infinite)
- `energyLoss`: Speed reduction per bounce (0-1, 0 = no loss)
- `minSpeed`: Minimum speed before deactivation (default: 0.5)
- `battleBox`: Battle box bounds object
- `wallMargin`: Collision detection margin (default: 2)
- `spinDecay`: How fast spin effect slows down (default: 0.95)
- `onBounce`: Callback function (projectile, bounceCount)
- `stateMachine`: Optional state machine for lifecycle

## Physics Algorithm

### Wall Collision Detection
```javascript
// Check each wall independently
if (x - size/2 < battleBox.x + margin) {
    x = battleBox.x + size/2 + margin;  // Reposition
    vx = abs(vx);                        // Bounce right
}
// Similar for right, top, bottom walls
```

### Velocity Reflection
- **Horizontal walls** (top/bottom): Invert Y velocity
- **Vertical walls** (left/right): Invert X velocity
- **Energy loss**: `velocity *= (1 - energyLoss)` after bounce

### Spin Effect
```javascript
bounceIntensity = sqrt(vx² + vy²) / 5
spinSpeed = random(-0.5, 0.5) * bounceIntensity * 0.3
rotation += spinSpeed
spinSpeed *= spinDecay  // Gradually slow down
```

## JSON Configuration

### Basic Bouncing Attack
```json
{
    "type": "bouncing_projectiles",
    "time": 0,
    "count": 3,
    "speed": 3,
    "spawnPosition": "center",
    "randomAngle": true,
    "maxBounces": 5,
    "energyLoss": 0,
    "color": "#00ffff"
}
```

### Spawn Position Options
1. **"center"**: Spawn at battle box center
2. **"random"**: Random position within safe zone (20-80% of box)
3. **Side spawn**: Use `side` parameter (left/right/top/bottom)

### Velocity Options
1. **Random Angle**: `"randomAngle": true` - Random direction
2. **Specific Angle**: `"angle": 1.57` - Angle in radians
3. **Random Velocity**: Default - Random vx and vy within speed range

### Configuration Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `count` | number | 1 | Number of projectiles to spawn |
| `speed` | number | 3 | Movement speed |
| `size` | number | 10 | Projectile size |
| `color` | string | "#00ffff" | Projectile color |
| `maxBounces` | number | -1 | Max bounces (-1 = infinite) |
| `energyLoss` | number | 0 | Speed loss per bounce (0-1) |
| `minSpeed` | number | 0.5 | Min speed before deactivation |
| `wallMargin` | number | 2 | Collision detection margin |
| `spinDecay` | number | 0.95 | Spin slowdown rate |
| `spawnPosition` | string | - | "center", "random", or undefined |
| `randomAngle` | boolean | false | Random initial direction |
| `angle` | number | - | Specific angle in radians |
| `side` | string | - | Spawn side (left/right/top/bottom) |

## Visual Features

### 1. Bounce Flash Effect
- Brief white flash on bounce impact
- Duration: 5 frames
- Intensity fades linearly
- Draws expanded rectangle around projectile

### 2. Spin Rotation
- Projectile rotates based on bounce impact
- Spin speed proportional to velocity
- Gradually decays over time
- Random clockwise/counterclockwise direction

### 3. Bounce Counter Indicator
- Only visible when `maxBounces` is set
- Circular segments around projectile
- Filled segments show bounces used
- Fades as bounces are consumed

## Use Cases by Enemy

### Mettaton
**Attack Style**: Chaotic bouncing stars and bombs
```json
{
    "type": "bouncing_projectiles",
    "count": 4,
    "speed": 4,
    "spawnPosition": "random",
    "randomAngle": true,
    "maxBounces": 10,
    "energyLoss": 0,
    "color": "#ff00ff"
}
```

### Tsunderplane
**Attack Style**: Bouncing airplane projectiles
```json
{
    "type": "bouncing_projectiles",
    "count": 2,
    "speed": 3.5,
    "side": "left",
    "angle": 0.5236,  // 30 degrees
    "maxBounces": 6,
    "energyLoss": 0.05,
    "color": "#00ffff"
}
```

### Mad Dummy
**Attack Style**: Bullets that bounce with energy loss
```json
{
    "type": "bouncing_projectiles",
    "count": 8,
    "speed": 4,
    "spawnPosition": "center",
    "randomAngle": true,
    "maxBounces": 3,
    "energyLoss": 0.15,
    "minSpeed": 1.5,
    "color": "#ffffff"
}
```

### Chaos Attacks
**Attack Style**: Infinite bouncing with slight energy loss
```json
{
    "type": "bouncing_projectiles",
    "count": 5,
    "speed": 3,
    "spawnPosition": "random",
    "randomAngle": true,
    "maxBounces": -1,
    "energyLoss": 0.02,
    "minSpeed": 1.0,
    "color": "#ffff00"
}
```

## Pattern Examples

### Pattern 1: Pinball Chaos
```json
{
    "name": "Pinball Chaos",
    "duration": 8000,
    "waves": [
        {
            "type": "bouncing_projectiles",
            "time": 0,
            "count": 3,
            "speed": 4,
            "spawnPosition": "center",
            "randomAngle": true,
            "maxBounces": -1,
            "energyLoss": 0.03,
            "minSpeed": 1.5
        },
        {
            "type": "bouncing_projectiles",
            "time": 2000,
            "count": 2,
            "speed": 3.5,
            "spawnPosition": "random",
            "randomAngle": true,
            "maxBounces": 8
        }
    ]
}
```

### Pattern 2: Controlled Angles
```json
{
    "name": "Controlled Angles",
    "duration": 6000,
    "waves": [
        {
            "type": "bouncing_projectiles",
            "time": 0,
            "count": 1,
            "speed": 4,
            "spawnPosition": "center",
            "angle": 0.785398,  // 45 degrees
            "maxBounces": 15,
            "color": "#ff0000"
        },
        {
            "type": "bouncing_projectiles",
            "time": 500,
            "count": 1,
            "speed": 4,
            "spawnPosition": "center",
            "angle": 2.356194,  // 135 degrees
            "maxBounces": 15,
            "color": "#00ff00"
        },
        {
            "type": "bouncing_projectiles",
            "time": 1000,
            "count": 1,
            "speed": 4,
            "spawnPosition": "center",
            "angle": 3.926991,  // 225 degrees
            "maxBounces": 15,
            "color": "#0000ff"
        }
    ]
}
```

### Pattern 3: Mixed With Other Attacks
```json
{
    "name": "Bouncing + Static",
    "duration": 7000,
    "waves": [
        {
            "type": "bouncing_projectiles",
            "time": 0,
            "count": 2,
            "speed": 3,
            "spawnPosition": "center",
            "randomAngle": true,
            "maxBounces": -1,
            "energyLoss": 0.05
        },
        {
            "type": "projectiles",
            "time": 1000,
            "count": 8,
            "side": "top",
            "speed": 2
        },
        {
            "type": "bones",
            "time": 2000,
            "side": "left",
            "length": 100,
            "speed": 3
        }
    ]
}
```

## Balancing Guidelines

### Speed Values
- **Slow**: 2-2.5 (easier to dodge, good for beginners)
- **Medium**: 3-3.5 (standard difficulty)
- **Fast**: 4-5 (challenging, used sparingly)
- **Extreme**: 5+ (boss-only, very hard)

### Bounce Limits
- **Limited** (1-5 bounces): Predictable, good for early enemies
- **Medium** (6-15 bounces): Moderate chaos
- **High** (16-30 bounces): Chaotic but eventually stops
- **Infinite** (-1): Permanent obstacles, requires energy loss

### Energy Loss
- **No Loss** (0): Maintains speed forever, use with bounce limit
- **Minimal** (0.01-0.05): Slow decay, for long patterns
- **Low** (0.06-0.10): Moderate decay
- **Medium** (0.11-0.20): Noticeable slowdown
- **High** (0.21-0.40): Rapid decay, stops quickly
- **Extreme** (0.41+): Almost immediate stop after few bounces

### Count Guidelines
- **Solo** (1): Focus on single fast projectile
- **Pair** (2): Create patterns together
- **Small Group** (3-4): Moderate chaos
- **Medium Group** (5-8): High difficulty
- **Large Group** (9+): Extreme difficulty, use carefully

## Performance Considerations

### Optimization
- Collision detection is simple AABB (fast)
- Spin rotation only active when spinning
- Bounce flash only draws when active
- Bounce counter only when maxBounces set

### Limits
- Recommended max: 15-20 simultaneous bouncing projectiles
- More than 20: May cause visual clutter
- Combine with energy loss to naturally limit active count

## Integration with Battle System

### Automatic Battle Box Assignment
The `spawnBouncingProjectiles` method automatically passes the battle box bounds:
```javascript
battleBox: box  // Passed to constructor
```

### Bounce Callbacks
Attach custom behavior on bounce:
```json
{
    "type": "bouncing_projectiles",
    "onBounce": "customBounceHandler"
}
```

In code:
```javascript
wave.onBounce = (projectile, bounceCount) => {
    // Play sound effect
    // Spawn particles
    // Trigger events
    console.log(`Bounce #${bounceCount}`);
};
```

## Testing

### Test Enemy Created
**File**: `data/enemies/undertale/test_bouncing.json`

**Patterns**:
1. **Basic Bouncing Test**: Simple projectiles with different bounce limits
2. **Bouncing Chaos**: Multiple projectiles from various sides
3. **Mixed Bouncing Pattern**: Combines bouncing with other attack types

### Test Commands
```javascript
// Test in console
battle.loadEnemy('data/enemies/undertale/test_bouncing.json');
```

## Technical Notes

### Wall Collision Precision
- Uses `wallMargin` to prevent tunneling
- Repositions projectile to valid position on collision
- Ensures projectile never gets stuck in wall

### Velocity Reflection Math
```javascript
// Left/Right walls: vx = abs(vx) or -abs(vx)
// Top/Bottom walls: vy = abs(vy) or -abs(vy)
// This ensures proper bounce direction
```

### Spin Calculation
```javascript
// Based on impact velocity
bounceIntensity = sqrt(vx² + vy²) / 5
// Random direction adds unpredictability
spinSpeed = (random - 0.5) * bounceIntensity * 0.3
```

## Future Enhancements

### Potential Additions
1. **Wall-Specific Behavior**: Different bounce properties per wall
2. **Angle Variation**: Slight random angle change on bounce
3. **Sound Integration**: Built-in sound effect triggering
4. **Particle Effects**: Automatic particle spawn on bounce
5. **Bounce Power-Ups**: Projectile gets faster/slower on bounce
6. **Corner Behavior**: Special handling for corner collisions
7. **Trail Effect**: Motion blur/trail for fast projectiles

### Advanced Patterns
1. **Bouncing Waves**: Spawn multiple in sequence
2. **Synchronized Bouncing**: Multiple projectiles in formation
3. **Bouncing Transformations**: Change properties on bounce
4. **Conditional Bouncing**: Only bounce off certain walls

## Completion Status
✅ **TODO #5 COMPLETE**

**Implemented**:
- BouncingProjectile class with full physics
- Wall collision detection and reflection
- Bounce limiting and energy loss
- Visual effects (spin, flash, counter)
- Spawn method with extensive configuration
- Wave system integration
- Test enemy with varied patterns
- Comprehensive documentation

**Files Created**:
- Enhanced: `js/attacks.js` (BouncingProjectile class + spawn method)
- Created: `data/enemies/undertale/test_bouncing.json`
- Created: `FEATURE_COMPLETED_05_BOUNCING_PROJECTILES.md`

**Ready For**:
- Mettaton bouncing stars and bombs
- Tsunderplane plane attacks
- Mad Dummy bullet patterns
- Any chaotic bouncing attack patterns
