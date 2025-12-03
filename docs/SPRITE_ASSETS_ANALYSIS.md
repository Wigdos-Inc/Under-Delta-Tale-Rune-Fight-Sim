# Undertale Sprite Assets - UI Elements Analysis 📊

## Overview
Complete analysis of authentic Undertale sprite assets available for implementing Phase 4 (Visual Polish). These are the **actual sprites from the game**, organized and ready to use!

---

## 🎯 Priority 1: Essential Battle UI Elements

### **Battle Buttons** (`Battle/UI/Buttons/`)

#### Main Action Buttons (0 = normal, 1 = selected):
```
✅ FIGHT Button:
- spr_fightbt_0.png / spr_fightbt_1.png (standard)
- spr_fightbt_center_0.png / spr_fightbt_center_1.png (centered)
- spr_fightbt_hollow_0.png / spr_fightbt_hollow_1.png (outline only)

✅ ACT Button:
- spr_actbt_center_0.png / spr_actbt_center_1.png (centered)
- spr_actbt_center_hole_0.png / spr_actbt_center_hole_1.png (with hole)

✅ ITEM Button:
- spr_itembt_0.png / spr_itembt_1.png (standard)
- spr_itembt_hollow_0.png / spr_itembt_hollow_1.png (outline)

✅ MERCY Button:
- spr_mercybutton_normal_0.png (standard)
- spr_sparebt_0.png / spr_sparebt_1.png (spare option)
- spr_sparebt_bandage_0.png / spr_sparebt_bandage_1.png (can spare - yellow)

🎬 MERCY Shatter Animation (11 frames):
- spr_mercybutton_shatter_0.png → spr_mercybutton_shatter_10.png
- Used when battle is won by sparing
```

**Usage:** Replace our current text-based buttons with authentic Undertale button sprites!

---

### **Soul Sprites** (`Battle/UI/Soul/`)

#### Red Heart (Main Player Soul):
```
✅ Standard Red Soul:
- spr_heart_0.png / spr_heart_1.png (2-frame animation)
- spr_heartred_center_0.png (centered version)

✅ Heart Break:
- spr_heartbreak_0.png (death animation)
- spr_heartshards_0.png → spr_heartshards_3.png (shatter pieces)
```

#### Colored Souls (Soul Modes):
```
✅ Blue Soul (Gravity):
- spr_heartblue_0.png / spr_heartblue_1.png
- spr_heartblue_u_0.png / spr_heartblue_u_1.png (up orientation)
- spr_heartblue_l_0.png / spr_heartblue_l_1.png (left)
- spr_heartblue_r_0.png / spr_heartblue_r_1.png (right)

✅ Green Soul (Shield):
- spr_heartgreen_0.png / spr_heartgreen_1.png

✅ Yellow Soul (Shooter):
- spr_heartyellow_0.png / spr_heartyellow_1.png
- spr_heartyellow_center_0.png / spr_heartyellow_center_1.png
- spr_heartyellow_flip_0.png / spr_heartyellow_flip_1.png

✅ Purple Soul (Lines):
- spr_heartpurple_0.png / spr_heartpurple_1.png
- spr_heartpurple_center_0.png / spr_heartpurple_center_1.png

✅ Orange Soul:
- spr_heartorange_0.png / spr_heartorange_1.png

✅ Aqua/Cyan Soul:
- spr_heartaqua_0.png / spr_heartaqua_1.png
```

**Usage:** Use for soul cursor AND in-battle soul sprite with proper color modes!

---

### **Damage Numbers** (`Battle/UI/Damage/`)

```
✅ White Damage Numbers (0-9):
- spr_dmgnum_0.png → spr_dmgnum_9.png

✅ Orange Damage Numbers (0-9):
- spr_dmgnum_o_0.png → spr_dmgnum_o_9.png

✅ Miss Indicator:
- spr_dmgmiss_o_0.png
```

**Usage:** Display damage numbers when enemy is hit, with proper sprite-based rendering!

---

### **Battle Backgrounds** (`Battle/UI/BG/`)

```
✅ Standard Battle Background:
- spr_battlebg_0.png
- spr_battlebg_1.png (animated variant)

✅ Alternative:
- spr_garbagebg_0.png
```

**Usage:** Replace solid black background with authentic battle backdrop!

---

## 🎯 Priority 2: Visual Effects & Polish

### **Attack UI** (`Battle/UI/Attack/`)

```
✅ Target Reticle (FIGHT action):
- spr_target_0.png (targeting cursor)
- spr_targetchoice_0.png / spr_targetchoice_1.png (target selection)
- spr_dumbtarget_0.png (dummy target)

✅ Fade Bars:
- spr_fadebar_0.png / spr_fadebar_1.png / spr_fadebar_2.png
```

**Usage:** Implement FIGHT timing minigame with authentic targeting system!

---

### **Border & HP Elements** (`Battle/UI/`)

```
✅ Battle Box Border:
- spr_border_0.png (the white rectangle frame for attacks)

✅ HP Name Display:
- spr_hpname_0.png (HP label sprite)

✅ KR Meter:
- spr_krmeter_0.png (Karma meter for Sans fight)

✅ Infinity Sign:
- spr_infinitysign_0.png
```

**Usage:** 
- Use `spr_border_0.png` for authentic battle box rendering
- Use `spr_hpname_0.png` for HP label instead of text

---

### **Visual Effects** (`Battle/UI/`)

```
✅ Exclamation Points:
- spr_exclamationpoint_0.png
- spr_exclamationpoint_1.png

✅ Dust Clouds (enemy death):
- spr_dustcloud_0.png
- spr_dustcloud_1.png
- spr_dustcloud_2.png

✅ Guide Arrows:
- spr_guidearrows_0.png
```

**Usage:** Add proper enemy defeat animation with dust clouds!

---

### **Speech Bubbles** (`Battle/UI/Speech Bubbles/`)

```
✅ Standard Bubbles:
- spr_blconsm_0.png (small)
- spr_blconsm2_0.png (small variant)
- spr_blcontiny_0.png (tiny)
- spr_blcontl_0.png (tall)
- spr_blconwd_0.png (wide)

✅ Positioned Bubbles:
- spr_blconabove_0.png (above character)
- spr_blconbelow_0.png (below character)
- spr_blcontinyabove_0.png

✅ Special:
- spr_shockblcon2_0.png (shocked bubble)
```

**Usage:** Add authentic speech bubbles above enemies during their dialogue!

---

## 🎯 Priority 3: Polish & Extra Details

### **Font Sprites** (`UI/Pixels/`)

```
✅ Pre-rendered Font Sheet:
- spr_fonts_en_preload_0.png (English font sprite sheet)
- spr_fonts_ja_preload_0.png (Japanese font)

✅ Pixel Elements:
- spr_pixblk_0.png (black pixel)
- spr_pixwht_0.png → spr_pixwht_11.png (white pixels, various sizes)
- spr_pixeltall_0.png (tall pixel)
```

**Usage:** Implement true pixel-perfect text rendering using Undertale's actual font!

---

### **Extra UI** (`UI/`)

```
✅ Exclamation:
- spr_exc_0.png
- spr_exc_f_0.png

✅ Music Block:
- spr_musblc_0.png
```

---

## 📋 Implementation Priority for Phase 4

### **Tier 1 - Essential (Must Have):**
1. ✅ **Soul Sprites** - Replace heart emoji with actual red heart sprite
2. ✅ **Damage Numbers** - Sprite-based damage display
3. ✅ **Battle Box Border** - Use `spr_border_0.png` for authentic frame
4. ✅ **Button Sprites** - Replace text buttons with actual button graphics

### **Tier 2 - High Impact (Should Have):**
5. ✅ **Battle Background** - Use `spr_battlebg_0.png`
6. ✅ **Dust Clouds** - Enemy death animation
7. ✅ **Heart Break** - Death animation with shards
8. ✅ **HP Name Sprite** - Use actual HP label sprite

### **Tier 3 - Polish (Nice to Have):**
9. ✅ **FIGHT Target** - Timing minigame with targeting reticle
10. ✅ **Speech Bubbles** - Enemy dialogue with proper bubbles
11. ✅ **MERCY Shatter** - Spare victory animation
12. ✅ **Font Rendering** - True Undertale font from sprite sheet

### **Tier 4 - Advanced (Future):**
13. ✅ **Colored Souls** - Proper sprites for all soul modes
14. ✅ **KR Meter** - For advanced boss mechanics
15. ✅ **Exclamation Points** - For emphasis effects

---

## 🎨 Visual Comparison

### Current Implementation:
- ❌ Text-based buttons (HTML `<button>`)
- ❌ Unicode heart emoji (❤) for soul
- ❌ Text-based damage numbers
- ❌ CSS borders for battle box
- ❌ Solid color backgrounds

### With Authentic Sprites:
- ✅ Actual Undertale button graphics
- ✅ Pixel-art red heart sprite (animated)
- ✅ Sprite-based damage numbers (white/orange)
- ✅ Actual battle box border sprite
- ✅ Undertale battle background

---

## 📐 Sprite Information

### File Naming Convention:
```
spr_[name]_[frame].png

Examples:
- spr_heart_0.png (heart, frame 0)
- spr_heart_1.png (heart, frame 1)
- spr_fightbt_0.png (fight button, normal state)
- spr_fightbt_1.png (fight button, selected state)
```

### Animation Pattern:
- Most sprites have 0 and 1 frames (2-frame animation)
- Some have more (dust clouds: 0-2, mercy shatter: 0-10)
- Frame 0 = normal/start
- Frame 1 = animated/selected

---

## 💻 Implementation Notes

### Loading Sprites:
```javascript
// Example sprite loading
const heartSprite = new Image();
heartSprite.src = 'data/assets/Undertale Sprites/Battle/UI/Soul/spr_heart_0.png';

// Animated sprites
const heartFrames = [
    'data/assets/Undertale Sprites/Battle/UI/Soul/spr_heart_0.png',
    'data/assets/Undertale Sprites/Battle/UI/Soul/spr_heart_1.png'
];
```

### Rendering on Canvas:
```javascript
// Replace text/emoji with actual sprite
ctx.drawImage(heartSprite, x, y);

// Animated with frame switching
const frame = Math.floor(Date.now() / 200) % 2; // 200ms per frame
ctx.drawImage(heartFrames[frame], x, y);
```

### Battle Box Border:
```javascript
// Instead of CSS border
const borderSprite = new Image();
borderSprite.src = 'data/assets/Undertale Sprites/Battle/UI/spr_border_0.png';
ctx.drawImage(borderSprite, battleBoxX, battleBoxY);
```

---

## 🎯 Recommended Phase 4 Implementation Order

### Step 1: Replace Soul Cursor ⭐
- Load `spr_heart_0.png` and `spr_heart_1.png`
- Replace `<div class="heart">❤</div>` with canvas-rendered sprite
- Animate between frames (200ms per frame)

### Step 2: Add Damage Numbers ⭐
- Load digit sprites (`spr_dmgnum_0.png` through `spr_dmgnum_9.png`)
- Render damage as sprite composition
- Animate upward float + fade

### Step 3: Battle Box Border ⭐
- Load `spr_border_0.png`
- Draw border sprite instead of CSS rectangle
- Add pulse/shake effects to sprite

### Step 4: Button Sprites
- Load button sprites (fight/act/item/mercy)
- Render on canvas positioned like current buttons
- Handle hover/selection states (frame 0 vs frame 1)

### Step 5: Background & Effects
- Load `spr_battlebg_0.png` for backdrop
- Load dust clouds for enemy defeat
- Load heart break for game over

### Step 6: Advanced Polish
- FIGHT targeting minigame
- Speech bubbles
- Font sprite sheet rendering
- MERCY shatter animation

---

## 📦 Asset Paths Reference

All paths relative to project root:

```
Button Sprites:
- data/assets/Undertale Sprites/Battle/UI/Buttons/

Soul Sprites:
- data/assets/Undertale Sprites/Battle/UI/Soul/

Damage Numbers:
- data/assets/Undertale Sprites/Battle/UI/Damage/

Battle Box:
- data/assets/Undertale Sprites/Battle/UI/spr_border_0.png

Background:
- data/assets/Undertale Sprites/Battle/UI/BG/

Effects:
- data/assets/Undertale Sprites/Battle/UI/ (dust clouds, etc.)

Speech Bubbles:
- data/assets/Undertale Sprites/Battle/UI/Speech Bubbles/

Font:
- data/assets/Undertale Sprites/UI/Pixels/spr_fonts_en_preload_0.png
```

---

## 🎮 Summary

**You have access to ALL the authentic Undertale battle UI sprites!**

### Available Assets:
- ✅ 4 main button types (FIGHT/ACT/ITEM/MERCY) with variants
- ✅ 10+ soul types (red, blue, green, yellow, purple, orange, cyan)
- ✅ 20 damage number sprites (0-9 in white + orange)
- ✅ Battle box border sprite
- ✅ 2 battle backgrounds
- ✅ 3 dust cloud frames (death animation)
- ✅ 4 heart shatter pieces (game over)
- ✅ 11 MERCY shatter frames (victory animation)
- ✅ 14+ speech bubble types
- ✅ Complete font sprite sheet
- ✅ Multiple visual effect sprites

### Recommended Approach:
Start with **Tier 1** (soul, damage, border, buttons) - these will have the biggest visual impact and are essential for authentic feel. Then move to **Tier 2** for polish, and **Tier 3+** for extra details.

**This will make your game look EXACTLY like Undertale!** 🎨✨
