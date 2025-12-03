# Undertale Fight Simulator - Complete Implementation Plan

**Created:** December 2, 2025  
**Goal:** Implement all 61 Undertale enemies with full feature support

---

## 📋 MASTER FEATURE CHECKLIST

### PHASE 1: CORE COMBAT MECHANICS (Priority: CRITICAL)

- [ ] **1. Blue/Orange Attack System** - Must stand still (blue) or move through (orange) attacks
  - Files to modify: `attacks.js`, `collision.js`, `soul.js`
  - New classes: `BlueProjectile`, `OrangeProjectile`, `BlueBone`
  - Track player movement state in Soul class

- [ ] **2. Soul Color/Mode System** - Different movement modes for different battles
  - Files to modify: `soul.js`, `battle.js`
  - Modes: Red (free), Green (face direction), Blue (gravity), Yellow (shoot), Purple (rope)
  - Add mode switching and mode-specific controls

- [ ] **3-7. Enhanced Projectile Types**
  - [ ] Homing projectiles (Final Froggit, Madjick)
  - [ ] Bouncing projectiles (Loox)
  - [ ] Exploding projectiles (Moldsmal, Glyde)
  - [ ] Arc/parabolic trajectories (Froggit flies)
  - [ ] Wave/sine patterns (Ice Cap, Woshua)
  - Files to modify: `attacks.js`

- [ ] **8-10. Special Attack Patterns**
  - [ ] Rotating beam attacks (Astigmatism)
  - [ ] Wall with gap patterns (Papyrus, Sans)
  - [ ] Gaster Blaster system (Sans, Asriel)
  - Files to modify: `attacks.js`

- [ ] **11. Multi-Enemy Battle System**
  - Files to modify: `battle.js`, `enemy.js`, `ui.js`
  - Support 2-3 enemies simultaneously
  - Individual targeting and group ACTs

- [ ] **12. Green/Healing Projectile System**
  - Files to modify: `attacks.js`, `collision.js`
  - Projectiles that heal instead of damage (Vegetoid, Vulkin)

---

### PHASE 2: ADVANCED COMBAT FEATURES (Priority: HIGH)

- [ ] **13. Advanced ACT State Tracking**
  - Files to modify: `enemy.js`
  - Pet counters, decoration lists, multi-step sequences

- [ ] **14. Item-Based ACT Mechanics**
  - Files to modify: `battle.js`, `enemy.js`
  - Check inventory for special items (Stick, Spider Donut, etc.)

- [ ] **15. KR (Karmic Retribution) System**
  - Files to modify: `battle.js`, `collision.js`
  - Damage over time with purple visual effect (Sans only)

- [ ] **16. Status Effects System**
  - Files to modify: `soul.js`, `battle.js`
  - Sleep, paralysis, slow effects

- [ ] **17. Multi-Phase Boss System**
  - Files to modify: `enemy.js`, `battle.js`
  - Phase transitions based on HP thresholds

- [ ] **18. Amalgamate Multi-Component System**
  - Files to modify: `enemy.js`
  - Separate parts with individual ACT requirements

---

### PHASE 3: BOSS-SPECIFIC MECHANICS (Priority: HIGH)

- [ ] **19. Sans Special Mechanics**
  - Dodge mechanic (avoids first attack)
  - Menu bone attacks
  - Soul slam/gravity manipulation
  - Continuous attacking
  - Sleep spare condition

- [ ] **20. Mettaton EX Rating System**
  - Ratings counter (0-10000+)
  - Essay/text input minigame
  - Yellow text collision
  - Rating-based victory

- [ ] **21. Muffet Pet Spider System**
  - Secondary actor (pet cupcake)
  - Telegram timer for auto-spare
  - Item check system

- [ ] **22. Toriel Low-HP Avoidance AI**
  - Attack patterns that intentionally miss
  - Spare counter system

- [ ] **23. Photoshop Flowey Soul Phases**
  - 6 soul phases with unique patterns
  - Soul capture mechanics
  - Scripted death/reload

- [ ] **24. Asriel SAVE Mechanic**
  - SAVE action instead of spare
  - Lost Souls encounter system

---

### PHASE 4: ROUTE & SPECIAL SYSTEMS (Priority: MEDIUM)

- [ ] **25. Route/Progression Tracking**
  - Files to modify: `battle.js`, `enemy.js`
  - Neutral, Pacifist, Genocide detection
  - Kill counter, enemy variants

- [ ] **26. Enhanced Collision Detection**
  - Files to modify: `collision.js`
  - Circle, beam, ring, rotated rectangle collision

- [ ] **27-31. Additional Projectile Types**
  - [ ] Text/symbol projectiles (Amalgamates)
  - [ ] Barrier obstacles (Reaper Bird)
  - [ ] Sweep attacks (Royal Guards)
  - [ ] Falling objects (Moldbygg)
  - [ ] Orbital projectiles (Whimsun)

- [ ] **32-34. Polish & Systems**
  - [ ] Telegraphing/warning system
  - [ ] Battle box size changes
  - [ ] Cutscene/scripting system

---

### PHASE 5: ENEMY-SPECIFIC MECHANICS (Priority: MEDIUM)

- [ ] **35. Jerry Modifier Mechanics**
- [ ] **36. Greater Dog Pose System**
- [ ] **37. Gyftrot Decoration System**
- [ ] **38. Napstablook Special Fight End**
- [ ] **39. Migosp Merge Mechanics**
- [ ] **40. Partner-Loss Behavior System**
- [ ] **41. Screen Shake Effects**
- [ ] **42. Glitch Visual Effects**
- [ ] **43. Enemy Transformation System**
- [ ] **44. Coordinated Attack Synchronization**
- [ ] **45. Item Inventory System**

---

### PHASE 6: CONTENT CREATION (Priority: MEDIUM)

- [ ] **46. Create All 61 Enemy JSON Files**
  - Generate complete attack patterns
  - Add all dialogue lines
  - Configure ACT behaviors
  - Set HP, attack, defense values

- [ ] **47. Performance Optimizations**
  - Enhanced object pooling
  - Spatial partitioning
  - Particle system optimization

---

### PHASE 7: UI REVAMP (Priority: HIGH - VISUAL POLISH)

**Goal:** Replace current HTML/CSS UI with authentic Undertale sprite-based UI

- [ ] **48. Sprite-Based UI System**
  - Location: `js/uiRenderer.js` (enhance existing)
  - Load UI sprites from `data/assets/Undertale Sprites/Battle/UI/`
  - Create sprite atlas/loader for UI elements

- [ ] **49. Recreate Fight Box UI**
  - Use authentic battle box border sprites
  - Match exact Undertale dimensions and styling
  - Add proper inner/outer border rendering

- [ ] **50. Authentic Button Sprites**
  - Replace HTML buttons with sprite-based FIGHT/ACT/ITEM/MERCY
  - Implement soul cursor for button selection
  - Add hover/selection animations

- [ ] **51. Authentic HP Bar**
  - Use Undertale HP bar sprites
  - Proper "HP" text rendering with Determination font
  - Yellow fill bar with name display (e.g., "Chara")

- [ ] **52. Authentic Dialogue Box**
  - Border sprites from game assets
  - Typewriter text with asterisk bullet points
  - Proper text wrapping and spacing

- [ ] **53. Determination Font Implementation**
  - Load Determination Mono/Sans font
  - Apply to all in-game text
  - Pixel-perfect text rendering

---

## 📁 FILE STRUCTURE FOR NEW FEATURES

```
js/
  ├── attacks.js          # Add all new projectile types here
  ├── collision.js        # Enhanced collision detection
  ├── soul.js             # Soul modes, status effects
  ├── battle.js           # Multi-enemy, phases, boss mechanics
  ├── enemy.js            # ACT states, components, transformations
  ├── ui.js               # Enhanced UI management
  ├── uiRenderer.js       # Sprite-based UI rendering
  ├── soulModes.js        # NEW: Soul mode implementations
  ├── statusEffects.js    # NEW: Status effect system
  ├── bossSpecial.js      # NEW: Boss-specific mechanics
  ├── routeManager.js     # NEW: Route/progression tracking
  └── cutsceneManager.js  # NEW: Cutscene system

data/
  └── enemies/
      └── undertale/
          ├── bosses/     # Boss enemy JSON files
          │   ├── asgore.json
          │   ├── sans.json
          │   ├── undyne.json
          │   ├── toriel.json
          │   ├── mettaton_ex.json
          │   ├── photoshop_flowey.json
          │   └── asriel.json
          └── [enemy_name].json  # All 61 enemy files
```

---

## 🎯 IMPLEMENTATION ORDER (Recommended)

### Week 1: Foundation
1. Blue/Orange attacks (#1)
2. Soul modes (#2)
3. Multi-enemy battles (#11)

### Week 2: Projectiles
4. Homing projectiles (#3)
5. Bouncing projectiles (#4)
6. Exploding projectiles (#5)
7. Arc projectiles (#6)
8. Wave projectiles (#7)

### Week 3: Boss Systems
9. Gaster Blasters (#10)
10. Multi-phase system (#17)
11. KR system (#15)

### Week 4: Advanced Features
12. Advanced ACT tracking (#13)
13. Item-based ACTs (#14)
14. Status effects (#16)

### Week 5: Boss-Specific
15. Sans mechanics (#19)
16. Mettaton EX (#20)
17. Toriel AI (#22)

### Week 6: UI Revamp
18. Sprite-based UI (#48)
19. Authentic buttons (#50)
20. HP/dialogue boxes (#51-52)
21. Determination font (#53)

### Week 7-8: Content
22. Create all enemy JSON files (#46)
23. Test all enemies
24. Performance optimization (#47)

---

## 🧪 TESTING CHECKLIST

For each enemy implemented:
- [ ] Attacks spawn correctly
- [ ] ACT mechanics work
- [ ] Spare conditions trigger
- [ ] Dialogue displays properly
- [ ] Sprite animations play
- [ ] Collision detection accurate
- [ ] No performance issues

---

## 📝 NOTES

- **Priority order:** Complete Phase 1 → Phase 7 → Phase 2 → Phase 3 before other phases
- **UI Revamp is HIGH priority** - Do after Phase 1 for maximum visual impact
- **Test incrementally** - Don't wait to implement all features before testing
- **Boss mechanics** can be implemented as standalone systems and enabled per-enemy
- **Performance testing required** for Sans, Asriel, Photoshop Flowey (dense bullet patterns)

---

## 🔗 REFERENCES

- Enemy info: `fight info expanded.md`
- Current attacks: `js/attacks.js`
- Current battle system: `js/battle.js`
- Sprite assets: `data/assets/Undertale Sprites/`

---

**STATUS:** Ready to begin implementation
**Next Step:** Start with TODO #1 (Blue/Orange Attack System)
