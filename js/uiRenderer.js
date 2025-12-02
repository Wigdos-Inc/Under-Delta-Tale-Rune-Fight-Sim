/**
 * uiRenderer.js
 * Renders authentic Undertale/Deltarune UI elements using sprite assets
 */

import { spriteManager } from './sprites.js';
import { gameModeManager, GAME_MODES } from './gameMode.js';
import { ANIMATION, UI, COLORS } from './constants.js';

export class UIRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Button positions (Undertale layout - 2x2 grid in text box area)  
        // Canvas height: 480px
        // Text box: bottom 10px, height 155px → top edge at y=315 (480-10-155)
        // Buttons positioned in middle/lower area of text box
        // Top row: y = 315 + 85 = 400
        // Bottom row: y = 315 + 120 = 435
        this.buttonLayout = {
            fight: { x: 245, y: 400, width: UI.BUTTON_WIDTH, height: UI.BUTTON_HEIGHT },
            act: { x: 410, y: 400, width: UI.BUTTON_WIDTH, height: UI.BUTTON_HEIGHT },
            item: { x: 245, y: 435, width: UI.BUTTON_WIDTH, height: UI.BUTTON_HEIGHT },
            mercy: { x: 410, y: 435, width: UI.BUTTON_WIDTH, height: UI.BUTTON_HEIGHT }
        };
        
        this.selectedButton = null;
        this.hoveredButton = null;
        
        // Animation
        this.soulBounce = 0;
        this.soulBounceDir = 1;
        
        // Additional UI sprites
        this.hpNameSprite = 'data/assets/Undertale Sprites/Battle/UI/spr_hpname_0.png';
        
        // Preload all sprites
        this.preloadSprites();
    }
    
    /**
     * Get button sprite paths based on current game mode
     */
    getButtonSprites() {
        const mode = gameModeManager.getMode();
        const basePath = gameModeManager.getButtonPath();
        
        if (mode === GAME_MODES.UNDERTALE) {
            return {
                fight: `${basePath}/spr_fightbt_0.png`,
                fightHover: `${basePath}/spr_fightbt_1.png`,
                act: `${basePath}/spr_actbt_center_0.png`,
                actHover: `${basePath}/spr_actbt_center_1.png`,
                item: `${basePath}/spr_itembt_0.png`,
                itemHover: `${basePath}/spr_itembt_1.png`,
                mercy: `${basePath}/spr_mercybutton_normal_0.png`,
                spare: `${basePath}/spr_sparebt_0.png`,
                spareHover: `${basePath}/spr_sparebt_1.png`
            };
        } else {
            // Deltarune
            return {
                fight: `${basePath}/spr_btfight_0.png`,
                fightHover: `${basePath}/spr_btfight_1.png`,
                act: `${basePath}/spr_btact_0.png`,
                actHover: `${basePath}/spr_btact_1.png`,
                item: `${basePath}/spr_btitem_0.png`,
                itemHover: `${basePath}/spr_btitem_1.png`,
                mercy: `${basePath}/spr_btspare_0.png`,
                spare: `${basePath}/spr_btspare_0.png`,
                spareHover: `${basePath}/spr_btspare_1.png`
            };
        }
    }
    
    /**
     * Get soul sprite path based on current game mode
     */
    getSoulSprite() {
        return gameModeManager.getSoulPath();
    }
    
    /**
     * Get battle box sprite paths based on current game mode
     */
    getBattleBoxSprites() {
        const mode = gameModeManager.getMode();
        const basePath = gameModeManager.getBattleBoxPath();
        
        if (mode === GAME_MODES.UNDERTALE) {
            // Undertale doesn't use sprite-based battle boxes, just white borders
            return null;
        } else {
            return {
                corner: `${basePath}/spr_battlebox_corner_0.png`,
                horizontal: `${basePath}/spr_battlebox_horizontal_0.png`,
                vertical: `${basePath}/spr_battlebox_vertical_0.png`
            };
        }
    }
    
    /**
     * Preload all UI sprites based on current game mode
     */
    async preloadSprites() {
        const buttonSprites = this.getButtonSprites();
        const soulSprite = this.getSoulSprite();
        const battleBoxSprites = this.getBattleBoxSprites();
        
        const sprites = [
            ...Object.values(buttonSprites),
            soulSprite,
            this.hpNameSprite
        ];
        
        // Add battle box sprites if they exist (Deltarune)
        if (battleBoxSprites) {
            sprites.push(...Object.values(battleBoxSprites));
        }
        
        await spriteManager.loadSprites(sprites);
        console.log(`UI sprites loaded for ${gameModeManager.getMode()} mode`);
    }
    
    /**
     * Reload sprites when game mode changes
     */
    async reloadSprites() {
        await this.preloadSprites();
    }
    
    /**
     * Update animations
     */
    update() {
        // Soul bounce animation
        this.soulBounce += ANIMATION.SOUL_BOUNCE_SPEED * this.soulBounceDir;
        if (this.soulBounce > ANIMATION.SOUL_BOUNCE_MAX) this.soulBounceDir = -1;
        if (this.soulBounce < ANIMATION.SOUL_BOUNCE_MIN) this.soulBounceDir = 1;
    }
    
    /**
     * Draw battle UI background
     */
    drawBackground() {
        const mode = gameModeManager.getMode();
        
        // Draw background color based on game mode
        if (mode === GAME_MODES.UNDERTALE) {
            this.ctx.fillStyle = COLORS.BG_UNDERTALE;
        } else {
            this.ctx.fillStyle = COLORS.BG_DELTARUNE;
        }
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Draw action buttons using sprites
     * @param {string} selectedAction - Currently selected/hovered action
     */
    drawActionButtons(selectedAction = null) {
        const ctx = this.ctx;
        ctx.imageSmoothingEnabled = false;
        
        const buttonSprites = this.getButtonSprites();
        const soulSprite = this.getSoulSprite();
        
        // Draw each button with hover effect
        const buttons = ['fight', 'act', 'item', 'mercy'];
        
        buttons.forEach(buttonName => {
            const pos = this.buttonLayout[buttonName];
            const isHovered = selectedAction === buttonName || this.hoveredButton === buttonName;
            
            let spritePath;
            if (buttonName === 'mercy') {
                spritePath = isHovered ? buttonSprites.spareHover : buttonSprites.mercy;
            } else {
                spritePath = isHovered ? buttonSprites[buttonName + 'Hover'] : buttonSprites[buttonName];
            }
            
            const sprite = spriteManager.getSprite(spritePath);
            if (sprite && sprite.complete) {
                ctx.drawImage(sprite, pos.x, pos.y, pos.width, pos.height);
                
                // Draw selection soul
                if (isHovered) {
                    const soul = spriteManager.getSprite(soulSprite);
                    if (soul && soul.complete) {
                        const soulSize = UI.SOUL_SIZE;
                        const soulX = pos.x - soulSize - 8;
                        const soulY = pos.y + (pos.height / 2) - (soulSize / 2) + this.soulBounce;
                        ctx.drawImage(soul, soulX, soulY, soulSize, soulSize);
                    }
                }
            } else {
                // Fallback: draw colored rectangles
                const mode = gameModeManager.getMode();
                ctx.fillStyle = isHovered ? '#ffff00' : (mode === GAME_MODES.UNDERTALE ? '#ffffff' : '#dddddd');
                ctx.fillRect(pos.x, pos.y, pos.width, pos.height);
                ctx.fillStyle = '#000';
                ctx.font = '20px Determination Mono, monospace';
                ctx.textAlign = 'center';
                ctx.fillText(buttonName.toUpperCase(), pos.x + pos.width / 2, pos.y + 28);
            }
        });
        
        ctx.textAlign = 'left';
    }
    
    /**
     * Draw HP bar in Undertale style
     * @param {number} hp - Current HP
     * @param {number} maxHp - Maximum HP
     * @param {number} kr - KARMA damage (for Sans fight)
     */
    drawHPBar(hp, maxHp, kr = 0) {
        const ctx = this.ctx;
        const mode = gameModeManager.getMode();
        const x = UI.HP_BAR_X;
        const y = UI.HP_BAR_Y;
        
        // Draw HP name sprite if available (Undertale)
        if (mode === GAME_MODES.UNDERTALE) {
            const hpNameImg = spriteManager.getSprite(this.hpNameSprite);
            if (hpNameImg && hpNameImg.complete) {
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(hpNameImg, x - 5, y - 25, 100, 30);
            } else {
                // Fallback text
                ctx.font = 'bold 16px Determination Mono, monospace';
                ctx.fillStyle = COLORS.TEXT_YELLOW;
                ctx.fillText('HP', x, y);
            }
        } else {
            // Deltarune style - draw player name and HP/Max HP
            ctx.font = 'bold 14px Determination Mono, monospace';
            ctx.fillStyle = COLORS.TEXT_WHITE;
            ctx.fillText('Kris', x - 5, y - 10);
        }
        
        // Draw HP bar background
        const barWidth = UI.HP_BAR_WIDTH;
        const barHeight = UI.HP_BAR_HEIGHT;
        const barX = mode === GAME_MODES.UNDERTALE ? x + UI.HP_BAR_OFFSET : x + 50;
        
        ctx.fillStyle = mode === GAME_MODES.UNDERTALE ? COLORS.HP_BAR_BACKGROUND : '#800000';
        ctx.fillRect(barX, y - 14, barWidth, barHeight);
        
        // Draw HP bar border
        ctx.strokeStyle = COLORS.TEXT_WHITE;
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, y - 14, barWidth, barHeight);
        
        // Draw HP bar fill
        const hpPercent = Math.max(0, Math.min(1, hp / maxHp));
        const colors = gameModeManager.getColors();
        ctx.fillStyle = colors.hpFill;
        ctx.fillRect(barX + 2, y - 12, (barWidth - 4) * hpPercent, barHeight - 4);
        
        // Draw KARMA (purple overlay) for Undertale
        if (kr > 0 && mode === GAME_MODES.UNDERTALE) {
            const krPercent = Math.min(1, kr / maxHp);
            ctx.fillStyle = COLORS.KARMA_OVERLAY;
            ctx.fillRect(barX + 2, y - 12, (barWidth - 4) * krPercent, barHeight - 4);
        }
        
        // Draw HP numbers
        ctx.fillStyle = COLORS.TEXT_WHITE;
        ctx.font = '16px Determination Mono, monospace';
        const currentHP = Math.max(0, Math.floor(hp));
        ctx.fillText(`${currentHP} / ${maxHp}`, barX + barWidth + 10, y);
        
        // Draw KR indicator if present
        if (kr > 0 && mode === GAME_MODES.UNDERTALE) {
            ctx.fillStyle = COLORS.TEXT_PINK;
            ctx.fillText(` KR`, barX + barWidth + 120, y);
        }
    }
    
    /**
     * Draw TP bar (Deltarune only)
     * @param {number} tp - Current TP (0-100)
     * @param {number} maxTp - Maximum TP (usually 100)
     */
    drawTPBar(tp = 0, maxTp = 100) {
        const mode = gameModeManager.getMode();
        if (mode !== GAME_MODES.DELTARUNE) return;
        
        const ctx = this.ctx;
        const x = UI.HP_BAR_X + 250;
        const y = UI.HP_BAR_Y;
        const barWidth = 80;
        const barHeight = UI.HP_BAR_HEIGHT;
        
        // Draw "TP" text
        ctx.font = 'bold 14px Determination Mono, monospace';
        ctx.fillStyle = COLORS.TEXT_WHITE;
        ctx.fillText('TP', x, y - 10);
        
        // Draw TP bar background (dark orange)
        ctx.fillStyle = '#804000';
        ctx.fillRect(x, y - 14, barWidth, barHeight);
        
        // Draw TP bar border
        ctx.strokeStyle = COLORS.TEXT_WHITE;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y - 14, barWidth, barHeight);
        
        // Draw TP bar fill (orange)
        const tpPercent = Math.max(0, Math.min(1, tp / maxTp));
        const colors = gameModeManager.getColors();
        ctx.fillStyle = colors.tp || '#ff8800';
        ctx.fillRect(x + 2, y - 12, (barWidth - 4) * tpPercent, barHeight - 4);
        
        // Draw TP percentage
        ctx.fillStyle = COLORS.TEXT_WHITE;
        ctx.font = '14px Determination Mono, monospace';
        ctx.fillText(`${Math.floor(tp)}%`, x + barWidth + 10, y);
    }
    
    /**
     * Draw enemy name display
     * @param {string} name - Enemy name
     * @param {number} hp - Enemy HP (optional)
     */
    drawEnemyName(name, hp = null) {
        const ctx = this.ctx;
        const mode = gameModeManager.getMode();
        
        ctx.font = 'bold 18px Determination Mono, monospace';
        ctx.fillStyle = COLORS.TEXT_WHITE;
        ctx.textAlign = 'left';
        
        if (mode === GAME_MODES.UNDERTALE) {
            ctx.fillText(`★ ${name}`, UI.ENEMY_NAME_X, UI.ENEMY_NAME_Y);
        } else {
            // Deltarune style - show enemy name with * prefix
            ctx.fillText(`* ${name}`, UI.ENEMY_NAME_X, UI.ENEMY_NAME_Y);
        }
        
        if (hp !== null) {
            ctx.font = '14px Determination Mono, monospace';
            ctx.fillStyle = COLORS.TEXT_GRAY;
            ctx.fillText(`HP: ${hp}`, UI.ENEMY_NAME_X, UI.ENEMY_HP_Y);
        }
    }
    
    /**
     * Draw battle box with proper styling for each mode
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Box width
     * @param {number} height - Box height
     */
    drawBattleBox(x, y, width, height) {
        const ctx = this.ctx;
        const mode = gameModeManager.getMode();
        
        if (mode === GAME_MODES.UNDERTALE) {
            // Undertale: Simple white border
            ctx.fillStyle = COLORS.BG_BLACK;
            ctx.fillRect(x, y, width, height);
            
            ctx.strokeStyle = COLORS.TEXT_WHITE;
            ctx.lineWidth = 5;
            ctx.strokeRect(x, y, width, height);
        } else {
            // Deltarune: Gradient border with sprites (if available)
            const battleBoxSprites = this.getBattleBoxSprites();
            
            // Draw black background
            ctx.fillStyle = COLORS.BG_BLACK;
            ctx.fillRect(x, y, width, height);
            
            // Try to use sprites for borders
            if (battleBoxSprites) {
                const cornerImg = spriteManager.getSprite(battleBoxSprites.corner);
                const horzImg = spriteManager.getSprite(battleBoxSprites.horizontal);
                const vertImg = spriteManager.getSprite(battleBoxSprites.vertical);
                
                if (cornerImg && cornerImg.complete && horzImg && horzImg.complete && vertImg && vertImg.complete) {
                    ctx.imageSmoothingEnabled = false;
                    
                    // Draw corners
                    const cornerSize = 8;
                    ctx.drawImage(cornerImg, x, y, cornerSize, cornerSize); // Top-left
                    ctx.save();
                    ctx.translate(x + width, y);
                    ctx.scale(-1, 1);
                    ctx.drawImage(cornerImg, 0, 0, cornerSize, cornerSize); // Top-right
                    ctx.restore();
                    ctx.save();
                    ctx.translate(x, y + height);
                    ctx.scale(1, -1);
                    ctx.drawImage(cornerImg, 0, 0, cornerSize, cornerSize); // Bottom-left
                    ctx.restore();
                    ctx.save();
                    ctx.translate(x + width, y + height);
                    ctx.scale(-1, -1);
                    ctx.drawImage(cornerImg, 0, 0, cornerSize, cornerSize); // Bottom-right
                    ctx.restore();
                    
                    // Draw horizontal borders
                    const horzWidth = horzImg.width;
                    for (let i = cornerSize; i < width - cornerSize; i += horzWidth) {
                        const drawWidth = Math.min(horzWidth, width - cornerSize - i);
                        ctx.drawImage(horzImg, 0, 0, drawWidth, horzImg.height, x + i, y, drawWidth, 4);
                        ctx.drawImage(horzImg, 0, 0, drawWidth, horzImg.height, x + i, y + height - 4, drawWidth, 4);
                    }
                    
                    // Draw vertical borders
                    const vertHeight = vertImg.height;
                    for (let i = cornerSize; i < height - cornerSize; i += vertHeight) {
                        const drawHeight = Math.min(vertHeight, height - cornerSize - i);
                        ctx.drawImage(vertImg, 0, 0, vertImg.width, drawHeight, x, y + i, 4, drawHeight);
                        ctx.drawImage(vertImg, 0, 0, vertImg.width, drawHeight, x + width - 4, y + i, 4, drawHeight);
                    }
                } else {
                    // Fallback: gradient border
                    ctx.strokeStyle = COLORS.TEXT_WHITE;
                    ctx.lineWidth = 5;
                    ctx.strokeRect(x, y, width, height);
                }
            } else {
                // Fallback: simple white border
                ctx.strokeStyle = COLORS.TEXT_WHITE;
                ctx.lineWidth = 5;
                ctx.strokeRect(x, y, width, height);
            }
        }
    }
    
    /**
     * Draw dialogue box
     * @param {string} text - Dialogue text
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Box width
     * @param {number} height - Box height
     */
    drawDialogueBox(text, x = UI.DIALOGUE_BOX_X, y = UI.DIALOGUE_BOX_Y, width = UI.DIALOGUE_BOX_WIDTH, height = UI.DIALOGUE_BOX_HEIGHT) {
        const ctx = this.ctx;
        
        // Draw box background
        ctx.fillStyle = COLORS.BG_BLACK;
        ctx.fillRect(x, y, width, height);
        
        // Draw white border
        ctx.strokeStyle = COLORS.TEXT_WHITE;
        ctx.lineWidth = 5;
        ctx.strokeRect(x, y, width, height);
        
        // Draw text
        ctx.fillStyle = COLORS.TEXT_WHITE;
        ctx.font = '16px Determination Mono, monospace';
        ctx.textAlign = 'left';
        
        // Word wrap
        const words = text.split(' ');
        let line = '';
        let yPos = y + 30;
        const maxWidth = width - UI.DIALOGUE_MAX_WIDTH_OFFSET;
        
        words.forEach(word => {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && line !== '') {
                ctx.fillText(line, x + UI.DIALOGUE_PADDING, yPos);
                line = word + ' ';
                yPos += UI.DIALOGUE_LINE_HEIGHT;
            } else {
                line = testLine;
            }
        });
        ctx.fillText(line, x + UI.DIALOGUE_PADDING, yPos);
    }
    
    /**
     * Check button click
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {string|null} Button name or null
     */
    checkButtonClick(x, y) {
        for (const [name, pos] of Object.entries(this.buttonLayout)) {
            if (x >= pos.x && x <= pos.x + pos.width &&
                y >= pos.y && y <= pos.y + pos.height) {
                return name;
            }
        }
        return null;
    }
    
    /**
     * Update hovered button based on mouse position
     * @param {number} x - Mouse X coordinate
     * @param {number} y - Mouse Y coordinate
     */
    updateHover(x, y) {
        this.hoveredButton = this.checkButtonClick(x, y);
    }
}
