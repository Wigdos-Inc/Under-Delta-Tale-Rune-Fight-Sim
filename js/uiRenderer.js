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
        
        // Button positions (Undertale layout - centered and evenly spaced)
        this.buttonLayout = {
            fight: { x: 32, y: UI.BUTTON_LAYOUT_Y, width: UI.BUTTON_WIDTH, height: UI.BUTTON_HEIGHT },
            act: { x: 185, y: UI.BUTTON_LAYOUT_Y, width: UI.BUTTON_WIDTH, height: UI.BUTTON_HEIGHT },
            item: { x: 345, y: UI.BUTTON_LAYOUT_Y, width: UI.BUTTON_WIDTH, height: UI.BUTTON_HEIGHT },
            mercy: { x: 500, y: UI.BUTTON_LAYOUT_Y, width: UI.BUTTON_WIDTH, height: UI.BUTTON_HEIGHT }
        };
        
        this.selectedButton = null;
        this.hoveredButton = null;
        
        // Animation
        this.soulBounce = 0;
        this.soulBounceDir = 1;
        
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
                fight: `${basePath}/spr_fight_button_0.png`,
                fightHover: `${basePath}/spr_fight_button_1.png`,
                act: `${basePath}/spr_act_button_0.png`,
                actHover: `${basePath}/spr_act_button_1.png`,
                item: `${basePath}/spr_item_button_0.png`,
                itemHover: `${basePath}/spr_item_button_1.png`,
                mercy: `${basePath}/spr_mercy_button_0.png`,
                spare: `${basePath}/spr_spare_button_0.png`,
                spareHover: `${basePath}/spr_spare_button_1.png`
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
        
        if (mode === GAME_MODES.UNDERTALE) {
            return {
                corner: 'Undertale Sprites/Battle/UI/Battle Box/spr_battlebox_0.png',
                horizontal: 'Undertale Sprites/Battle/UI/Battle Box/spr_battlebox_1.png',
                vertical: 'Undertale Sprites/Battle/UI/Battle Box/spr_battlebox_2.png'
            };
        } else {
            return {
                corner: 'Deltarune Sprites/UI/Battle/Battle Box/Ch1/spr_battlebox_corner_0.png',
                horizontal: 'Deltarune Sprites/UI/Battle/Battle Box/Ch1/spr_battlebox_horizontal_0.png',
                vertical: 'Deltarune Sprites/UI/Battle/Battle Box/Ch1/spr_battlebox_vertical_0.png'
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
            ...Object.values(battleBoxSprites)
        ];
        
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
        const x = UI.HP_BAR_X;
        const y = UI.HP_BAR_Y;
        
        // Draw "HP" text (yellow)
        ctx.font = 'bold 16px Determination Mono, monospace';
        ctx.fillStyle = COLORS.TEXT_YELLOW;
        ctx.fillText('HP', x, y);
        
        // Draw HP bar background (red)
        const barWidth = UI.HP_BAR_WIDTH;
        const barHeight = UI.HP_BAR_HEIGHT;
        ctx.fillStyle = COLORS.HP_BAR_BACKGROUND;
        ctx.fillRect(x + UI.HP_BAR_OFFSET, y - 14, barWidth, barHeight);
        
        // Draw HP bar border
        ctx.strokeStyle = COLORS.HP_BAR_BORDER;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + UI.HP_BAR_OFFSET, y - 14, barWidth, barHeight);
        
        // Draw HP bar fill (yellow)
        const hpPercent = Math.max(0, Math.min(1, hp / maxHp));
        ctx.fillStyle = COLORS.HP_BAR_FULL;
        ctx.fillRect(x + UI.HP_BAR_OFFSET + 2, y - 12, (barWidth - 4) * hpPercent, barHeight - 4);
        
        // Draw KARMA (purple overlay)
        if (kr > 0) {
            const krPercent = Math.min(1, kr / maxHp);
            ctx.fillStyle = COLORS.KARMA_OVERLAY;
            ctx.fillRect(x + UI.HP_BAR_OFFSET + 2, y - 12, (barWidth - 4) * krPercent, barHeight - 4);
        }
        
        // Draw HP numbers (white)
        ctx.fillStyle = COLORS.TEXT_WHITE;
        ctx.font = '16px Determination Mono, monospace';
        const currentHP = Math.max(0, Math.floor(hp));
        ctx.fillText(`${currentHP} / ${maxHp}`, x + barWidth + UI.HP_TEXT_OFFSET, y);
        
        // Draw KR indicator if present
        if (kr > 0) {
            ctx.fillStyle = COLORS.TEXT_PINK;
            ctx.fillText(` KR`, x + barWidth + 120, y);
        }
    }
    
    /**
     * Draw enemy name display
     * @param {string} name - Enemy name
     * @param {number} hp - Enemy HP (optional)
     */
    drawEnemyName(name, hp = null) {
        const ctx = this.ctx;
        ctx.font = 'bold 18px Determination Mono, monospace';
        ctx.fillStyle = COLORS.TEXT_WHITE;
        ctx.textAlign = 'left';
        ctx.fillText(`★ ${name}`, UI.ENEMY_NAME_X, UI.ENEMY_NAME_Y);
        
        if (hp !== null) {
            ctx.font = '14px Determination Mono, monospace';
            ctx.fillStyle = COLORS.TEXT_GRAY;
            ctx.fillText(`HP: ${hp}`, UI.ENEMY_NAME_X, UI.ENEMY_HP_Y);
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
