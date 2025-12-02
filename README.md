# Under Delta Tale - Rune Fight Simulator

A web-based Undertale/Deltarune fight simulator built with vanilla JavaScript, HTML Canvas, and modular architecture.

## Features

✅ **SOUL Movement System** - Control the red heart with arrow keys or WASD  
✅ **Hit Detection** - Collision detection between SOUL and enemy attacks  
✅ **Multiple Attack Patterns** - Projectiles, bones, circles, and more  
✅ **JSON-Based Enemy System** - Easy to add new enemies and attack patterns  
✅ **Turn-Based Combat** - Fight, Act, Item, and Mercy options  
✅ **Dialogue System** - Text with typewriter effect  
✅ **HP System** - Visual HP bar with damage and healing  
✅ **Animation Framework** - Smooth animations and effects  
✅ **Sound Support** - Audio manager for music and sound effects  
✅ **Modular Architecture** - Clean, organized, well-commented code  

## Project Structure

```
├── index.html              # Main HTML file
├── css/
│   └── styles.css         # All styling
├── js/
│   ├── main.js            # Entry point and game loop
│   ├── config.js          # Game configuration
│   ├── utils.js           # Utility functions
│   ├── audio.js           # Audio manager
│   ├── soul.js            # Player heart movement
│   ├── collision.js       # Collision detection
│   ├── attacks.js         # Attack patterns and objects
│   ├── enemy.js           # Enemy class
│   ├── ui.js              # UI management
│   └── battle.js          # Battle system
├── data/
│   └── enemies/
│       └── test_enemy.json # Sample enemy definition
└── sounds/                 # Audio files (optional)
```

## How to Run

1. Clone this repository
2. Open `index.html` in a modern web browser
3. No build step required - pure vanilla JavaScript!

For local development with live reload, you can use any static server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000`

## Controls

- **Arrow Keys** or **WASD** - Move the SOUL (red heart)
- **Mouse/Click** - Select actions and menu options
- **Dodge attacks** during enemy turns to avoid damage

## Turn Flow

1. **Menu Phase** - Choose an action:
   - **FIGHT** - Attack the enemy
   - **ACT** - Interact with the enemy (Check, Talk, etc.)
   - **ITEM** - Use items (healing, buffs, etc.)
   - **MERCY** - Spare or flee from battle

2. **Enemy Attack Phase** - Dodge incoming attacks by moving your SOUL

3. Return to Menu Phase and repeat

## Creating Custom Enemies

Enemies are defined in JSON format. Create a new file in `data/enemies/`:

```json
{
    "name": "Your Enemy",
    "hp": 50,
    "attack": 8,
    "defense": 2,
    "dialogue": [
        "* Enemy dialogue line 1",
        "* Enemy dialogue line 2"
    ],
    "checkText": "Enemy description",
    "acts": [
        {
            "name": "Check",
            "effect": "check"
        }
    ],
    "attackPatterns": [
        {
            "name": "Pattern Name",
            "duration": 5000,
            "waves": [
                {
                    "time": 0,
                    "type": "projectiles",
                    "count": 5,
                    "speed": 3,
                    "side": "top"
                }
            ]
        }
    ]
}
```

### Attack Types

**Projectiles:**
```json
{
    "time": 0,
    "type": "projectiles",
    "count": 5,
    "speed": 2,
    "size": 20,
    "side": "top"  // top, bottom, left, right
}
```

**Bones:**
```json
{
    "time": 1000,
    "type": "bones",
    "count": 3,
    "speed": 3,
    "orientation": "horizontal"  // horizontal or vertical
}
```

**Circle Waves:**
```json
{
    "time": 2000,
    "type": "circle",
    "startRadius": 10,
    "endRadius": 150,
    "duration": 60
}
```

## Extending the System

### Adding New Attack Types

1. Create a new class extending `AttackObject` in `js/attacks.js`
2. Implement `update()`, `draw()`, and `getBounds()` methods
3. Add spawning logic in `AttackPattern.spawnWave()`

### Adding Sound Effects

1. Place audio files in the `sounds/` directory
2. Load sounds in `js/audio.js`:
```javascript
audioManager.loadSound('soundName', 'sounds/file.wav');
```
3. Play sounds with:
```javascript
audioManager.playSound('soundName');
```

### Customizing Appearance

Edit `css/styles.css` to change:
- Colors and styling
- UI layout
- Button appearance
- Fonts and text

Edit `js/config.js` to change:
- Battle box size and position
- SOUL speed and size
- HP values
- Animation speeds
- Colors

## Code Architecture

### Module Overview

- **config.js** - Central configuration (constants, colors, sizes)
- **utils.js** - Helper functions (collision, math, input handling)
- **audio.js** - Audio system (sound effects and music)
- **soul.js** - Player SOUL movement and rendering
- **collision.js** - Collision detection between SOUL and attacks
- **attacks.js** - Attack objects and pattern system
- **enemy.js** - Enemy class with stats, dialogue, and attacks
- **ui.js** - UI manager (dialogue, buttons, HP bar)
- **battle.js** - Main battle controller (coordinates everything)
- **main.js** - Game loop and initialization

### Key Design Patterns

- **Module Pattern** - Each file is a self-contained ES6 module
- **Singleton Pattern** - Global managers (audio, UI, collision)
- **Factory Pattern** - Attack object creation
- **Observer Pattern** - Collision callbacks
- **State Pattern** - Battle phases (menu, attack, player turn)

## Browser Compatibility

Requires a modern browser with support for:
- ES6 Modules
- Canvas 2D API
- CSS Grid
- HTML5 Audio (optional)

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This is a fan project inspired by Undertale and Deltarune. Not affiliated with Toby Fox.

## Credits

Created as a learning project demonstrating:
- Game development with vanilla JavaScript
- Canvas-based rendering
- Modular architecture
- Turn-based combat systems