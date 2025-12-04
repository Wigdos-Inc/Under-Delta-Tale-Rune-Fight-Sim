# Undertale/Deltarune Fighting Simulator

A browser-based fighting simulator that recreates every battle from Undertale and Deltarune with 1:1 accuracy. Fight against all 115+ enemies using authentic sprites and mechanics.

## Features

### Current Implementation
- ✅ **Full Battle System**: Turn-based battles with 640x480 Undertale-style resolution
- ✅ **Soul Mechanics**: Red (free movement), Blue (gravity), Green (directional), Purple (line movement)
- ✅ **Projectile System**: Optimized pool of 150+ projectiles with collision detection
- ✅ **Colored Bullets**: Normal, Blue (stand still), Orange (keep moving), Green (healing)
- ✅ **Authentication**: Optional login system with guest mode (localStorage) or MySQL persistence
- ✅ **Progress Tracking**: Personal bests, defeat history, and public leaderboards
- ✅ **5 Tutorial Enemies**: Froggit, Whimsun, Loox, Migosp, Moldsmal

### Planned
- ⏳ **56 More Undertale Enemies**: All documented in `fight info`, ready to implement
- ⏳ **54 Deltarune Enemies**: Sprites available, needs documentation and implementation
- ⏳ **Mobile Touch Controls**: Touch-based soul movement and button interactions
- ⏳ **Multiplayer Architecture**: WebSocket-based system (designed but not implemented)

## Tech Stack

**Frontend:**
- HTML5 Canvas (640x480px native resolution)
- Vanilla JavaScript (no frameworks)
- CSS with responsive design
- Authentic game sprites from `data/assets/`

**Backend:**
- Node.js with Express.js
- MySQL (hosted on filess.io)
- JWT authentication with httpOnly cookies
- bcrypt password hashing (12 rounds)
- Rate limiting (helmet, CORS)

## Project Structure

```
.
├── backend/
│   ├── server.js                 # Express server
│   ├── config/
│   │   └── database.js           # MySQL connection pool
│   ├── routes/
│   │   ├── auth.js              # Authentication endpoints
│   │   └── progress.js          # Progress tracking endpoints
│   ├── middleware/
│   │   └── auth.js              # JWT verification
│   └── database/
│       ├── schema.sql           # Database schema
│       └── init.js              # Schema initialization script
├── src/
│   ├── api/
│   │   └── ApiClient.js         # Frontend API client
│   ├── engine/
│   │   ├── BattleEngine.js      # Core battle system
│   │   └── SoulController.js    # Player soul movement
│   ├── projectiles/
│   │   ├── Projectile.js        # Projectile class
│   │   └── ProjectilePool.js    # Memory-efficient pooling
│   ├── enemies/
│   │   ├── Enemy.js             # Base enemy class
│   │   └── undertale/           # Undertale enemy implementations
│   │       ├── Froggit.js
│   │       ├── Whimsun.js
│   │       ├── Loox.js
│   │       ├── Migosp.js
│   │       └── Moldsmal.js
│   ├── ui/
│   │   └── UIRenderer.js        # UI rendering system
│   └── main.js                  # Application entry point
├── css/
│   └── main.css                 # Stylesheet
├── data/
│   └── assets/                  # Game sprites (Undertale + Deltarune)
├── index.html                   # Main game page
├── fight info                   # Enemy documentation (61 Undertale enemies)
└── start-servers.sh             # Startup script
```

## Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3 (for frontend HTTP server)
- MySQL database (credentials provided in `.env`)

### Installation

1. **Clone the repository:**
   ```bash
   cd /workspaces/Under-Delta-Tale-Rune-Fight-Sim
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Initialize database:**
   ```bash
   node database/init.js
   ```

4. **Configure environment:**
   - Backend uses `.env` file (already configured with filess.io credentials)
   - Database: `pd04u8.h.filess.io:3307`
   - No additional setup required

### Running the Application

**Option 1: Use startup script**
```bash
./start-servers.sh
```

**Option 2: Start servers manually**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
python3 -m http.server 8080
```

**Access the application:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000

## Usage

### Playing as Guest
1. Open http://localhost:8080
2. Click "Continue as Guest" in the auth modal
3. Select an enemy from the list
4. Use arrow keys or WASD to move the soul during attacks
5. Progress saved to localStorage

### Playing with Account
1. Click "Register" to create an account
2. Login with your credentials
3. Your progress syncs to MySQL database
4. View leaderboards and compare times with other players

### Battle Controls
- **Arrow Keys / WASD**: Move soul
- **Z / Space**: Confirm / Jump (in Blue soul mode)
- **FIGHT**: Attack enemy (damage system)
- **ACT**: Perform enemy-specific actions to enable sparing
- **ITEM**: Use items (placeholder for now)
- **MERCY**: Spare enemy when ready or flee battle

## Game Mechanics

### Soul Modes
- **Red Soul**: Free 4-directional movement (default)
- **Blue Soul**: Gravity-based with jumping (some enemies)
- **Green Soul**: Fixed position, change facing direction (some bosses)
- **Purple Soul**: Horizontal line movement (Muffet)

### Bullet Types
- **White**: Normal damage on contact
- **Blue**: Only damages if you're moving
- **Orange**: Only damages if you're standing still
- **Green**: Heals the player

### Battle Flow
1. **Menu Phase**: Choose FIGHT, ACT, ITEM, or MERCY
2. **Defend Phase**: Dodge enemy projectiles for 5 seconds
3. **Repeat**: Until enemy is defeated or spared

### Sparing System
Each enemy has unique ACT requirements:
- **Froggit**: Compliment
- **Whimsun**: Can spare immediately (very timid)
- **Loox**: Pick On or Don't Pick On at low HP
- **Migosp**: Encourage
- **Moldsmal**: Impress or Flirt

## Database Schema

### Tables
- **users**: User accounts (username, email, password_hash)
- **enemy_defeats**: All completed battles (enemy_name, time, damage)
- **personal_bests**: Best time per enemy per user
- **user_stats**: Aggregate statistics (total battles, wins, favorite enemy)

### API Endpoints

**Authentication:**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify` - Verify JWT token

**Progress:**
- `POST /api/progress/defeat` - Record battle completion
- `GET /api/progress/defeats` - Get defeat history
- `GET /api/progress/bests` - Get personal bests
- `GET /api/progress/leaderboard/:enemyName` - Get enemy leaderboard
- `GET /api/progress/stats` - Get user statistics

## Enemy Documentation

All 61 Undertale enemies are documented in the `fight info` file with:
- Location in game
- Attack patterns and behaviors
- ACT options and spare conditions
- Implementation notes
- Wiki source links

First 5 enemies implemented:
1. **Froggit** - Flies in downward arcs
2. **Whimsun** - Rotating butterfly rings
3. **Loox** - Bouncing orbs and wiggle trails
4. **Migosp** - Edge-spawned projectiles
5. **Moldsmal** - Zigzag drops and bomb pellets

## Development Roadmap

### Immediate Next Steps
1. **Implement remaining 56 Undertale enemies** using `fight info` documentation
2. **Document Deltarune enemies** (54 enemies, sprites available)
3. **Implement Deltarune battle system** (party mechanics, TP, grazing)
4. **Add mobile touch controls**

### Future Enhancements
- Sound effects and music (stubbed out for now)
- FIGHT mini-game (hitting the timing bar)
- Item system implementation
- Sprite animations
- Battle backgrounds
- WebSocket multiplayer mode

## Performance

- **Projectile Pooling**: 150 pre-allocated objects (no garbage collection during fights)
- **60 FPS Target**: Fixed timestep game loop
- **Efficient Collision**: AABB for rectangles, distance-based for circles
- **Canvas Optimization**: Minimal redraws, pixelated rendering

## Contributing

Enemy implementation follows this pattern:

```javascript
class EnemyName extends Enemy {
  constructor() {
    super({
      name: 'Enemy Name',
      game: 'undertale',
      hp: 50,
      attack: 6,
      defense: 0,
      encounterText: '* Enemy appeared!',
      checkText: 'ENEMY - ATK X DEF Y\\n* Description',
      dialogue: ['Line 1', 'Line 2'],
      acts: [/* ACT definitions */]
    });
  }
  
  startAttack(battleEngine) {
    super.startAttack(battleEngine);
    this.currentAttackPattern = (engine, time) => {
      // Spawn projectiles based on time
    };
  }
}
```

Refer to existing enemies in `src/enemies/undertale/` for examples.

## Credits

- **Sprites**: Extracted from Undertale (© Toby Fox) and Deltarune (© Toby Fox)
- **Enemy Data**: Undertale Wiki contributors
- **Database Hosting**: filess.io

## License

This is a fan project for educational purposes. Undertale and Deltarune are © Toby Fox.

---

**Current Status**: Core systems complete, 5 tutorial enemies playable, 110+ enemies pending implementation.
