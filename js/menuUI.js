/**
 * menuUI.js
 * Main menu and game mode selection UI
 */

import { gameModeManager, GAME_MODES } from './gameMode.js';
import { ANIMATION, MENU, KEYS } from './constants.js';

export class MenuUI {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.selectedMode = GAME_MODES.UNDERTALE;
        this.menuState = 'main'; // 'main', 'mode_select', 'enemy_select'
        
        // Animation
        this.titleBounce = 0;
        this.titleBounceDir = 1;
        this.heartPos = 0;
        this.heartBounce = 0;
        
        // Menu options
        this.mainOptions = ['START GAME', 'GAME MODE', 'CREDITS'];
        this.modeOptions = ['UNDERTALE', 'DELTARUNE'];
        this.selectedOption = 0;
        
        // Colors
        this.colors = {
            undertale: {
                bg: '#000000',
                title: '#ffffff',
                selected: '#ffff00',
                normal: '#ffffff'
            },
            deltarune: {
                bg: '#000000',
                title: '#00ffff',
                selected: '#ff00ff',
                normal: '#ffffff'
            }
        };
        
        // Setup event listeners
        this.setupControls();
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }
    
    handleKeyPress(e) {
        if (this.menuState === 'main') {
            if (e.key === 'ArrowUp') {
                this.selectedOption = Math.max(0, this.selectedOption - 1);
            } else if (e.key === 'ArrowDown') {
                this.selectedOption = Math.min(this.mainOptions.length - 1, this.selectedOption + 1);
            } else if (KEYS.CONFIRM.includes(e.key.toLowerCase())) {
                this.selectMainOption();
            }
        } else if (this.menuState === 'mode_select') {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                this.selectedOption = 0;
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                this.selectedOption = 1;
            } else if (KEYS.CONFIRM.includes(e.key.toLowerCase())) {
                this.selectMode();
            } else if (KEYS.CANCEL.includes(e.key.toLowerCase())) {
                this.menuState = 'main';
                this.selectedOption = 1;
            }
        }
    }
    
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.menuState === 'main') {
            // Check clicks on main menu options
            for (let i = 0; i < this.mainOptions.length; i++) {
                const optionY = 300 + i * 50;
                if (y >= optionY - 20 && y <= optionY + 20) {
                    this.selectedOption = i;
                    this.selectMainOption();
                    break;
                }
            }
        } else if (this.menuState === 'mode_select') {
            // Check clicks on mode options
            const ut_x = MENU.MODE_UT_X, dr_x = MENU.MODE_DR_X, y_pos = MENU.MODE_SELECT_Y;
            if (Math.abs(x - ut_x) < 80 && Math.abs(y - y_pos) < 60) {
                this.selectedOption = 0;
                this.selectMode();
            } else if (Math.abs(x - dr_x) < 80 && Math.abs(y - y_pos) < 60) {
                this.selectedOption = 1;
                this.selectMode();
            }
        }
    }
    
    selectMainOption() {
        const option = this.mainOptions[this.selectedOption];
        if (option === 'START GAME') {
            if (this.onStartGame) this.onStartGame();
        } else if (option === 'GAME MODE') {
            this.menuState = 'mode_select';
            this.selectedOption = this.selectedMode === GAME_MODES.UNDERTALE ? 0 : 1;
        } else if (option === 'CREDITS') {
            alert('Created by: Game Developer\\nSprites: Toby Fox & Undertale/Deltarune');
        }
    }
    
    selectMode() {
        if (this.selectedOption === 0) {
            this.selectedMode = GAME_MODES.UNDERTALE;
            gameModeManager.setMode(GAME_MODES.UNDERTALE);
        } else {
            this.selectedMode = GAME_MODES.DELTARUNE;
            gameModeManager.setMode(GAME_MODES.DELTARUNE);
        }
        this.menuState = 'main';
        this.selectedOption = 0;
    }
    
    update() {
        // Title bounce animation
        this.titleBounce += ANIMATION.TITLE_BOUNCE_SPEED * this.titleBounceDir;
        if (this.titleBounce > ANIMATION.TITLE_BOUNCE_MAX) this.titleBounceDir = -1;
        if (this.titleBounce < ANIMATION.TITLE_BOUNCE_MIN) this.titleBounceDir = 1;
        
        // Heart bounce
        this.heartBounce += ANIMATION.HEART_BOUNCE_SPEED;
    }
    
    draw() {
        const ctx = this.ctx;
        const colors = this.selectedMode === GAME_MODES.UNDERTALE ? 
            this.colors.undertale : this.colors.deltarune;
        
        // Clear background
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.menuState === 'main') {
            this.drawMainMenu(colors);
        } else if (this.menuState === 'mode_select') {
            this.drawModeSelect(colors);
        }
    }
    
    drawMainMenu(colors) {
        const ctx = this.ctx;
        
        // Draw title
        ctx.save();
        ctx.font = 'bold 48px Determination Mono, monospace';
        ctx.fillStyle = colors.title;
        ctx.textAlign = 'center';
        ctx.shadowColor = colors.title;
        ctx.shadowBlur = 10;
        
        const titleY = MENU.TITLE_Y + this.titleBounce;
        ctx.fillText('UNDERTALE / DELTARUNE', this.canvas.width / 2, titleY);
        
        ctx.font = 'bold 32px Determination Mono, monospace';
        ctx.fillText('FIGHT SIMULATOR', this.canvas.width / 2, titleY + MENU.TITLE_SECONDARY_OFFSET);
        ctx.restore();
        
        // Draw mode indicator
        ctx.font = '16px Determination Mono, monospace';
        ctx.fillStyle = colors.selected;
        ctx.textAlign = 'center';
        const modeName = this.selectedMode === GAME_MODES.UNDERTALE ? 'UNDERTALE' : 'DELTARUNE';
        ctx.fillText(`[ ${modeName} MODE ]`, this.canvas.width / 2, titleY + MENU.MODE_INDICATOR_OFFSET);
        
        // Draw menu options
        ctx.font = 'bold 24px Determination Mono, monospace';
        ctx.textAlign = 'center';
        
        for (let i = 0; i < this.mainOptions.length; i++) {
            const y = MENU.MENU_START_Y + i * MENU.MENU_ITEM_HEIGHT;
            const isSelected = i === this.selectedOption;
            
            ctx.fillStyle = isSelected ? colors.selected : colors.normal;
            ctx.fillText(this.mainOptions[i], this.canvas.width / 2, y);
            
            // Draw soul heart next to selected option
            if (isSelected) {
                const heartX = this.canvas.width / 2 - MENU.SOUL_X_OFFSET;
                const heartY = y - 10 + Math.sin(this.heartBounce) * 3;
                this.drawHeart(heartX, heartY, 16, colors.selected);
            }
        }
        
        // Draw controls hint
        ctx.font = '14px Determination Mono, monospace';
        ctx.fillStyle = '#888';
        ctx.textAlign = 'center';
        ctx.fillText('[Arrow Keys] Navigate  [Z/Enter] Select  [X/Esc] Back', this.canvas.width / 2, MENU.CONTROLS_Y);
    }
    
    drawModeSelect(colors) {
        const ctx = this.ctx;
        
        // Draw title
        ctx.font = 'bold 36px Determination Mono, monospace';
        ctx.fillStyle = colors.title;
        ctx.textAlign = 'center';
        ctx.fillText('SELECT GAME MODE', this.canvas.width / 2, 100);
        
        // Draw mode boxes
        const boxWidth = MENU.MODE_SELECT_BOX_WIDTH;
        const boxHeight = MENU.MODE_SELECT_BOX_HEIGHT;
        const ut_x = MENU.MODE_UT_X;
        const dr_x = MENU.MODE_DR_X;
        const y = MENU.MODE_SELECT_Y;
        
        // UNDERTALE box
        const utSelected = this.selectedOption === 0;
        ctx.strokeStyle = utSelected ? this.colors.undertale.selected : this.colors.undertale.normal;
        ctx.lineWidth = utSelected ? 4 : 2;
        ctx.strokeRect(ut_x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight);
        
        ctx.fillStyle = utSelected ? this.colors.undertale.selected : this.colors.undertale.normal;
        ctx.font = 'bold 20px Determination Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('UNDERTALE', ut_x, y);
        
        if (utSelected) {
            const heartX = ut_x - MENU.MODE_SOUL_X_OFFSET;
            const heartY = y - 10 + Math.sin(this.heartBounce) * 3;
            this.drawHeart(heartX, heartY, 16, this.colors.undertale.selected);
        }
        
        // DELTARUNE box
        const drSelected = this.selectedOption === 1;
        ctx.strokeStyle = drSelected ? this.colors.deltarune.selected : this.colors.deltarune.normal;
        ctx.lineWidth = drSelected ? 4 : 2;
        ctx.strokeRect(dr_x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight);
        
        ctx.fillStyle = drSelected ? this.colors.deltarune.selected : this.colors.deltarune.normal;
        ctx.fillText('DELTARUNE', dr_x, y);
        
        if (drSelected) {
            const heartX = dr_x - MENU.MODE_SOUL_X_OFFSET;
            const heartY = y - 10 + Math.sin(this.heartBounce) * 3;
            this.drawHeart(heartX, heartY, 16, this.colors.deltarune.selected);
        }
        
        // Draw description
        ctx.font = '16px Determination Mono, monospace';
        ctx.fillStyle = colors.normal;
        ctx.textAlign = 'center';
        
        if (this.selectedOption === 0) {
            ctx.fillText('Fight classic Undertale enemies and bosses!', this.canvas.width / 2, MENU.MODE_DESCRIPTION_Y);
            ctx.fillText('33 enemies including Sans, Papyrus, Toriel, and more!', this.canvas.width / 2, MENU.MODE_DESCRIPTION_Y + MENU.MODE_DESCRIPTION_OFFSET);
        } else {
            ctx.fillText('Fight Deltarune enemies and bosses!', this.canvas.width / 2, MENU.MODE_DESCRIPTION_Y);
            ctx.fillText('18 enemies including Jevil, Spamton NEO, Queen, and more!', this.canvas.width / 2, MENU.MODE_DESCRIPTION_Y + MENU.MODE_DESCRIPTION_OFFSET);
        }
        
        // Controls hint
        ctx.font = '14px Determination Mono, monospace';
        ctx.fillStyle = '#888';
        ctx.fillText('[Arrow Keys] Select  [Z/Enter] Confirm  [X/Esc] Back', this.canvas.width / 2, MENU.CONTROLS_Y);
    }
    
    drawHeart(x, y, size, color) {
        const ctx = this.ctx;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y + size * 0.3);
        ctx.lineTo(x - size * 0.5, y - size * 0.3);
        ctx.lineTo(x - size * 0.5, y - size * 0.6);
        ctx.lineTo(x, y - size * 0.6);
        ctx.lineTo(x + size * 0.5, y - size * 0.6);
        ctx.lineTo(x + size * 0.5, y - size * 0.3);
        ctx.closePath();
        ctx.fill();
    }
    
    setStartGameCallback(callback) {
        this.onStartGame = callback;
    }
}
