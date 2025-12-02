# Feature Completed: Wave Motion Projectiles (TODO #8)

## Overview
Implemented a comprehensive wave motion projectile system with 5 distinct pattern types, allowing projectiles to follow sinusoidal, spiral, and figure-8 paths for visually stunning and challenging attack patterns.

## Implementation Details

### Core Class: WaveProjectile
**Location**: `js/attacks.js`

**Features**:
- **5 Wave Pattern Types**: sine, cosine, both, spiral, figure-8
- **Configurable Amplitude**: Wave height/radius
- **Configurable Frequency**: Oscillation speed
- **Phase Offset**: Synchronize multiple waves
- **Trail Effect**: Visual motion path
- **Direction Rotation**: Auto-rotates with velocity
- **Base Movement**: Independent forward velocity
- **Perpendicular Oscillation**: Wave perpendicular to movement

### Constructor Parameters
```javascript
new WaveProjectile(x, y, vx, vy, size, color, config)
```

**Config Options**:
- `waveType`: 'sine', 'cosine', 'both', 'spiral', 'figure8' (default: 'sine')
- `amplitude`: Wave height in pixels (default: 30)
- `frequency`: Oscillation speed in radians/frame (default: 0.1)
- `phaseOffset`: Starting phase in radians (default: 0)
- `trailLength`: Trail segments (default: 8)
- `showTrail`: Show motion trail (default: true)
- `rotateWithDirection`: Rotate sprite with velocity (default: true)
- `spiralRadiusGrowth`: Radius increase per frame (default: 0)
- `spiralAngleSpeed`: Spiral rotation speed (default: 0.1)
- `figure8Scale`: Figure-8 size multiplier (default: 1.0)

## Wave Pattern Types

### 1. Sine Wave
**Description**: Standard sinusoidal oscillation perpendicular to movement direction

**Math**:
```javascript
offset = sin(waveTime + phaseOffset) * amplitude
```

**Visual**: Classic wave pattern, smooth oscillation

**Use Case**: Standard wave attacks, rhythmic patterns

**JSON Example**:
```json
{
    "type": "wave_projectiles",
    "waveType": "sine",
    "amplitude": 30,
    "frequency": 0.1
}
```

### 2. Cosine Wave
**Description**: Cosine wave (90° phase shift from sine)

**Math**:
```javascript
offset = cos(waveTime + phaseOffset) * amplitude
```

**Visual**: Starts at peak instead of center

**Use Case**: Opposite phase to sine for alternating patterns

**JSON Example**:
```json
{
    "type": "wave_projectiles",
    "waveType": "cosine",
    "amplitude": 25,
    "frequency": 0.12
}
```

### 3. Both (Circular/Elliptical)
**Description**: Combined sine and cosine creating circular motion

**Math**:
```javascript
sineX = sin(waveTime + phaseOffset) * amplitude
cosineY = cos(waveTime + phaseOffset) * amplitude
```

**Visual**: Projectile moves in circular/elliptical path

**Use Case**: Orbital patterns, planetary motion effects

**JSON Example**:
```json
{
    "type": "wave_projectiles",
    "waveType": "both",
    "amplitude": 35,
    "frequency": 0.08
}
```

### 4. Spiral
**Description**: Expanding circular pattern with increasing radius

**Math**:
```javascript
spiralRadius = amplitude + (waveTime * spiralRadiusGrowth)
spiralAngle = waveTime * spiralAngleSpeed + phaseOffset
offsetX = cos(spiralAngle) * spiralRadius
offsetY = sin(spiralAngle) * spiralRadius
```

**Visual**: Projectile spirals outward while moving forward

**Use Case**: Vortex effects, expanding patterns, Madjick orbs

**JSON Example**:
```json
{
    "type": "wave_projectiles",
    "waveType": "spiral",
    "amplitude": 20,
    "frequency": 0.15,
    "spiralRadiusGrowth": 0.5,
    "spiralAngleSpeed": 0.2
}
```

### 5. Figure-8 (Lemniscate)
**Description**: Complex figure-8/infinity symbol pattern

**Math** (Lemniscate parametric equations):
```javascript
t = waveTime + phaseOffset
scale = amplitude * figure8Scale
denom = 1 + sin²(t)
offsetX = (cos(t) * scale) / denom
offsetY = (sin(t) * cos(t) * scale) / denom
```

**Visual**: Projectile traces infinity symbol while moving

**Use Case**: Complex aesthetic patterns, boss signature moves

**JSON Example**:
```json
{
    "type": "wave_projectiles",
    "waveType": "figure8",
    "amplitude": 40,
    "frequency": 0.1,
    "figure8Scale": 1.2
}
```

## JSON Configuration

### Basic Wave Attack
```json
{
    "type": "wave_projectiles",
    "time": 0,
    "count": 3,
    "side": "left",
    "speed": 2.5,
    "waveType": "sine",
    "amplitude": 30,
    "frequency": 0.1,
    "spacing": true,
    "color": "#00ffff"
}
```

### Synchronized Waves
```json
{
    "type": "wave_projectiles",
    "count": 4,
    "side": "left",
    "speed": 2,
    "waveType": "sine",
    "amplitude": 30,
    "frequency": 0.1,
    "phaseOffset": 0,
    "spacing": true
}
```

### Opposite Phase Waves
```json
[
    {
        "type": "wave_projectiles",
        "side": "left",
        "waveType": "sine",
        "phaseOffset": 0
    },
    {
        "type": "wave_projectiles",
        "side": "right",
        "waveType": "sine",
        "phaseOffset": 3.14159
    }
]
```

### Configuration Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `count` | number | 1 | Number of projectiles |
| `speed` | number | 2 | Base movement speed |
| `size` | number | 10 | Projectile size |
| `color` | string | "#00ffff" | Projectile color |
| `waveType` | string | "sine" | Wave pattern type |
| `amplitude` | number | 30 | Wave height/radius |
| `frequency` | number | 0.1 | Oscillation speed |
| `phaseOffset` | number | auto | Starting phase (radians) |
| `trailLength` | number | 8 | Trail segment count |
| `showTrail` | boolean | true | Show motion trail |
| `rotateWithDirection` | boolean | true | Rotate with velocity |
| `spacing` | boolean | false | Evenly space spawn positions |
| `side` | string | random | Spawn side |
| `angle` | number | - | Override movement angle |
| `spiralRadiusGrowth` | number | 0 | Spiral expansion rate |
| `spiralAngleSpeed` | number | 0.1 | Spiral rotation speed |
| `figure8Scale` | number | 1.0 | Figure-8 size multiplier |

## Physics & Math

### Base Movement
```javascript
centerX += baseVx  // Forward movement
centerY += baseVy
```

### Wave Axis Calculation
Perpendicular to base direction:
```javascript
baseAngle = atan2(baseVy, baseVx)
waveAxisX = -sin(baseAngle)  // Perpendicular
waveAxisY = cos(baseAngle)
```

### Sine Wave Application
```javascript
sineOffset = sin(waveTime + phaseOffset) * amplitude
offsetX = waveAxisX * sineOffset
offsetY = waveAxisY * sineOffset
x = centerX + offsetX
y = centerY + offsetY
```

### Phase Synchronization
Auto-calculate phase for multiple projectiles:
```javascript
phaseOffset = i * (2π / count)
```
Creates evenly distributed wave phases.

## Visual Features

### 1. Motion Trail
```javascript
trail.push({ x, y })
if (trail.length > trailLength) trail.shift()
```
- Stores recent positions
- Faded gradient effect
- Configurable length
- Helps visualize pattern

### 2. Direction-Based Rotation
```javascript
if (rotateWithDirection) {
    rotation = atan2(vy, vx)
}
```
Sprite rotates to face velocity direction.

### 3. Glow Effect
```javascript
ctx.strokeStyle = color
ctx.globalAlpha = 0.3
ctx.strokeRect(-size/2 - 2, -size/2 - 2, size + 4, size + 4)
```
Subtle outer glow for wave projectiles.

## Pattern Examples

### Pattern 1: Parallel Waves
```json
{
    "name": "Wave Wall",
    "duration": 6000,
    "waves": [
        {
            "type": "wave_projectiles",
            "time": 0,
            "count": 5,
            "side": "left",
            "speed": 2,
            "waveType": "sine",
            "amplitude": 25,
            "frequency": 0.1,
            "spacing": true
        }
    ]
}
```

### Pattern 2: Opposing Waves
```json
{
    "name": "Crossfire Waves",
    "duration": 7000,
    "waves": [
        {
            "type": "wave_projectiles",
            "time": 0,
            "count": 3,
            "side": "left",
            "waveType": "sine",
            "phaseOffset": 0,
            "spacing": true
        },
        {
            "type": "wave_projectiles",
            "time": 500,
            "count": 3,
            "side": "right",
            "waveType": "sine",
            "phaseOffset": 3.14159,
            "spacing": true
        }
    ]
}
```

### Pattern 3: Spiral Vortex
```json
{
    "name": "Spiral Attack",
    "duration": 8000,
    "waves": [
        {
            "type": "wave_projectiles",
            "time": 0,
            "count": 2,
            "side": "left",
            "speed": 2,
            "waveType": "spiral",
            "amplitude": 20,
            "frequency": 0.15,
            "spiralRadiusGrowth": 0.5,
            "spiralAngleSpeed": 0.2,
            "trailLength": 15
        }
    ]
}
```

### Pattern 4: Figure-8 Showcase
```json
{
    "name": "Infinity Pattern",
    "duration": 9000,
    "waves": [
        {
            "type": "wave_projectiles",
            "time": 0,
            "count": 1,
            "side": "left",
            "speed": 1.5,
            "waveType": "figure8",
            "amplitude": 40,
            "frequency": 0.1,
            "figure8Scale": 1.5,
            "trailLength": 12
        }
    ]
}
```

## Use Cases by Enemy

### Madjick (Orb Attacks)
**Attack Style**: Floating magical orbs
```json
{
    "type": "wave_projectiles",
    "count": 3,
    "side": "top",
    "speed": 1.5,
    "waveType": "both",
    "amplitude": 40,
    "frequency": 0.08,
    "color": "#ff00ff"
}
```

### Knight Knight (Sword Waves)
**Attack Style**: Wavy sword projectiles
```json
{
    "type": "wave_projectiles",
    "count": 4,
    "side": "right",
    "speed": 2.5,
    "waveType": "sine",
    "amplitude": 30,
    "frequency": 0.12,
    "spacing": true,
    "color": "#ffffff"
}
```

### Astigmatism (Eye Beams)
**Attack Style**: Undulating laser-like attacks
```json
{
    "type": "wave_projectiles",
    "count": 2,
    "side": "left",
    "speed": 3,
    "waveType": "cosine",
    "amplitude": 35,
    "frequency": 0.15,
    "color": "#ffff00"
}
```

### Boss Signature Moves
**Attack Style**: Complex figure-8 patterns
```json
{
    "type": "wave_projectiles",
    "count": 1,
    "side": "top",
    "speed": 2,
    "waveType": "figure8",
    "amplitude": 50,
    "frequency": 0.08,
    "figure8Scale": 1.5,
    "trailLength": 15,
    "size": 14,
    "color": "#ff0066"
}
```

## Balancing Guidelines

### Amplitude Values
- **Small** (10-20): Tight waves, easier to dodge
- **Medium** (21-35): Standard waves, balanced
- **Large** (36-50): Wide waves, harder to predict
- **Extreme** (51+): Very wide, boss-only

### Frequency Values
- **Slow** (0.05-0.08): Gentle waves, long period
- **Medium** (0.09-0.15): Standard oscillation
- **Fast** (0.16-0.25): Rapid waves, challenging
- **Extreme** (0.26+): Very rapid, disorienting

### Speed Values
- **Slow** (1.0-1.5): Easy to track patterns
- **Medium** (1.6-2.5): Standard difficulty
- **Fast** (2.6-4.0): Challenging
- **Extreme** (4.0+): Boss-only

### Count Guidelines
- **Solo** (1-2): Focus on pattern beauty
- **Small Group** (3-5): Moderate difficulty
- **Medium Group** (6-10): High difficulty
- **Large Group** (11+): Extreme difficulty, use carefully

### Pattern Complexity
- **Sine/Cosine**: Basic, easy to learn
- **Both**: Medium complexity, circular motion
- **Spiral**: Complex, expanding pattern
- **Figure-8**: Very complex, signature moves

## Performance Considerations

### Optimization
- Efficient trail management (fixed length array)
- Simple trigonometric calculations
- No complex physics simulation
- Trail rendering skipped if disabled

### Limits
- Recommended max: 15-20 simultaneous wave projectiles
- Trail length: 5-15 segments (balance visual quality vs performance)
- Higher frequencies more CPU intensive (more calculations)

## Advanced Techniques

### Synchronized Wave Groups
```json
{
    "count": 4,
    "spacing": true,
    "phaseOffset": 0  // Auto-calculated per projectile
}
```

### Phase Opposition
Create "breathing" pattern:
```json
[
    { "side": "left", "phaseOffset": 0 },
    { "side": "right", "phaseOffset": 3.14159 }
]
```

### Mixed Wave Types
Combine different patterns:
```json
{
    "waves": [
        { "waveType": "sine", "time": 0 },
        { "waveType": "spiral", "time": 1000 },
        { "waveType": "figure8", "time": 2000 }
    ]
}
```

### Custom Movement Angles
```json
{
    "angle": 0.785398,  // 45 degrees
    "speed": 2,
    "waveType": "sine"
}
```

## Testing

### Test Enemy Created
**File**: `data/enemies/undertale/test_wave.json`

**Patterns**:
1. **Basic Wave Test**: Simple sine/cosine waves
2. **Multiple Waves**: Synchronized wave groups
3. **Advanced Patterns**: Spiral and figure-8 demonstrations
4. **Mixed Wave Pattern**: Combines waves with other attacks

### Test Commands
```javascript
// Test in console
battle.loadEnemy('data/enemies/undertale/test_wave.json');
```

## Technical Notes

### Wave Coordinate System
The wave oscillates perpendicular to the base velocity:
```
     Wave Axis
         ↑
         |
Base → → → → Forward
         |
         ↓
```

### Phase Offset Auto-Calculation
For synchronized waves:
```javascript
for (let i = 0; i < count; i++) {
    phaseOffset = i * (Math.PI * 2 / count)
}
```
Creates evenly spaced wave phases.

### Figure-8 Rotation
Lemniscate is rotated to align with movement:
```javascript
rotatedX = offsetX * cos(baseAngle) - offsetY * sin(baseAngle)
rotatedY = offsetX * sin(baseAngle) + offsetY * cos(baseAngle)
```

## Future Enhancements

### Potential Additions
1. **Amplitude Modulation**: Amplitude changes over time
2. **Frequency Modulation**: Frequency changes over time
3. **Multiple Harmonics**: Combine multiple wave frequencies
4. **Custom Wave Functions**: User-defined wave equations
5. **3D Spiral**: Z-axis depth simulation
6. **Color Shift Along Trail**: Rainbow trail effect
7. **Size Pulsing**: Size oscillates with wave
8. **Wave Interference**: Multiple waves interact

### Complex Patterns
1. **Double Helix**: Two counter-rotating spirals
2. **Rose Curve**: Flower petal patterns
3. **Epitrochoid**: Complex spirograph patterns
4. **Damped Waves**: Amplitude decreases over time

## Completion Status
✅ **TODO #8 COMPLETE**

**Implemented**:
- WaveProjectile class with 5 pattern types
- Sine, cosine, both, spiral, figure-8 waves
- Configurable amplitude and frequency
- Phase offset synchronization
- Visual effects (trail, rotation, glow)
- Spawn method with extensive configuration
- Wave system integration
- Test enemy with varied patterns
- Comprehensive documentation

**Files Created/Modified**:
- Enhanced: `js/attacks.js` (WaveProjectile class + spawn method)
- Created: `data/enemies/undertale/test_wave.json`
- Created: `FEATURE_COMPLETED_08_WAVE_PROJECTILES.md`

**Ready For**:
- Madjick orb attacks
- Knight Knight sword waves
- Aesthetic bullet patterns
- Complex boss signature moves
- Any undulating projectile pattern
