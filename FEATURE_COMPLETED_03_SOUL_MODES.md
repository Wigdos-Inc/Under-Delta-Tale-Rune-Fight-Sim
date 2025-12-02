# Soul Color/Mode System - Feature Documentation

## Overview
TODO #3: Soul Color/Mode System
**Status**: ✅ COMPLETED

Implemented 5 distinct soul colors/modes that change the player's movement mechanics and controls, matching Undertale's boss-specific gameplay variations.

## Soul Modes Implemented

### 1. RED MODE (Default)
**Used by**: Most enemies, normal battles
**Color**: `#ff0000` (Red)

**Mechanics**:
- Standard 4-directional movement
- Full freedom within battle box
- Arrow keys/WASD for movement
- Diagonal movement normalized

**When to use**: Default mode for all non-boss battles and most encounters.

---

### 2. GREEN MODE (Shield Mode)
**Used by**: Undyne
**Color**: `#00ff00` (Green)

**Mechanics**:
- Soul is **locked in the center** of the battle box
- Cannot move position, only rotate shield
- Arrow keys control shield direction (up, down, left, right)
- Shield **blocks attacks** coming from its direction
- Attacks from other directions still deal damage

**Shield Properties**:
- Size: 30px
- Offset from soul: 20px
- Block angle: ~60° cone in front of shield
- Visual feedback: Pulsing animation

**Collision Detection**:
```javascript
const greenMode = soul.getModeInstance(SoulMode.GREEN);
if (greenMode.canBlockAttack(attackObject)) {
    // Attack is blocked, no damage
}
```

**Example Enemy**: `data/enemies/undertale/bosses/undyne.json`

---

### 3. BLUE MODE (Gravity Mode)
**Used by**: Papyrus, Sans
**Color**: `#00a2e8` (Blue)

**Mechanics**:
- Soul has **gravity** and falls to the ground
- Can **jump** with arrow up, Z, or X keys
- Horizontal movement only (left/right)
- Ground at bottom of battle box

**Physics**:
- Gravity: 0.5 pixels/frame²
- Jump power: -8 pixels/frame
- Max fall speed: 10 pixels/frame
- Jump buffering: 5 frames (input remembered)
- Coyote time: 5 frames (can jump shortly after leaving ground)

**Visual Feedback**:
- Ground line appears when soul touches bottom
- Line color matches soul mode

**Example Enemy**: `data/enemies/undertale/bosses/papyrus.json`

---

### 4. YELLOW MODE (Gun Mode)
**Used by**: Mettaton
**Color**: `#ffff00` (Yellow)

**Mechanics**:
- Normal 4-directional movement
- Can **shoot bullets** with Z or X keys
- Aim direction follows last movement direction
- Bullets fly in straight lines

**Bullet Properties**:
- Speed: 8 pixels/frame
- Size: 6px
- Fire rate: 10 frames between shots (6 bullets/second)
- Automatic cleanup when out of bounds

**Aim Indicator**:
- Shows current shooting direction
- 20px line extending from soul
- Semi-transparent yellow

**Usage**:
```javascript
const yellowMode = soul.getModeInstance(SoulMode.YELLOW);
const bullets = yellowMode.getBullets();
// Check bullet-enemy collisions
bullets.forEach(bullet => {
    if (hitEnemy(bullet)) {
        yellowMode.removeBullet(bullet);
        damageEnemy();
    }
});
```

**When to implement**: TODO #23 (Mettaton boss mechanics)

---

### 5. PURPLE MODE (Web/Platform Mode)
**Used by**: Muffet
**Color**: `#ff00ff` (Purple/Magenta)

**Mechanics**:
- Soul can only move **along predefined lines**
- Lines represent spider webs or platforms
- Left/Right to move along current line
- Up/Down to switch between lines
- Position clamped to line endpoints

**Line System**:
```javascript
const purpleMode = soul.getModeInstance(SoulMode.PURPLE);
purpleMode.setLines([
    { x1: 100, y1: 200, x2: 540, y2: 200 },
    { x1: 100, y1: 300, x2: 540, y2: 300 },
    { x1: 100, y1: 400, x2: 540, y2: 400 }
]);
```

**Visual Feedback**:
- All lines drawn semi-transparent
- Current line highlighted brighter
- Line color matches soul mode

**When to implement**: TODO #22 (Muffet boss mechanics)

---

## Architecture

### File Structure

**`js/soulModes.js`** (NEW - 600+ lines)
- `SoulMode` enum with 5 mode types
- `BaseSoulMode` abstract class
- 5 mode implementations (RedMode, GreenMode, BlueMode, YellowMode, PurpleMode)

**`js/soul.js`** (ENHANCED)
- Added mode system integration
- `setMode()`, `getMode()`, `getModeName()` methods
- Mode instances stored in `this.modes` object
- Update/draw delegates to current mode

### Class Hierarchy

```
BaseSoulMode (abstract)
├── RedMode (default 4-directional)
├── GreenMode (shield/blocking)
├── BlueMode (gravity/jumping)
├── YellowMode (shooting)
└── PurpleMode (line movement)
```

### Mode Lifecycle

1. **Initialization**: All modes created when Soul is instantiated
2. **Activation**: `soul.setMode(SoulMode.GREEN)`
   - Calls `currentMode.onExit()`
   - Calls `newMode.onEnter()`
   - Updates soul color
3. **Update**: Mode's `update()` called every frame
4. **Render**: Mode's `draw()` called after soul draw
5. **Deactivation**: When switching modes

---

## Enemy JSON Integration

Enemies can specify their required soul mode:

```json
{
  "name": "Undyne",
  "soulMode": "green",
  ...
}
```

**Valid values**:
- `"red"` - Normal mode (default if omitted)
- `"green"` - Shield mode
- `"blue"` - Gravity mode
- `"yellow"` - Gun mode
- `"purple"` - Platform mode

---

## Usage Examples

### Example 1: Switch to Green Mode (Undyne Fight)
```javascript
// At start of Undyne battle
soul.setMode(SoulMode.GREEN);

// In update loop, check shield blocking
const greenMode = soul.getMode();
if (greenMode.canBlockAttack(spear)) {
    // Block! No damage
    playBlockSound();
} else {
    // Hit! Take damage
    soul.makeInvincible();
    player.hp -= spear.damage;
}
```

### Example 2: Switch to Blue Mode (Papyrus Fight)
```javascript
// At start of Papyrus battle
soul.setMode(SoulMode.BLUE);

// Blue bones and normal bones both work
// Physics handled automatically by mode
```

### Example 3: Switch to Yellow Mode (Mettaton Fight)
```javascript
// At start of Mettaton battle
soul.setMode(SoulMode.YELLOW);

// In update loop, check bullet collisions
const yellowMode = soul.getMode();
yellowMode.getBullets().forEach(bullet => {
    if (checkCollision(bullet, enemy)) {
        yellowMode.removeBullet(bullet);
        enemy.takeDamage(10);
    }
});
```

### Example 4: Return to Normal Mode
```javascript
// After special boss fight ends
soul.setMode(SoulMode.RED);
```

---

## Mode-Specific Features

### Green Mode Shield Blocking

**How it works**:
1. Calculate angle from soul to attack
2. Calculate angle difference with shield direction
3. If difference < 60°, attack is blocked
4. No damage, visual/audio feedback

**Integration with collision system**:
```javascript
// In collision.js
if (soulMode === 'green') {
    const greenMode = soul.getModeInstance(SoulMode.GREEN);
    if (greenMode.canBlockAttack(attack)) {
        continue; // Skip this collision
    }
}
```

### Blue Mode Jump Mechanics

**Features**:
- **Jump buffering**: Press jump slightly before landing, still jumps
- **Coyote time**: Can jump for 5 frames after leaving ground
- **Variable jump**: Hold jump longer for higher jumps (can be implemented)

**Ground detection**: Bottom of battle box is ground level

### Yellow Mode Shooting

**Features**:
- Aim follows last movement direction
- Fire rate limit prevents spam
- Bullets auto-cleanup when out of bounds
- Visual aim indicator

**Bullet collision**: Must be implemented in enemy class to handle damage

### Purple Mode Line Movement

**Features**:
- Configurable line positions
- Smooth movement along lines
- Line switching with up/down
- Position clamping to endpoints

**Dynamic lines**: Lines can change mid-battle for platforming challenges

---

## Testing

### Test Cases

1. **Red Mode**: Default movement, diagonal normalization
2. **Green Mode**: Shield rotation, attack blocking, locked position
3. **Blue Mode**: Gravity, jumping, ground collision, jump buffering
4. **Yellow Mode**: Shooting, aim direction, fire rate, bullet cleanup
5. **Purple Mode**: Line movement, line switching, boundary clamping
6. **Mode Switching**: Color changes, onEnter/onExit callbacks

### Test Enemies Created

1. **`undyne.json`**: Green mode with spear patterns
2. **`papyrus.json`**: Blue mode with bone patterns and jump challenges

---

## Benefits

### 1. **Boss Variety**
- Each boss fight feels unique
- Different strategies required
- Matches canonical Undertale gameplay

### 2. **Modularity**
- Easy to add new modes
- Each mode self-contained
- Clean separation of concerns

### 3. **Extensibility**
- Mode-specific features easy to add
- Custom callbacks for mode events
- Visual effects per mode

### 4. **Compatibility**
- Works with existing attack system
- Compatible with blue/orange attacks
- Integrates with collision detection

---

## Implementation Notes

### Performance
- All modes pre-instantiated (no runtime allocation)
- Mode switch is instant (just pointer change)
- Update/draw delegated efficiently

### Backward Compatibility
- Default Red mode matches original behavior
- Enemies without `soulMode` field use Red
- Existing attacks work unchanged

### Future Enhancements
- **Variable jump height** (hold jump longer = higher)
- **Shield durability** (shield breaks after X blocks)
- **Yellow mode upgrades** (rapid fire, spread shot)
- **Purple mode gravity** (combine blue and purple)
- **Custom mode colors** (per-enemy customization)

---

## Files Created/Modified

### New Files
1. **`js/soulModes.js`** - 600+ lines, 5 mode classes, complete implementation

### Modified Files
1. **`js/soul.js`** - Added mode system, enhanced update/draw methods

### New Enemy Data
1. **`data/enemies/undertale/bosses/undyne.json`** - Green mode example
2. **`data/enemies/undertale/bosses/papyrus.json`** - Blue mode example

---

## Integration with Other TODOs

### Depends On
- ✅ TODO #1: Blue/Orange Attacks (compatible)
- ✅ TODO #2: Advanced Attack System (compatible)

### Enables
- TODO #20: Boss-Specific Mechanic: Papyrus (Blue mode)
- TODO #21: Boss-Specific Mechanic: Undyne (Green mode)
- TODO #22: Boss-Specific Mechanic: Muffet (Purple mode)
- TODO #23: Boss-Specific Mechanic: Mettaton (Yellow mode)
- TODO #26: Boss-Specific Mechanic: Sans (Blue mode advanced)

---

## Next Steps

1. **Test with Undyne**: Implement full Undyne fight with spear blocking
2. **Test with Papyrus**: Implement jumping bone patterns
3. **Yellow Mode Enemy Collision**: Add bullet-enemy damage system
4. **Purple Mode Lines**: Create Muffet web platform patterns
5. **Mode Transitions**: Add smooth animations when switching modes

The soul mode system is now complete and ready for boss implementation! 🎉
