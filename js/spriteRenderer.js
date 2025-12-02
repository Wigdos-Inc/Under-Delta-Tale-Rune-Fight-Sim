/**
 * spriteRenderer.js
 * Handles rendering of sprite-based UI elements on canvas
 */

import { spriteLoader } from './spriteLoader.js';

/**
 * SpriteRenderer class - Renders sprites on canvas
 */
export class SpriteRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Animation state
        this.animationFrame = 0;
        this.lastFrameTime = 0;
        this.frameDelay = 200; // ms per frame
        
        // Damage numbers
        this.damageNumbers = [];
    }
    
    /**
     * Update animation frames
     */
    update(deltaTime) {
        this.lastFrameTime += deltaTime;
        
        if (this.lastFrameTime >= this.frameDelay) {
            this.animationFrame = (this.animationFrame + 1) % 2;
            this.lastFrameTime = 0;
        }
        
        // Update damage numbers
        this.updateDamageNumbers(deltaTime);
    }
    
    /**
     * Draw sprite at position
     * @param {string} key - Sprite key
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} scale - Scale factor (default 1)
     */
    drawSprite(key, x, y, scale = 1) {
        const sprite = spriteLoader.getSprite(key);
        if (!sprite) {
            console.warn(`Sprite not found: ${key}`);
            return;
        }
        
        const width = sprite.width * scale;
        const height = sprite.height * scale;
        
        this.ctx.save();
        this.ctx.imageSmoothingEnabled = false; // Pixel-perfect rendering
        this.ctx.drawImage(sprite, x, y, width, height);
        this.ctx.restore();
    }
    
    /**
     * Draw animated sprite (alternates between frame 0 and 1)
     * @param {string} baseKey - Base sprite key (without _0 or _1)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} scale - Scale factor
     */
    drawAnimatedSprite(baseKey, x, y, scale = 1) {
        const frameKey = `${baseKey}_${this.animationFrame}`;
        this.drawSprite(frameKey, x, y, scale);
    }
    
    /**
     * Draw centered sprite
     * @param {string} key - Sprite key
     * @param {number} centerX - Center X position
     * @param {number} centerY - Center Y position
     * @param {number} scale - Scale factor
     */
    drawCenteredSprite(key, centerX, centerY, scale = 1) {
        const sprite = spriteLoader.getSprite(key);
        if (!sprite) return;
        
        const width = sprite.width * scale;
        const height = sprite.height * scale;
        const x = centerX - width / 2;
        const y = centerY - height / 2;
        
        this.drawSprite(key, x, y, scale);
    }
    
    /**
     * Draw battle box border
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     */
    drawBattleBox(x, y, width, height) {
        const border = spriteLoader.getSprite('border');
        if (!border) {
            // Fallback to CSS-style border
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 5;
            this.ctx.strokeRect(x, y, width, height);
            return;
        }
        
        // Draw border sprite scaled to fit
        this.ctx.save();
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(border, x, y, width, height);
        this.ctx.restore();
    }
    
    /**
     * Draw battle background
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     */
    drawBattleBackground(x, y, width, height) {
        // Always use solid black background (authentic Undertale style)
        // The sprite has debug grid lines we don't want
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x, y, width, height);
    }
    
    /**
     * Draw damage number
     * @param {number} value - Damage value
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {boolean} isOrange - Use orange numbers
     */
    drawDamageNumber(value, x, y, isOrange = false) {
        const digits = value.toString().split('');
        const digitWidth = 20; // Approximate width per digit
        const totalWidth = digits.length * digitWidth;
        let offsetX = x - totalWidth / 2;
        
        digits.forEach(digit => {
            const digitValue = parseInt(digit);
            const key = isOrange ? `dmg_orange_${digitValue}` : `dmg_${digitValue}`;
            const sprite = spriteLoader.getSprite(key);
            
            if (sprite) {
                this.ctx.save();
                this.ctx.imageSmoothingEnabled = false;
                this.ctx.drawImage(sprite, offsetX, y);
                offsetX += sprite.width;
                this.ctx.restore();
            }
        });
    }
    
    /**
     * Add floating damage number animation
     * @param {number} value - Damage value
     * @param {number} x - Start X position
     * @param {number} y - Start Y position
     * @param {boolean} isOrange - Use orange numbers
     */
    addFloatingDamage(value, x, y, isOrange = false) {
        this.damageNumbers.push({
            value,
            x,
            y,
            startY: y,
            alpha: 1.0,
            lifetime: 0,
            maxLifetime: 1000, // 1 second
            isOrange
        });
    }
    
    /**
     * Update damage number animations
     * @param {number} deltaTime - Time since last update
     */
    updateDamageNumbers(deltaTime) {
        this.damageNumbers = this.damageNumbers.filter(dmg => {
            dmg.lifetime += deltaTime;
            
            // Float upward
            dmg.y = dmg.startY - (dmg.lifetime / dmg.maxLifetime) * 50;
            
            // Fade out
            dmg.alpha = 1.0 - (dmg.lifetime / dmg.maxLifetime);
            
            return dmg.lifetime < dmg.maxLifetime;
        });
    }
    
    /**
     * Render all damage numbers
     */
    renderDamageNumbers() {
        this.damageNumbers.forEach(dmg => {
            this.ctx.save();
            this.ctx.globalAlpha = dmg.alpha;
            this.drawDamageNumber(dmg.value, dmg.x, dmg.y, dmg.isOrange);
            this.ctx.restore();
        });
    }
    
    /**
     * Draw soul cursor (red heart)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} scale - Scale factor
     */
    drawSoulCursor(x, y, scale = 2) {
        this.drawAnimatedSprite('soul_red', x, y, scale);
    }
    
    /**
     * Draw button sprite
     * @param {string} buttonType - 'fight', 'act', 'item', 'mercy'
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {boolean} selected - Is button selected
     * @param {boolean} canSpare - Show yellow spare button
     */
    drawButton(buttonType, x, y, selected = false, canSpare = false) {
        const frame = selected ? 1 : 0;
        let key;
        
        switch (buttonType) {
            case 'fight':
                key = `btn_fight_${frame}`;
                break;
            case 'act':
                key = `btn_act_${frame}`;
                break;
            case 'item':
                key = `btn_item_${frame}`;
                break;
            case 'mercy':
                if (canSpare) {
                    key = `btn_spare_${frame}`;
                } else {
                    key = 'btn_mercy_0';
                }
                break;
            default:
                return;
        }
        
        this.drawSprite(key, x, y, 1);
    }
    
    /**
     * Draw dust cloud animation (enemy death)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} frame - Animation frame (0-2)
     */
    drawDustCloud(x, y, frame = 0) {
        const key = `dust_${Math.min(frame, 2)}`;
        this.drawCenteredSprite(key, x, y, 2);
    }
    
    /**
     * Draw heart break animation (game over)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} frame - Animation frame
     */
    drawHeartBreak(x, y, frame = 0) {
        if (frame === 0) {
            // Whole broken heart
            this.drawCenteredSprite('soul_break', x, y, 2);
        } else {
            // Scattered shards (simplified - all shards at once)
            for (let i = 0; i < 4; i++) {
                const key = `shard_${i}`;
                const offsetX = (i % 2) * 20 - 10;
                const offsetY = Math.floor(i / 2) * 20 - 10;
                this.drawSprite(key, x + offsetX, y + offsetY, 2);
            }
        }
    }
    
    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
