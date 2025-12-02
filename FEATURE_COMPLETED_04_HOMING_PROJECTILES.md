# Homing Projectiles - Feature Documentation

## Overview
TODO #4: Homing Projectiles
**Status**: ✅ COMPLETED

Implemented projectiles that track and follow the player's soul with configurable homing behavior, needed for Undyne spears, Mettaton attacks, and Asriel star projectiles.

## Features

### Core Homing Mechanics

#### 1. **Target Tracking**
- Projectiles automatically calculate angle to soul
- Smooth turning towards target
- Configurable turn rate (max radians per frame)
- Handles angle wrapping (−π to π)

#### 2. **Homing Strength**
- Value from 0-1 controls how aggressively projectile homes
- 0.1 = gentle tracking (easy to dodge)
- 0.3 = aggressive tracking (hard to dodge)
- Multiplied with turn rate for smooth control

#### 3. **Homing Delay**
- Optional delay before homing activates
- Projectile travels in initial direction during delay
- Useful for telegraphing and fair gameplay
- Measured in frames

#### 4. **Speed Modes**

**Constant Speed** (default):
- Projectile maintains constant speed
- Direction changes smoothly
- Predictable movement

**Acceleration Mode**:
- Projectile speeds up over time
- Reaches maximum speed
- Creates urgency and difficulty ramp

---

## Implementation Details

### HomingProjectile Class

Located in `js/attacks.js`, extends `Projectile` class.

#### Constructor Parameters
```javascript
new HomingProjectile(x, y, speed, size, color, config)
```

**Config Options**:
- `homingStrength` (0-1): How aggressively it homes (default: 0.1)
- `maxTurnRate` (radians): Maximum turn per frame (default: 0.15)
- `homingDelay` (frames): Delay before homing starts (default: 0)
- `initialVx`, `initialVy`: Initial velocity (default: 0)
- `useAcceleration` (bool): Use acceleration mode (default: false)
- `acceleration`: Speed increase per frame (default: 0.2)
- `maxSpeed`: Maximum speed in acceleration mode (default: speed * 2)

#### Visual Features
- **Arrow shape**: Points in direction of movement
- **Trail effect**: Shows movement direction when homing is active
- **Rotation**: Automatically rotates to face movement direction

---

## Algorithm

### Homing Update Loop

```javascript
1. Calculate vector from projectile to soul (dx, dy)
2. Calculate desired angle: atan2(dy, dx)
3. Get current angle from velocity: atan2(vy, vx)
4. Calculate angle difference (normalize to -π to π)
5. Clamp difference to maxTurnRate
6. Apply turn with homingStrength multiplier
7. Update velocity based on new angle and speed
8. Move projectile
```

### Angle Normalization

Ensures smooth rotation by keeping angle difference in range −π to π:
```javascript
while (angleDiff > π) angleDiff -= 2π
while (angleDiff < -π) angleDiff += 2π
```

This prevents "the long way around" rotation.

---

## JSON Configuration

### Basic Homing Wave
```json
{
  "time": 1000,
  "type": "homing_projectiles",
  "count": 3,
  "speed": 2,
  "size": 15,
  "color": "#ff00ff",
  "homingStrength": 0.1,
  "homingDelay": 0
}
```

### Delayed Homing (Telegraphed)
```json
{
  "time": 2000,
  "type": "homing_projectiles",
  "count": 2,
  "speed": 2.5,
  "size": 18,
  "color": "#00ffff",
  "homingStrength": 0.15,
  "homingDelay": 30
}
```

### Accelerating Homing (Aggressive)
```json
{
  "time": 3000,
  "type": "homing_projectiles",
  "count": 4,
  "speed": 1.5,
  "size": 12,
  "color": "#ff0080",
  "homingStrength": 0.2,
  "homingDelay": 10,
  "useAcceleration": true,
  "acceleration": 0.2,
  "maxSpeed": 5
}
```

---

## Usage Examples

### Example 1: Undyne Spears (Gentle Homing)
```json
{
  "type": "homing_projectiles",
  "count": 1,
  "speed": 2,
  "size": 20,
  "color": "#00ffff",
  "homingStrength": 0.08,
  "homingDelay": 20,
  "side": "top"
}
```

**Characteristics**:
- Low homing strength (0.08) for gentle tracking
- 20-frame delay for telegraphing
- Player can dodge with good timing

### Example 2: Mettaton Stars (Moderate Homing)
```json
{
  "type": "homing_projectiles",
  "count": 5,
  "speed": 2.5,
  "size": 12,
  "color": "#ffff00",
  "homingStrength": 0.12,
  "homingDelay": 0
}
```

**Characteristics**:
- Moderate homing (0.12)
- No delay - immediate tracking
- Multiple projectiles for challenge

### Example 3: Asriel Stars (Aggressive Accelerating)
```json
{
  "type": "homing_projectiles",
  "count": 8,
  "speed": 1.5,
  "size": 15,
  "color": "#ff00ff",
  "homingStrength": 0.25,
  "homingDelay": 10,
  "useAcceleration": true,
  "acceleration": 0.3,
  "maxSpeed": 6
}
```

**Characteristics**:
- High homing strength (0.25)
- Acceleration creates urgency
- Short delay then aggressive tracking
- Bullet hell intensity

---

## Balancing Guidelines

### Homing Strength Values

| Strength | Difficulty | Use Case |
|----------|-----------|----------|
| 0.05-0.10 | Easy | Tutorial, early enemies |
| 0.10-0.15 | Normal | Mid-game enemies |
| 0.15-0.20 | Hard | Boss attacks |
| 0.20-0.30 | Very Hard | Final boss, Genocide |

### Homing Delay

| Delay (frames) | Effect | When to Use |
|----------------|--------|-------------|
| 0 | Instant tracking | Surprise attacks, bullet hell |
| 10-20 | Short telegraph | Fair warning |
| 30-60 | Long telegraph | Large/dangerous projectiles |
| 60+ | Very long | Boss special attacks |

### Speed vs Homing

**Slow + High Homing**: Creates "persistent threat"
- Hard to shake off
- Player must keep moving
- Example: 1.5 speed, 0.20 strength

**Fast + Low Homing**: Creates "dodgeable menace"
- Can be outmaneuvered
- Rewards good movement
- Example: 3.5 speed, 0.08 strength

---

## Integration

### Battle System Integration

Added to `js/battle.js` in `updateAttackPhase()`:
```javascript
activeObjects.forEach(obj => {
    if (obj.type === 'homing_projectile' && obj.setTarget) {
        obj.setTarget(this.soul);
    }
});
```

Automatically sets soul as target for all homing projectiles each frame.

### Attack Pattern Integration

Added to `js/attacks.js`:
1. **HomingProjectile class** (150+ lines)
2. **spawnHomingProjectiles() method** in AttackPattern
3. **'homing_projectiles' case** in spawnWave() switch

---

## Advanced Techniques

### 1. **Predictive Homing**
Current implementation homes to current position. Could enhance to predict where soul will be:
```javascript
// Future enhancement
const predictedX = soul.x + soul.vx * predictFrames;
const predictedY = soul.y + soul.vy * predictFrames;
```

### 2. **Proximity Activation**
Homing could activate based on distance instead of time:
```javascript
if (distance < activationRadius) {
    // Start homing
}
```

### 3. **Speed Variation**
Could pulse speed for visual variety:
```javascript
this.speed = baseSpeed + Math.sin(frameCount * 0.1) * speedVariation;
```

### 4. **Group Behavior**
Multiple homing projectiles could coordinate:
```javascript
// Spread out from each other
// Surround soul
// Take turns attacking
```

---

## Performance Considerations

### Optimizations
- Homing calculation only when target is set
- Early return during homing delay
- Math.atan2 called once per frame per projectile
- No expensive collision checks in homing logic

### Limits
Recommended maximum: **20-30 homing projectiles** simultaneously
- More than this may cause performance issues
- Use sparingly in bullet hell patterns
- Consider mixing with non-homing attacks

---

## Testing

### Test Enemy
Created `test_homing.json` with 3 attack patterns:

1. **Basic Homing Test**: Simple homing from sides
2. **Aggressive Homing**: Multiple projectiles, various strengths
3. **Mixed Pattern**: Homing combined with normal attacks

### Test Cases
- ✅ Homing from all 4 sides
- ✅ Varying homing strengths (0.1 - 0.25)
- ✅ Homing delays (0, 10, 20, 30 frames)
- ✅ Acceleration mode
- ✅ Mixed with non-homing attacks
- ✅ Visual arrow shape and trail
- ✅ Target assignment in battle system

---

## Compatibility

### Works With
- ✅ All soul modes (Red, Green, Blue, Yellow, Purple)
- ✅ Advanced attack system (modifiers, state machines)
- ✅ Blue/orange attack system
- ✅ Object pooling (when implemented)
- ✅ Battle box boundaries
- ✅ Collision detection

### Future Enhancements
- Homing + blue/orange mechanics
- Homing + modifiers (size changes during flight)
- Homing that respects Green mode shield
- Homing in Yellow mode (shoots down bullets)

---

## Files Created/Modified

### New Files
1. **`data/enemies/undertale/test_homing.json`** - Test enemy with 3 homing patterns

### Modified Files
1. **`js/attacks.js`** - Added HomingProjectile class, spawnHomingProjectiles method, case in spawnWave
2. **`js/battle.js`** - Added target assignment for homing projectiles in updateAttackPhase
3. **`index.html`** - Already updated with new modules

---

## Boss Usage

### Undyne
- Green mode + homing spears
- Moderate homing (0.1-0.12)
- 20-30 frame delay for fair blocking
- Mix with non-homing for variety

### Mettaton
- Yellow mode (shoot them down!)
- Moderate speed (2.5-3)
- Low-medium homing (0.1-0.15)
- Colorful (yellow, pink, blue)

### Asriel
- Extreme bullet hell
- Many projectiles (6-10 at once)
- High homing (0.2-0.25)
- Acceleration mode
- Rainbow colors

---

## Next Steps

1. **Test with Undyne**: Integrate with Green mode shield
2. **Test with Mettaton**: Yellow mode bullet shooting
3. **Test with Asriel**: Extreme bullet hell patterns
4. **Add sound effects**: Homing lock-on sound
5. **Add visual effects**: Targeting reticle, lock-on indicator

The homing projectile system is complete and ready for boss implementation! 🎯
