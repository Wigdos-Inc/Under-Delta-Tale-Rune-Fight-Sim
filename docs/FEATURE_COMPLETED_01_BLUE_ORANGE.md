# Blue/Orange Attack System - Implementation Summary

**Status:** ✅ COMPLETED  
**Date:** December 2, 2025

---

## What Was Implemented

### 1. Soul Movement Tracking
**File:** `js/soul.js`
- Added `isMoving` boolean property to track player movement
- Added `lastX` and `lastY` properties for position tracking
- Implemented `getIsMoving()` method to query movement state
- Movement state updates every frame based on input

### 2. New Attack Classes
**File:** `js/attacks.js`

#### BlueBone
- Extends `Bone` class
- Blue colored (#00a2e8)
- Only damages player if they are **moving**
- Has `shouldDamage(soul)` method that checks movement state

#### OrangeBone
- Extends `Bone` class  
- Orange colored (#ff7f27)
- Only damages player if they are **standing still**
- Has `shouldDamage(soul)` method that checks movement state

#### BlueProjectile
- Extends `Projectile` class
- Blue colored (#00a2e8)
- Only damages player if they are **moving**
- Has `shouldDamage(soul)` method that checks movement state

#### OrangeProjectile
- Extends `Projectile` class
- Orange colored (#ff7f27)
- Only damages player if they are **standing still**
- Has `shouldDamage(soul)` method that checks movement state

### 3. Enhanced Collision Detection
**File:** `js/collision.js`
- Modified `checkCollisions()` method to respect blue/orange mechanics
- Checks if attack object has `shouldDamage()` method
- Skips collision if attack shouldn't damage based on player movement

### 4. Attack Pattern Spawning
**File:** `js/attacks.js` - `AttackPattern` class

Added new wave types to `spawnWave()`:
- `blue_bones` - Spawns blue bones
- `orange_bones` - Spawns orange bones
- `blue_projectiles` - Spawns blue projectiles
- `orange_projectiles` - Spawns orange projectiles

Added spawn methods:
- `spawnBlueBones()` - Creates blue bone attacks
- `spawnOrangeBones()` - Creates orange bone attacks
- `spawnBlueProjectiles()` - Creates blue projectile attacks
- `spawnOrangeProjectiles()` - Creates orange projectile attacks

---

## Test Enemies Created

### 1. Doggo (Blue Attacks)
**File:** `data/enemies/undertale/doggo.json`
- HP: 70, ATK: 8, DEF: 2
- 3 attack patterns featuring blue bones and blue projectiles
- Must stand still to avoid all attacks
- Acts: Pet, Walk Around

### 2. Vulkin (Orange Attacks)
**File:** `data/enemies/undertale/vulkin.json`
- HP: 42, ATK: 5, DEF: 0
- 3 attack patterns mixing orange and normal attacks
- Must move through orange attacks
- Acts: Encourage, Compliment

---

## How to Use in Enemy JSON

### Blue Attacks (Stand Still to Avoid)
```json
{
    "time": 0,
    "type": "blue_bones",
    "count": 2,
    "speed": 4,
    "orientation": "horizontal"
}
```

```json
{
    "time": 0,
    "type": "blue_projectiles",
    "count": 3,
    "speed": 2.5,
    "size": 20,
    "side": "left"
}
```

### Orange Attacks (Must Move Through)
```json
{
    "time": 0,
    "type": "orange_bones",
    "count": 2,
    "speed": 3,
    "orientation": "vertical"
}
```

```json
{
    "time": 0,
    "type": "orange_projectiles",
    "count": 4,
    "speed": 2,
    "size": 18,
    "side": "top"
}
```

---

## Enemies That Can Now Be Implemented

With this system, the following enemies can now have their signature attacks:

1. ✅ **Doggo** - Blue sword slashes
2. ✅ **Vulkin** - Orange flames
3. **Dogamy & Dogaressa** - Blue bark attacks
4. **Papyrus** - Mixed blue and normal bones
5. **Sans** - Blue bones with gravity
6. **Royal Guards** - Blue/orange spear combinations
7. **Gyftrot** - Blue present boxes

---

## Technical Details

### Movement Detection Logic
```javascript
// In soul.js update()
this.isMoving = (dx !== 0 || dy !== 0);
```

### Damage Check Logic
```javascript
// Blue attacks (must stand still)
shouldDamage(soul) {
    return soul.getIsMoving(); // Damage only if moving
}

// Orange attacks (must move through)
shouldDamage(soul) {
    return !soul.getIsMoving(); // Damage only if still
}
```

### Collision Detection
```javascript
// In collision.js
if (obj.shouldDamage && !obj.shouldDamage(soul)) {
    continue; // Skip collision if shouldn't damage
}
```

---

## Color Codes
- **Blue:** `#00a2e8` (RGB: 0, 162, 232)
- **Orange:** `#ff7f27` (RGB: 255, 127, 39)

---

## Next Steps

With blue/orange attacks complete, recommended next implementations:
1. **Soul Color/Mode System** (TODO #2) - For green soul (Undyne), blue soul gravity (Papyrus)
2. **Homing Projectiles** (TODO #3) - For Final Froggit, Madjick
3. **Multi-Enemy Battles** (TODO #11) - For Dogamy & Dogaressa duo

---

## Testing

To test the blue/orange system:
1. Load Doggo enemy: `data/enemies/undertale/doggo.json`
2. During attacks, stand completely still - blue attacks pass through
3. During attacks, move - blue attacks will damage you

4. Load Vulkin enemy: `data/enemies/undertale/vulkin.json`
5. During orange attacks, keep moving - they pass through
6. During orange attacks, stand still - they damage you

---

**Implementation Complete!** ✨

This is a foundational mechanic used by 7+ enemies and is critical for Papyrus and Sans boss fights.
