# UI System Issues & Improvement Plan

## Date: December 2024

## Current Issues Identified

### 1. **Dialogue Box Overlapping with Buttons** ❌
**Problem:** 
- Dialogue box and action buttons are overlapping on screen
- Both positioned at bottom of screen with conflicting z-index
- No clear separation between UI elements

**Impact:**
- Confusing user experience
- Buttons are clickable even when dialogue is showing
- Text is difficult to read

### 2. **Multiple Button Clicks / No Debouncing** ❌
**Problem:**
```javascript
// In ui.js - setupButtons()
btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    if (this.onActionClick) {
        this.onActionClick(action);
    }
});
```
- No state checking before allowing clicks
- No cooldown/debounce mechanism
- Buttons remain clickable during attack phase

**Impact:**
- User can spam click buttons causing multiple actions
- Can trigger actions during wrong battle phases
- Game state becomes inconsistent

### 3. **No Phase Locking** ❌
**Problem:**
```javascript
handleAction(action) {
    uiManager.hideActionButtons();  // Only hides, doesn't lock
    // ... performs action
}
```
- hideActionButtons() only hides visually
- Buttons can still be clicked via code/keyboard
- No "isProcessing" or "locked" state

**Impact:**
- Actions can be triggered during transitions
- Race conditions in battle state
- Unpredictable behavior

### 4. **UI Not Authentic to Undertale/Deltarune** ❌
**Current Layout:**
```
[HP Bar at top-left]
[Canvas for battle box]
[Dialogue box at bottom]  <- OVERLAPPING
[Action buttons at bottom] <- OVERLAPPING
```

**Authentic Undertale Layout:**
```
[HP Bar: "Chara  LV 1  HP ███████████ 20/20"]
                                    
[Battle Box - center of screen]    
[Enemy sprite above battle box]    
                                    
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
* The dummy takes another swing!   <- Text box (dialogue)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                                    
[FIGHT]  [ACT]  [ITEM]  [MERCY]   <- Button row (separate)
```

**Issues:**
- HP bar positioned wrong
- Dialogue box should be fixed size, always visible
- Buttons should be in separate row below text box
- Missing authentic borders and styling
- No soul cursor for menu navigation

### 5. **HTML Buttons Instead of Soul Navigation** ❌
**Problem:**
- Using HTML `<button>` elements with click handlers
- Not keyboard-driven like Undertale
- No soul (heart) cursor for selection

**Authentic Undertale System:**
- Arrow keys move heart cursor between options
- Z/Enter to confirm selection
- X/Shift to cancel/go back
- Visual feedback with heart position

### 6. **Missing Visual Elements** ❌
- No authentic Undertale/Deltarune fonts
- No pixelated borders like game
- No battle box pulse/animations
- HP bar doesn't match game style
- Text rendering not pixel-perfect

## Proposed Solutions

### Solution 1: Restructure UI Layout ✅

**New HTML Structure:**
```html
<div id="game-container">
    <canvas id="game-canvas"></canvas>
    
    <div id="battle-ui">
        <!-- HP Bar - top left, pixel-perfect -->
        <div id="hp-bar">
            <span class="name">Chara</span>
            <span class="lv">LV 1</span>
            <span class="hp-label">HP</span>
            <div class="hp-bar-container">
                <div class="hp-bar-fill"></div>
            </div>
            <span class="hp-numbers">20 / 20</span>
        </div>
        
        <!-- Text Box - fixed position, always visible -->
        <div id="text-box">
            <div id="text-content">
                * The enemy attacks!
            </div>
        </div>
        
        <!-- Button Container - separate row below text -->
        <div id="button-container">
            <div class="button-option" data-action="fight">
                <span class="button-text">FIGHT</span>
            </div>
            <div class="button-option" data-action="act">
                <span class="button-text">ACT</span>
            </div>
            <div class="button-option" data-action="item">
                <span class="button-text">ITEM</span>
            </div>
            <div class="button-option" data-action="mercy">
                <span class="button-text">MERCY</span>
            </div>
        </div>
        
        <!-- Soul cursor (heart) -->
        <div id="soul-cursor">❤</div>
    </div>
</div>
```

**New CSS Layout:**
```css
#battle-ui {
    position: absolute;
    inset: 0;
    pointer-events: none; /* Let canvas handle events */
}

#hp-bar {
    position: absolute;
    top: 10px;
    left: 20px;
    font-family: 'DeterminationMono', monospace;
    font-size: 16px;
    color: white;
}

#text-box {
    position: absolute;
    bottom: 120px; /* Above buttons */
    left: 50%;
    transform: translateX(-50%);
    width: 580px;
    height: 120px;
    background: black;
    border: 5px solid white;
    padding: 15px;
    pointer-events: all;
}

#button-container {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 20px;
    pointer-events: all;
}

.button-option {
    width: 110px;
    height: 42px;
    background: black;
    border: 5px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: white;
    cursor: pointer;
}

#soul-cursor {
    position: absolute;
    font-size: 24px;
    color: red;
    transition: all 0.1s;
    pointer-events: none;
}
```

### Solution 2: Implement State Machine ✅

**New Battle State Management:**
```javascript
export class Battle {
    constructor(canvas) {
        // ... existing code
        
        // Battle state machine
        this.state = 'IDLE';
        this.stateTransitioning = false;
        this.canAcceptInput = false;
        
        // Available states:
        this.STATES = {
            IDLE: 'IDLE',
            PLAYER_TURN_START: 'PLAYER_TURN_START',
            MENU_SELECTION: 'MENU_SELECTION',
            SUBMENU_SELECTION: 'SUBMENU_SELECTION',
            ACTION_PROCESSING: 'ACTION_PROCESSING',
            ENEMY_TURN_START: 'ENEMY_TURN_START',
            ENEMY_ATTACKING: 'ENEMY_ATTACKING',
            DODGING: 'DODGING',
            DAMAGE_FLASH: 'DAMAGE_FLASH',
            DIALOGUE: 'DIALOGUE',
            VICTORY: 'VICTORY',
            DEFEAT: 'DEFEAT'
        };
    }
    
    setState(newState) {
        console.log(`State transition: ${this.state} -> ${newState}`);
        this.state = newState;
        this.stateTransitioning = true;
        
        // Determine if input allowed in this state
        this.canAcceptInput = [
            'MENU_SELECTION',
            'SUBMENU_SELECTION',
            'DODGING'
        ].includes(newState);
        
        // Auto-unlock after transition
        setTimeout(() => {
            this.stateTransitioning = false;
        }, 100);
    }
    
    canProcessInput() {
        return this.canAcceptInput && !this.stateTransitioning;
    }
}
```

### Solution 3: Soul-Based Navigation ✅

**New Input System:**
```javascript
export class MenuNavigator {
    constructor() {
        this.currentMenu = 'MAIN'; // MAIN, ACT, ITEM, MERCY
        this.selectedIndex = 0;
        this.menuOptions = [];
        this.soulElement = document.getElementById('soul-cursor');
        
        // Input cooldown to prevent spam
        this.lastInputTime = 0;
        this.inputCooldown = 100; // ms
        
        this.setupKeyboardControls();
    }
    
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.canProcessInput()) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.moveSelection(-1);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.moveSelection(1);
                    break;
                case 'z':
                case 'Z':
                case 'Enter':
                    e.preventDefault();
                    this.confirmSelection();
                    break;
                case 'x':
                case 'X':
                case 'Shift':
                    e.preventDefault();
                    this.cancelSelection();
                    break;
            }
        });
    }
    
    canProcessInput() {
        const now = Date.now();
        if (now - this.lastInputTime < this.inputCooldown) {
            return false; // Input on cooldown
        }
        this.lastInputTime = now;
        return true;
    }
    
    moveSelection(direction) {
        const newIndex = this.selectedIndex + direction;
        if (newIndex >= 0 && newIndex < this.menuOptions.length) {
            this.selectedIndex = newIndex;
            this.updateSoulPosition();
            audioManager.playSound('menu_move');
        }
    }
    
    updateSoulPosition() {
        const option = this.menuOptions[this.selectedIndex];
        const optionElement = document.querySelector(`[data-index="${this.selectedIndex}"]`);
        
        if (optionElement) {
            const rect = optionElement.getBoundingClientRect();
            this.soulElement.style.left = (rect.left - 35) + 'px';
            this.soulElement.style.top = (rect.top + rect.height / 2 - 12) + 'px';
        }
    }
    
    confirmSelection() {
        const option = this.menuOptions[this.selectedIndex];
        if (option && option.callback) {
            audioManager.playSound('menu_confirm');
            option.callback();
        }
    }
    
    cancelSelection() {
        audioManager.playSound('menu_cancel');
        // Return to previous menu or main menu
    }
    
    setMenu(options) {
        this.menuOptions = options;
        this.selectedIndex = 0;
        this.updateSoulPosition();
    }
}
```

### Solution 4: Button State Management ✅

**Enhanced Button System:**
```javascript
export class ButtonManager {
    constructor() {
        this.buttons = {
            fight: document.querySelector('[data-action="fight"]'),
            act: document.querySelector('[data-action="act"]'),
            item: document.querySelector('[data-action="item"]'),
            mercy: document.querySelector('[data-action="mercy"]')
        };
        
        this.enabled = false;
        this.locked = false;
        
        this.setupButtons();
    }
    
    setupButtons() {
        Object.entries(this.buttons).forEach(([action, btn]) => {
            btn.addEventListener('click', (e) => {
                if (!this.canClick(action)) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                this.handleClick(action);
            });
        });
    }
    
    canClick(action) {
        if (!this.enabled) {
            console.log(`Button ${action} clicked but system disabled`);
            return false;
        }
        if (this.locked) {
            console.log(`Button ${action} clicked but system locked`);
            return false;
        }
        return true;
    }
    
    handleClick(action) {
        // Lock immediately to prevent double-clicks
        this.lock();
        
        // Trigger action
        if (this.onAction) {
            this.onAction(action);
        }
        
        // Unlock after cooldown
        setTimeout(() => {
            this.unlock();
        }, 300);
    }
    
    enable() {
        this.enabled = true;
        this.buttons.forEach(btn => {
            btn.classList.remove('disabled');
            btn.style.pointerEvents = 'all';
        });
    }
    
    disable() {
        this.enabled = false;
        this.buttons.forEach(btn => {
            btn.classList.add('disabled');
            btn.style.pointerEvents = 'none';
        });
    }
    
    lock() {
        this.locked = true;
    }
    
    unlock() {
        this.locked = false;
    }
    
    setCallback(callback) {
        this.onAction = callback;
    }
}
```

### Solution 5: Authentic Text Rendering ✅

**Pixel-Perfect Text Box:**
```javascript
export class TextBoxRenderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.text = '';
        this.displayedText = '';
        this.charIndex = 0;
        this.textSpeed = 2; // frames per character
        this.frameCount = 0;
        this.isTyping = false;
        
        // Text box dimensions (Undertale style)
        this.box = {
            x: 30,
            y: 260,
            width: 580,
            height: 130,
            padding: 20,
            borderWidth: 5
        };
        
        // Font settings
        this.fontSize = 24;
        this.lineHeight = 32;
        this.font = 'DeterminationMono';
    }
    
    setText(text, instant = false) {
        this.text = text;
        this.charIndex = 0;
        this.displayedText = '';
        this.isTyping = !instant;
        this.frameCount = 0;
        
        if (instant) {
            this.displayedText = text;
        }
    }
    
    update() {
        if (!this.isTyping) return;
        
        this.frameCount++;
        
        if (this.frameCount >= this.textSpeed) {
            this.frameCount = 0;
            
            if (this.charIndex < this.text.length) {
                this.displayedText += this.text[this.charIndex];
                this.charIndex++;
                
                // Play typing sound
                if (this.text[this.charIndex - 1] !== ' ') {
                    audioManager.playSound('text_type');
                }
            } else {
                this.isTyping = false;
            }
        }
    }
    
    draw() {
        const ctx = this.ctx;
        
        // Draw box background
        ctx.fillStyle = 'black';
        ctx.fillRect(this.box.x, this.box.y, this.box.width, this.box.height);
        
        // Draw white border (pixel-perfect)
        ctx.strokeStyle = 'white';
        ctx.lineWidth = this.box.borderWidth;
        ctx.strokeRect(
            this.box.x,
            this.box.y,
            this.box.width,
            this.box.height
        );
        
        // Draw text with word wrapping
        ctx.fillStyle = 'white';
        ctx.font = `${this.fontSize}px ${this.font}`;
        
        this.drawWrappedText(
            this.displayedText,
            this.box.x + this.box.padding,
            this.box.y + this.box.padding + this.fontSize,
            this.box.width - (this.box.padding * 2),
            this.lineHeight
        );
    }
    
    drawWrappedText(text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        
        for (let word of words) {
            const testLine = line + word + ' ';
            const metrics = this.ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && line !== '') {
                this.ctx.fillText(line, x, currentY);
                line = word + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        
        this.ctx.fillText(line, x, currentY);
    }
}
```

## Implementation Priority

### Phase 1: Critical Fixes (Immediate) 🔥
1. **Add button state locking** - Prevent multiple clicks
2. **Implement input cooldown** - 100-300ms between actions
3. **Add phase checking** - Only allow actions in correct states
4. **Fix z-index** - Separate dialogue and buttons

### Phase 2: Layout Restructure (High Priority) ⚡
1. **Reposition text box** - Bottom center, fixed size
2. **Reposition buttons** - Row below text box
3. **Fix HP bar** - Top-left corner, authentic style
4. **Add proper borders** - Pixel-perfect white borders

### Phase 3: Soul Navigation (Medium Priority) 📝
1. **Implement keyboard controls** - Arrow keys + Z/X
2. **Add soul cursor** - Heart that moves between options
3. **Remove click handlers** - Keyboard-only (or both)
4. **Add sound effects** - Menu sounds

### Phase 4: Visual Polish (Nice to Have) ✨
1. **Authentic fonts** - DeterminationMono/8bitOperator
2. **Pixel-perfect rendering** - Image smoothing off
3. **Battle box animations** - Pulse, shake effects
4. **Proper text rendering** - Canvas-based text

## Files to Modify

### Critical Changes:
1. **js/ui.js** - Add state management, button locking
2. **js/battle.js** - Implement state machine, phase guards
3. **css/styles.css** - Fix layout, z-index, positioning
4. **index.html** - Restructure UI elements

### New Files to Create:
1. **js/menuNavigator.js** - Soul-based navigation system
2. **js/buttonManager.js** - Enhanced button state management
3. **js/textRenderer.js** - Canvas-based text rendering

## Testing Checklist

- [ ] Cannot click buttons during attack phase
- [ ] Cannot spam click buttons (cooldown works)
- [ ] Dialogue box doesn't overlap buttons
- [ ] HP bar in correct position (top-left)
- [ ] Text box always visible, correct size
- [ ] Buttons in separate row below text
- [ ] Soul cursor navigates correctly
- [ ] Keyboard controls work (Arrow keys + Z/X)
- [ ] Visual style matches Undertale/Deltarune
- [ ] State transitions prevent invalid actions

## Additional Improvements

### 1. Add Turn Indicator
Show whose turn it is:
```
━━━━━━━━━━━━━━━━━━━━━━━━━
* YOUR TURN              ←
━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2. Add Action Feedback
Visual confirmation of actions:
- Flash button when selected
- Show damage numbers above enemy
- Screen shake on hit

### 3. Add Transition Animations
Smooth state transitions:
- Battle box shrinks/grows
- Buttons fade in/out
- Text box appears with slide

### 4. Improve Typography
Authentic Undertale fonts:
- Download "Determination Mono" font
- Add @font-face in CSS
- Apply to all UI text

## Summary

The current UI has several critical issues preventing it from feeling like Undertale/Deltarune:

**Main Problems:**
1. ❌ Overlapping UI elements
2. ❌ No button state management (spam clicks)
3. ❌ Missing phase locking
4. ❌ Wrong layout (not authentic)
5. ❌ HTML buttons instead of soul navigation

**Solutions:**
1. ✅ Restructure layout with proper positioning
2. ✅ Add state machine with phase guards
3. ✅ Implement button locking and cooldowns
4. ✅ Add soul-based keyboard navigation
5. ✅ Render authentic UI elements

**Next Steps:**
Start with Phase 1 (Critical Fixes) to make the game playable, then move through phases 2-4 for authentic feel.

Would you like me to start implementing these fixes?
