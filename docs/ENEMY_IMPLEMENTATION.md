# Enemy Implementation Guide

This guide explains how to implement the remaining 56 Undertale enemies and 54 Deltarune enemies.

## Quick Start

Each enemy follows this template pattern:

```javascript
class EnemyName extends Enemy {
  constructor() {
    super({
      name: 'Enemy Name',
      game: 'undertale', // or 'deltarune'
      hp: 50,
      attack: 6,
      defense: 0,
      encounterText: '* Enemy appeared!',
      checkText: 'ENEMY - ATK X DEF Y\\n* Description',
      dialogue: ['Line 1', 'Line 2', 'Line 3'],
      lowHPDialogue: ['Low HP line 1', 'Low HP line 2'], // Optional
      acts: [
        {
          name: 'Check',
          handler: (enemy) => ({
            text: enemy.checkText,
            canSpare: false
          })
        },
        {
          name: 'Custom ACT',
          handler: (enemy) => {
            enemy.canSpare = true; // Enable sparing
            return {
              text: '* Result text',
              canSpare: true
            };
          }
        }
      ]
    });
    
    this.location = 'Area Name';
  }

  startAttack(battleEngine) {
    super.startAttack(battleEngine);
    
    this.currentAttackPattern = (engine, time) => {
      // Spawn projectiles based on time (in milliseconds)
      
      // Example: Spawn every 600ms
      if (Math.floor(time / 600) !== Math.floor((time - 16.67) / 600)) {
        this.spawnPattern(engine);
      }
    };
  }
  
  spawnPattern(engine) {
    // Create projectiles
    engine.spawnProjectile({
      x: 100,
      y: 100,
      width: 10,
      height: 10,
      velocityX: 2,
      velocityY: 2,
      color: 'white',
      type: 'normal', // normal, blue, orange, green
      shape: 'rect', // rect or circle
      damage: 1
    });
  }
}
```

## Attack Pattern Helpers

The `Enemy.js` file provides helper functions:

### Circular Pattern
```javascript
circularPattern(battleEngine, count, radius, speed, startAngle);

// Example: 8 projectiles in a circle
circularPattern(engine, 8, 50, 2, 0);
```

### Edge Pattern
```javascript
edgePattern(battleEngine, edge, count, speed);

// Example: 5 projectiles from top
edgePattern(engine, 'top', 5, 3);
// Edges: 'top', 'bottom', 'left', 'right'
```

### Random Scatter
```javascript
randomScatter(battleEngine, count, speed);

// Example: 10 random projectiles
randomScatter(engine, 10, 2);
```

## Common Patterns

### Timed Spawning
```javascript
// Every 500ms
if (Math.floor(time / 500) !== Math.floor((time - 16.67) / 500)) {
  this.spawnWave(engine);
}

// At specific times
if (Math.abs(time - 2000) < 50) { // At 2 seconds
  this.specialAttack(engine);
}

// Multiple times
if ([1000, 2500, 4000].some(t => Math.abs(time - t) < 50)) {
  this.spawn(engine);
}
```

### Bouncing Projectiles
```javascript
const projectile = engine.spawnProjectile({...});

if (projectile) {
  const originalUpdate = projectile.update.bind(projectile);
  projectile.update = function(deltaTime) {
    // Check for wall bounces
    if (this.x <= engine.boxX || this.x + this.width >= engine.boxX + engine.boxWidth) {
      this.velocityX *= -1;
    }
    
    // Check for floor/ceiling bounces
    if (this.y <= engine.boxY || this.y + this.height >= engine.boxY + engine.boxHeight) {
      this.velocityY *= -1;
    }
    
    originalUpdate(deltaTime);
  };
}
```

### Sine Wave Motion
```javascript
const projectile = engine.spawnProjectile({...});

if (projectile) {
  projectile.waveTime = 0;
  projectile.waveAmplitude = 20;
  projectile.baseY = projectile.y;
  
  const originalUpdate = projectile.update.bind(projectile);
  projectile.update = function(deltaTime) {
    this.waveTime += deltaTime * 0.1;
    this.y = this.baseY + Math.sin(this.waveTime) * this.waveAmplitude;
    originalUpdate(deltaTime);
  };
}
```

### Homing Projectiles
```javascript
const projectile = engine.spawnProjectile({...});

if (projectile) {
  projectile.homingDelay = 500; // Start homing after 500ms
  projectile.homingTime = 0;
  
  const originalUpdate = projectile.update.bind(projectile);
  projectile.update = function(deltaTime) {
    this.homingTime += deltaTime * 16.67;
    
    if (this.homingTime >= this.homingDelay) {
      // Calculate direction to soul
      const dx = engine.soul.x - this.x;
      const dy = engine.soul.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Turn toward soul
      const turnSpeed = 0.05;
      this.velocityX += (dx / distance) * turnSpeed;
      this.velocityY += (dy / distance) * turnSpeed;
      
      // Limit speed
      const speed = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2);
      const maxSpeed = 3;
      if (speed > maxSpeed) {
        this.velocityX = (this.velocityX / speed) * maxSpeed;
        this.velocityY = (this.velocityY / speed) * maxSpeed;
      }
    }
    
    originalUpdate(deltaTime);
  };
}
```

### Exploding Projectiles
```javascript
const projectile = engine.spawnProjectile({
  color: 'yellow',
  damage: 3,
  ...
});

if (projectile) {
  projectile.explodeY = engine.boxY + 60; // Explode at Y position
  projectile.hasExploded = false;
  
  const originalUpdate = projectile.update.bind(projectile);
  projectile.update = function(deltaTime) {
    if (!this.hasExploded && this.y >= this.explodeY) {
      this.hasExploded = true;
      this.active = false; // Deactivate parent
      
      // Spawn burst
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i / 8);
        engine.spawnProjectile({
          x: this.x,
          y: this.y,
          width: 6,
          height: 6,
          velocityX: Math.cos(angle) * 2,
          velocityY: Math.sin(angle) * 2,
          color: 'white',
          type: 'normal',
          shape: 'circle'
        });
      }
    }
    originalUpdate(deltaTime);
  };
}
```

## Implementation Checklist

For each enemy:

1. ✅ Create `src/enemies/undertale/EnemyName.js` (or `deltarune/`)
2. ✅ Copy template and fill in stats from `fight info`
3. ✅ Implement attack patterns based on wiki descriptions
4. ✅ Add ACT handlers with correct spare conditions
5. ✅ Set dialogue arrays
6. ✅ Test in battle
7. ✅ Add script tag to `index.html`
8. ✅ Add to enemy array in `main.js`

## Battle Engine Access

Inside attack patterns, you have access to:

```javascript
// Battle box dimensions
engine.boxX, engine.boxY
engine.boxWidth, engine.boxHeight

// Soul position
engine.soul.x, engine.soul.y
engine.soul.width, engine.soul.height

// Spawn projectiles
engine.spawnProjectile({...})

// Current time in milliseconds
time
```

## ACT Handler Patterns

### Simple Spare
```javascript
{
  name: 'Action',
  handler: (enemy) => {
    enemy.canSpare = true;
    return {
      text: '* You do something. Enemy can be spared!',
      canSpare: true
    };
  }
}
```

### Conditional Spare (Low HP)
```javascript
{
  name: 'Action',
  handler: (enemy) => {
    if (enemy.hp < enemy.maxHP * 0.3) {
      enemy.canSpare = true;
      return {
        text: '* Enemy is weak enough to spare!',
        canSpare: true
      };
    }
    return {
      text: '* Nothing happened.',
      canSpare: false
    };
  }
}
```

### Multi-Step Spare
```javascript
constructor() {
  super({...});
  this.actSteps = 0;
}

acts: [
  {
    name: 'Step Action',
    handler: (enemy) => {
      enemy.actSteps++;
      if (enemy.actSteps >= 3) {
        enemy.canSpare = true;
        return {
          text: '* You completed all steps!',
          canSpare: true
        };
      }
      return {
        text: `* Step ${enemy.actSteps} of 3 complete.`,
        canSpare: false
      };
    }
  }
]
```

## Boss-Specific Mechanics

### Multi-Phase Attacks
```javascript
constructor() {
  super({...});
  this.phase = 1;
}

startAttack(battleEngine) {
  super.startAttack(battleEngine);
  
  this.currentAttackPattern = (engine, time) => {
    if (this.phase === 1) {
      // Phase 1 attacks
      if (time > 5000) this.phase = 2;
    } else if (this.phase === 2) {
      // Phase 2 attacks (harder)
    }
  };
}
```

### Soul Mode Changes
```javascript
startAttack(battleEngine) {
  super.startAttack(battleEngine);
  
  // Change to blue soul mode (gravity)
  battleEngine.soul.setMode('blue');
  
  this.currentAttackPattern = (engine, time) => {
    // Blue soul attacks
  };
}
```

## Testing Tips

1. **Low HP**: Set `hp: 1` to test spare conditions quickly
2. **Slow Attacks**: Multiply spawn timers by 2-3x to debug patterns
3. **Visible Boundaries**: All projectiles render automatically
4. **Console Logging**: Use `console.log(time)` to verify timing
5. **Pool Monitor**: `engine.projectilePool.getActiveCount()` shows projectile count

## Next Enemies to Implement

Priority order based on complexity:

### Easy (Similar to tutorial enemies):
- Vegetoid
- Parsnik
- Snowdrake
- Ice Cap
- Dummy

### Medium (New mechanics):
- Doggo (blue bullets only)
- Dogamy & Dogaressa (duo)
- Papyrus (blue/orange attacks)
- Mettaton (various forms)

### Hard (Complex patterns):
- Sans (multiple phases, special mechanics)
- Undyne (green soul mode)
- Asgore (multi-phase boss)
- Asriel Dreemurr (extreme bullet hell)

## File Naming Convention

```
src/enemies/undertale/EnemyName.js
src/enemies/deltarune/EnemyName.js
```

Use PascalCase for filenames matching class names.

## Adding to the Game

After creating enemy file:

1. Add script tag to `index.html`:
```html
<script src="src/enemies/undertale/Papyrus.js"></script>
```

2. Add to enemy array in `main.js`:
```javascript
enemies.undertale = [
  new Froggit(),
  new Whimsun(),
  new Loox(),
  new Migosp(),
  new Moldsmal(),
  new Papyrus(), // New enemy
];
```

3. Test by selecting from menu and starting battle

## Reference

- **fight info**: Complete Undertale enemy documentation
- **Existing enemies**: `src/enemies/undertale/` for working examples
- **Wiki sources**: Each enemy in `fight info` has link to detailed wiki page

---

Ready to implement! Start with simple enemies and work up to complex bosses.
