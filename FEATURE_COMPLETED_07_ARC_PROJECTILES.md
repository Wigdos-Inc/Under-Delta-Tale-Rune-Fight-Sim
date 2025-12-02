# Feature Completed: Arc/Parabola Projectiles (TODO #7)

## Overview
Implemented a complete arc projectile system with realistic gravity simulation, allowing projectiles to follow parabolic trajectories perfect for lobbed attacks like Toriel and Asgore's fire balls.

## Implementation Details

### Core Class: ArcProjectile
**Location**: `js/attacks.js`

**Features**:
- **Gravity Simulation**: Realistic physics with configurable gravity strength
- **Parabolic Trajectories**: Natural arc paths
- **Ground Bounce**: Optional bouncing with dampening
- **Target Calculation**: Static helper to calculate perfect arcs to targets
- **Peak Detection**: Callback when projectile reaches apex
- **Trail Effect**: Visual motion trail
- **Air Resistance**: Optional velocity dampening
- **Rotation**: Auto-rotates based on velocity direction

### Constructor Parameters
```javascript
new ArcProjectile(x, y, vx, vy, size, color, config)
```

**Config Options**:
- `gravity`: Pixels per frame squared (default: 0.15)
- `airResistance`: Velocity dampening 0-1 (default: 0)
- `canBounce`: Enable ground bouncing (default: false)
- `maxBounces`: Maximum bounces (default: 3)
- `bounceDampening`: Energy retained on bounce (default: 0.6)
- `groundY`: Ground level Y coordinate
- `battleBox`: Battle box bounds
- `trailLength`: Trail segments (default: 5)
- `showTrail`: Show motion trail (default: true)
- `onPeak`: Callback when reaching peak
- `onGround`: Callback on ground contact

## Physics Algorithm

### Gravity Application
```javascript
// Each frame:
velocityY += gravity  // Acceleration due to gravity
x += velocityX
y += velocityY
```

### Target-Based Arc Calculation
**Static Helper Method**:
```javascript
ArcProjectile.calculateArcToTarget(startX, startY, targetX, targetY, gravity, arcHeight)
```

**Algorithm**:
```javascript
dx = targetX - startX
dy = targetY - startY
time = sqrt(abs(dx) / (gravity * 0.5)) * arcHeight

vx = dx / time
vy = (dy / time) - (0.5 * gravity * time)
```

**Arc Height Multiplier**:
- `< 1.0`: Lower, faster arc
- `= 1.0`: Standard parabola
- `> 1.0`: Higher, slower arc

### Ground Bounce Physics
```javascript
if (y >= groundY - size/2) {
    y = groundY - size/2  // Reposition
    velocityY = -abs(velocityY) * bounceDampening  // Reverse and dampen
    velocityX *= bounceDampening  // Horizontal dampening
    bounceCount++
}
```

## JSON Configuration

### Basic Arc Attack
```json
{
    "type": "arc_projectiles",
    "time": 0,
    "count": 3,
    "side": "left",
    "speed": 3,
    "gravity": 0.15,
    "canBounce": false,
    "showTrail": true,
    "color": "#ff8800"
}
```

### Targeted Arc (Hit Specific Point)
```json
{
    "type": "arc_projectiles",
    "time": 0,
    "count": 1,
    "side": "left",
    "targetPosition": {
        "x": 320,
        "y": 400
    },
    "arcHeight": 1.2,
    "gravity": 0.15,
    "size": 14,
    "color": "#ff0000"
}
```

### Bouncing Arc
```json
{
    "type": "arc_projectiles",
    "time": 0,
    "count": 2,
    "side": "top",
    "speed": 4,
    "gravity": 0.2,
    "canBounce": true,
    "maxBounces": 3,
    "bounceDampening": 0.7,
    "color": "#ff00ff"
}
```

### Configuration Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `count` | number | 1 | Number of projectiles |
| `speed` | number | varies | Initial speed (if not using target) |
| `size` | number | 10 | Projectile size |
| `color` | string | "#ff8800" | Projectile color |
| `gravity` | number | 0.15 | Gravity strength |
| `airResistance` | number | 0 | Air dampening (0-1) |
| `canBounce` | boolean | false | Enable ground bounce |
| `maxBounces` | number | 3 | Maximum bounces |
| `bounceDampening` | number | 0.6 | Energy retention on bounce |
| `groundY` | number | box.bottom | Ground level |
| `trailLength` | number | 5 | Trail segment count |
| `showTrail` | boolean | true | Show motion trail |
| `spawnPosition` | string | - | "center", "random", or undefined |
| `side` | string | - | "left", "right", "top", "bottom" |
| `targetPosition` | object | - | {x, y} target coordinates |
| `arcHeight` | number | 1.0 | Arc height multiplier for targets |
| `angle` | number | - | Manual angle override |

## Spawn Position Options

### 1. Side Spawn (Default)
```json
"side": "left"  // or "right", "top", "bottom"
```
Spawns outside battle box, projectile arcs inward.

### 2. Random Position
```json
"spawnPosition": "random"
```
Spawns in upper 20-40% of battle box.

### 3. Center Position
```json
"spawnPosition": "center"
```
Spawns at center top (30% height).

## Velocity Calculation Methods

### Method 1: Random Arc (Default)
```javascript
// Based on side with random variation
side: "left"
vx = speed * random(0.8, 1.2)
vy = -speed * random(1.5, 2.5)
```

### Method 2: Target Position
```javascript
"targetPosition": { "x": 320, "y": 400 },
"arcHeight": 1.2
// Uses calculateArcToTarget() method
```

### Method 3: Manual Angle
```javascript
"angle": 0.785398,  // 45 degrees in radians
"speed": 4
vx = cos(angle) * speed
vy = sin(angle) * speed
```

## Visual Features

### 1. Motion Trail
- Stores recent positions
- Faded line showing path
- Configurable length (5-15 segments)
- Helps players predict trajectory

### 2. Velocity-Based Rotation
```javascript
rotation = atan2(velocityY, velocityX)
```
Projectile rotates to face direction of movement.

### 3. Speed Stretch Effect
```javascript
speedFactor = sqrt(vx² + vy²)
stretch = min(speedFactor * 0.15, 1.5)
scale(1 + stretch * 0.2, 1)
```
Projectile slightly elongates when moving fast.

### 4. Fire Glow Effect
For fire-colored projectiles (contains red channel):
```javascript
if (color.includes('ff')) {
    // Draw orange glow around projectile
    fillStyle = 'rgba(255, 200, 100, 0.4)'
}
```

## Use Cases by Enemy

### Toriel (Fire Magic)
**Attack Style**: Arcing fireballs that rain down
```json
{
    "type": "arc_projectiles",
    "count": 3,
    "side": "top",
    "speed": 3,
    "gravity": 0.18,
    "canBounce": false,
    "showTrail": true,
    "trailLength": 8,
    "color": "#ff6600"
}
```

### Asgore (Trident Fire)
**Attack Style**: Targeted fire attacks
```json
{
    "type": "arc_projectiles",
    "count": 2,
    "side": "left",
    "targetPosition": { "x": 320, "y": 410 },
    "arcHeight": 1.5,
    "gravity": 0.15,
    "size": 16,
    "color": "#ff0000"
}
```

### Bouncing Fire Patterns
**Attack Style**: Fireballs that bounce
```json
{
    "type": "arc_projectiles",
    "count": 4,
    "spawnPosition": "random",
    "speed": 3.5,
    "gravity": 0.2,
    "canBounce": true,
    "maxBounces": 5,
    "bounceDampening": 0.6,
    "color": "#ffaa00"
}
```

### Mixed with Other Attacks
```json
{
    "name": "Fire Rain",
    "duration": 8000,
    "waves": [
        {
            "type": "arc_projectiles",
            "time": 0,
            "count": 3,
            "side": "top",
            "speed": 3,
            "gravity": 0.15
        },
        {
            "type": "projectiles",
            "time": 1000,
            "count": 8,
            "side": "left",
            "speed": 2.5
        }
    ]
}
```

## Pattern Examples

### Pattern 1: Rain From Above
```json
{
    "name": "Fire Rain",
    "duration": 7000,
    "waves": [
        {
            "type": "arc_projectiles",
            "time": 0,
            "count": 3,
            "side": "top",
            "speed": 3,
            "gravity": 0.2,
            "color": "#ff8800"
        },
        {
            "type": "arc_projectiles",
            "time": 1500,
            "count": 4,
            "side": "top",
            "speed": 3.5,
            "gravity": 0.18,
            "color": "#ff6600"
        }
    ]
}
```

### Pattern 2: Converging Arcs
```json
{
    "name": "Converging Fire",
    "duration": 6000,
    "waves": [
        {
            "type": "arc_projectiles",
            "time": 0,
            "count": 1,
            "side": "left",
            "targetPosition": { "x": 320, "y": 400 },
            "arcHeight": 1.0,
            "gravity": 0.15
        },
        {
            "type": "arc_projectiles",
            "time": 500,
            "count": 1,
            "side": "right",
            "targetPosition": { "x": 320, "y": 400 },
            "arcHeight": 1.0,
            "gravity": 0.15
        }
    ]
}
```

### Pattern 3: Bouncing Barrage
```json
{
    "name": "Bouncing Fire",
    "duration": 8000,
    "waves": [
        {
            "type": "arc_projectiles",
            "time": 0,
            "count": 2,
            "side": "left",
            "speed": 3.5,
            "gravity": 0.18,
            "canBounce": true,
            "maxBounces": 3,
            "bounceDampening": 0.7
        },
        {
            "type": "arc_projectiles",
            "time": 1000,
            "count": 2,
            "side": "right",
            "speed": 3.5,
            "gravity": 0.18,
            "canBounce": true,
            "maxBounces": 3,
            "bounceDampening": 0.7
        }
    ]
}
```

## Balancing Guidelines

### Gravity Values
- **Light** (0.08-0.12): Slow, floaty arcs - easier to dodge
- **Medium** (0.13-0.18): Standard gravity - balanced
- **Heavy** (0.19-0.30): Fast, steep arcs - harder to predict
- **Extreme** (0.31+): Almost straight down - very challenging

### Speed Values
- **Slow** (1.5-2.5): Predictable arcs, good for beginners
- **Medium** (2.6-3.5): Standard difficulty
- **Fast** (3.6-5.0): Challenging, requires quick reflexes
- **Extreme** (5.0+): Boss-only, very difficult

### Arc Height Multipliers (for targeted arcs)
- **0.5-0.8**: Low, fast arcs - harder to see coming
- **0.9-1.2**: Standard arcs - balanced
- **1.3-2.0**: High, slow arcs - easier to dodge but longer duration

### Bounce Settings
- **1-2 bounces**: Predictable pattern
- **3-5 bounces**: Moderate chaos
- **6-10 bounces**: High chaos
- **Dampening 0.8-0.9**: High energy retention, many bounces
- **Dampening 0.5-0.7**: Medium energy loss
- **Dampening 0.3-0.4**: Quick stop after few bounces

### Count Guidelines
- **Solo** (1-2): Focus on individual trajectories
- **Small Group** (3-5): Moderate difficulty
- **Medium Group** (6-10): High difficulty
- **Large Group** (11+): Boss-only, extreme difficulty

## Performance Considerations

### Optimization
- Trail rendering only active when `showTrail` is true
- Simple gravity calculation (just += operator)
- Efficient collision detection (only checks ground if `canBounce`)
- Trail automatically limits length

### Limits
- Recommended max: 15-20 simultaneous arc projectiles
- Trail segments: 5-15 (more = prettier but slower)
- Bounce limit naturally reduces active count

## Advanced Techniques

### Synchronized Arcs
Spawn multiple projectiles targeting same point:
```json
{
    "type": "arc_projectiles",
    "count": 3,
    "side": "top",
    "targetPosition": { "x": 320, "y": 420 },
    "arcHeight": 1.0
}
```

### Staggered Timing
Create wave patterns with delays:
```json
{
    "waves": [
        { "type": "arc_projectiles", "time": 0, "count": 2 },
        { "type": "arc_projectiles", "time": 500, "count": 2 },
        { "type": "arc_projectiles", "time": 1000, "count": 2 }
    ]
}
```

### Variable Arc Heights
Create depth illusion:
```json
[
    { "targetPosition": {...}, "arcHeight": 0.8, "size": 10 },
    { "targetPosition": {...}, "arcHeight": 1.5, "size": 14 }
]
```

## Testing

### Test Enemy Created
**File**: `data/enemies/undertale/test_arc.json`

**Patterns**:
1. **Basic Arc Test**: Simple arcs from different sides
2. **Bouncing Arcs**: Various bounce configurations
3. **Targeted Arcs**: Converging attacks to specific points
4. **Mixed Arc Pattern**: Combines arcs with other attack types

### Test Commands
```javascript
// Test in console
battle.loadEnemy('data/enemies/undertale/test_arc.json');
```

## Technical Notes

### Parabolic Motion
Standard physics formula:
```
y = y₀ + v₀t + ½gt²
```
Implemented as incremental updates:
```javascript
velocityY += gravity
y += velocityY
```

### Peak Detection
```javascript
if (!reachedPeak && velocityY > 0) {
    reachedPeak = true  // Changed from negative to positive
    onPeakCallback()
}
```

### Ground Collision
```javascript
if (y >= groundY - size/2) {
    // Clamp position
    y = groundY - size/2
    
    // Bounce
    velocityY = -abs(velocityY) * dampening
    velocityX *= dampening
}
```

## Future Enhancements

### Potential Additions
1. **Wind Effect**: Horizontal acceleration
2. **Terminal Velocity**: Maximum fall speed
3. **Spin Rate**: Rotation speed separate from direction
4. **Size Change**: Grow/shrink during flight
5. **Color Shift**: Fade or change color mid-flight
6. **Split on Peak**: Explode at apex into fragments
7. **Homing After Peak**: Start homing after apex
8. **Wall Bounce**: Bounce off side walls too

## Completion Status
✅ **TODO #7 COMPLETE**

**Implemented**:
- ArcProjectile class with full gravity physics
- Target-based arc calculation (static helper)
- Ground bounce with dampening
- Peak detection and callbacks
- Visual effects (trail, rotation, stretch, glow)
- Spawn method with extensive configuration
- Wave system integration
- Test enemy with varied patterns
- Comprehensive documentation

**Files Created/Modified**:
- Enhanced: `js/attacks.js` (ArcProjectile class + spawn method)
- Created: `data/enemies/undertale/test_arc.json`
- Created: `FEATURE_COMPLETED_07_ARC_PROJECTILES.md`

**Ready For**:
- Toriel fire attacks
- Asgore trident fire
- Any lobbed projectile patterns
- Artillery-style boss attacks
