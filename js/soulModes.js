/**
 * soulModes.js
 * Different soul color/mode mechanics for various boss fights
 */

import { CONFIG } from './config.js';
import { KEYS } from './constants.js';
import { clamp } from './utils.js';

/**
 * Soul mode types
 */
export const SoulMode = {
    RED: 'red',           // Normal mode (default)
    GREEN: 'green',       // Shield mode (Undyne)
    BLUE: 'blue',         // Gravity mode (Papyrus/Sans)
    YELLOW: 'yellow',     // Gun mode (Mettaton)
    PURPLE: 'purple'      // Web/Platform mode (Muffet)
};

/**
 * Base soul mode class
 */
export class BaseSoulMode {
    constructor(soul) {
        this.soul = soul;
        this.color = '#ff0000';
        this.modeName = SoulMode.RED;
    }
    
    /**
     * Update soul behavior (override in subclasses)
     * @param {Object} input - Input manager
     * @param {Object} bounds - Battle box bounds
     */
    update(input, bounds) {
        // Default behavior - override in subclasses
    }
    
    /**
     * Draw mode-specific visuals (override in subclasses)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        // Override in subclasses if needed
    }
    
    /**
     * Called when mode is activated
     */
    onEnter() {
        // Override in subclasses
    }
    
    /**
     * Called when mode is deactivated
     */
    onExit() {
        // Override in subclasses
    }
    
    /**
     * Get current color
     */
    getColor() {
        return this.color;
    }
}

/**
 * RED MODE - Normal movement (default)
 */
export class RedMode extends BaseSoulMode {
    constructor(soul) {
        super(soul);
        this.color = '#ff0000';
        this.modeName = SoulMode.RED;
    }
    
    update(input, bounds) {
        // Standard 4-directional movement
        let dx = 0;
        let dy = 0;
        
        if (input.isAnyPressed(KEYS.MOVE_LEFT)) dx -= this.soul.speed;
        if (input.isAnyPressed(KEYS.MOVE_RIGHT)) dx += this.soul.speed;
        if (input.isAnyPressed(KEYS.MOVE_UP)) dy -= this.soul.speed;
        if (input.isAnyPressed(KEYS.MOVE_DOWN)) dy += this.soul.speed;
        
        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707; // 1/sqrt(2)
            dy *= 0.707;
        }
        
        // Update position
        this.soul.x += dx;
        this.soul.y += dy;
        
        // Track movement
        this.soul.isMoving = (dx !== 0 || dy !== 0);
        
        // Keep within bounds
        const halfSize = this.soul.size / 2;
        this.soul.x = clamp(this.soul.x, bounds.x + halfSize, bounds.x + bounds.width - halfSize);
        this.soul.y = clamp(this.soul.y, bounds.y + halfSize, bounds.y + bounds.height - halfSize);
    }
}

/**
 * GREEN MODE - Shield mode (Undyne fight)
 * Soul is locked in place, can only face 4 directions with shield
 */
export class GreenMode extends BaseSoulMode {
    constructor(soul) {
        super(soul);
        this.color = '#00ff00';
        this.modeName = SoulMode.GREEN;
        
        // Shield properties
        this.shieldDirection = 'up'; // up, down, left, right
        this.shieldAngle = -Math.PI / 2; // Angle for drawing
        this.shieldSize = 30;
        this.shieldOffset = 20;
        
        // Shield animation
        this.shieldPulse = 0;
    }
    
    update(input, bounds) {
        // Soul is locked in center, only shield rotates
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;
        this.soul.x = centerX;
        this.soul.y = centerY;
        
        // Control shield direction with arrow keys
        if (input.isAnyPressed(KEYS.MOVE_UP)) {
            this.shieldDirection = 'up';
            this.shieldAngle = -Math.PI / 2;
        } else if (input.isAnyPressed(KEYS.MOVE_DOWN)) {
            this.shieldDirection = 'down';
            this.shieldAngle = Math.PI / 2;
        } else if (input.isAnyPressed(KEYS.MOVE_LEFT)) {
            this.shieldDirection = 'left';
            this.shieldAngle = Math.PI;
        } else if (input.isAnyPressed(KEYS.MOVE_RIGHT)) {
            this.shieldDirection = 'right';
            this.shieldAngle = 0;
        }
        
        // Update shield animation
        this.shieldPulse += 0.1;
        
        this.soul.isMoving = false;
    }
    
    draw(ctx) {
        // Draw shield in front of soul
        ctx.save();
        
        const shieldX = this.soul.x + Math.cos(this.shieldAngle) * this.shieldOffset;
        const shieldY = this.soul.y + Math.sin(this.shieldAngle) * this.shieldOffset;
        
        ctx.translate(shieldX, shieldY);
        ctx.rotate(this.shieldAngle);
        
        // Shield glow
        const pulseScale = 1 + Math.sin(this.shieldPulse) * 0.1;
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.shieldSize / 2 * pulseScale, -this.shieldSize / 2 * pulseScale, 
                     this.shieldSize * pulseScale, this.shieldSize * pulseScale);
        
        // Shield main body
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.shieldSize / 2, -this.shieldSize / 2, this.shieldSize, this.shieldSize);
        
        // Shield border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.shieldSize / 2, -this.shieldSize / 2, this.shieldSize, this.shieldSize);
        
        // Shield highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(-this.shieldSize / 2 + 5, -this.shieldSize / 2 + 5, 10, 10);
        
        ctx.restore();
    }
    
    /**
     * Check if shield blocks an attack from given direction
     * @param {Object} attackObject - Attack to check
     * @returns {boolean} True if blocked
     */
    canBlockAttack(attackObject) {
        // Calculate attack angle relative to soul
        const dx = attackObject.x - this.soul.x;
        const dy = attackObject.y - this.soul.y;
        const attackAngle = Math.atan2(dy, dx);
        
        // Calculate angle difference
        let angleDiff = Math.abs(attackAngle - this.shieldAngle);
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
        
        // Block if attack is within ~90 degrees of shield direction
        return angleDiff < Math.PI / 3;
    }
}

/**
 * BLUE MODE - Gravity mode (Papyrus/Sans fight)
 * Soul has gravity and can jump
 */
export class BlueMode extends BaseSoulMode {
    constructor(soul) {
        super(soul);
        this.color = '#00a2e8';
        this.modeName = SoulMode.BLUE;
        
        // Physics properties
        this.velocityY = 0;
        this.gravity = 0.5;
        this.jumpPower = -8;
        this.maxFallSpeed = 10;
        
        // Ground detection
        this.isGrounded = false;
        this.groundY = 0;
        
        // Jump buffering
        this.jumpBufferTime = 0;
        this.jumpBufferMax = 5; // Frames
        
        // Coyote time (can jump slightly after leaving ground)
        this.coyoteTime = 0;
        this.coyoteTimeMax = 5; // Frames
    }
    
    onEnter() {
        // Set initial ground at bottom of battle box
        this.velocityY = 0;
    }
    
    update(input, bounds) {
        // Horizontal movement only
        let dx = 0;
        
        if (input.isAnyPressed(KEYS.MOVE_LEFT)) dx -= this.soul.speed;
        if (input.isAnyPressed(KEYS.MOVE_RIGHT)) dx += this.soul.speed;
        
        this.soul.x += dx;
        
        // Jump input buffering
        if (input.isAnyPressed([...KEYS.MOVE_UP, 'KeyZ', 'KeyX'])) {
            this.jumpBufferTime = this.jumpBufferMax;
        }
        if (this.jumpBufferTime > 0) this.jumpBufferTime--;
        
        // Apply gravity
        this.velocityY += this.gravity;
        if (this.velocityY > this.maxFallSpeed) {
            this.velocityY = this.maxFallSpeed;
        }
        
        this.soul.y += this.velocityY;
        
        // Ground collision (bottom of battle box)
        this.groundY = bounds.y + bounds.height - this.soul.size / 2;
        if (this.soul.y >= this.groundY) {
            this.soul.y = this.groundY;
            this.velocityY = 0;
            this.isGrounded = true;
            this.coyoteTime = this.coyoteTimeMax;
        } else {
            this.isGrounded = false;
            if (this.coyoteTime > 0) this.coyoteTime--;
        }
        
        // Jump (can jump if grounded or during coyote time)
        if (this.jumpBufferTime > 0 && (this.isGrounded || this.coyoteTime > 0)) {
            this.velocityY = this.jumpPower;
            this.jumpBufferTime = 0;
            this.coyoteTime = 0;
            this.isGrounded = false;
        }
        
        // Ceiling collision
        const ceilingY = bounds.y + this.soul.size / 2;
        if (this.soul.y <= ceilingY) {
            this.soul.y = ceilingY;
            this.velocityY = 0;
        }
        
        // Keep within horizontal bounds
        const halfSize = this.soul.size / 2;
        this.soul.x = clamp(this.soul.x, bounds.x + halfSize, bounds.x + bounds.width - halfSize);
        
        // Track movement
        this.soul.isMoving = (dx !== 0 || this.velocityY !== 0);
    }
    
    draw(ctx) {
        // Draw subtle ground line when grounded
        if (this.isGrounded) {
            ctx.save();
            ctx.strokeStyle = this.color;
            ctx.globalAlpha = 0.3;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.soul.x - 15, this.groundY + this.soul.size / 2);
            ctx.lineTo(this.soul.x + 15, this.groundY + this.soul.size / 2);
            ctx.stroke();
            ctx.restore();
        }
    }
}

/**
 * YELLOW MODE - Gun mode (Mettaton fight)
 * Soul can shoot projectiles with Z/X
 */
export class YellowMode extends BaseSoulMode {
    constructor(soul) {
        super(soul);
        this.color = '#ffff00';
        this.modeName = SoulMode.YELLOW;
        
        // Gun properties
        this.bullets = [];
        this.bulletSpeed = 8;
        this.bulletSize = 6;
        this.fireRate = 10; // Frames between shots
        this.fireCooldown = 0;
        
        // Aiming
        this.aimDirection = 'up'; // up, down, left, right
    }
    
    update(input, bounds) {
        // Normal 4-directional movement
        let dx = 0;
        let dy = 0;
        
        if (input.isAnyPressed(KEYS.MOVE_LEFT)) {
            dx -= this.soul.speed;
            this.aimDirection = 'left';
        }
        if (input.isAnyPressed(KEYS.MOVE_RIGHT)) {
            dx += this.soul.speed;
            this.aimDirection = 'right';
        }
        if (input.isAnyPressed(KEYS.MOVE_UP)) {
            dy -= this.soul.speed;
            this.aimDirection = 'up';
        }
        if (input.isAnyPressed(KEYS.MOVE_DOWN)) {
            dy += this.soul.speed;
            this.aimDirection = 'down';
        }
        
        // Normalize diagonal
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }
        
        this.soul.x += dx;
        this.soul.y += dy;
        
        // Keep within bounds
        const halfSize = this.soul.size / 2;
        this.soul.x = clamp(this.soul.x, bounds.x + halfSize, bounds.x + bounds.width - halfSize);
        this.soul.y = clamp(this.soul.y, bounds.y + halfSize, bounds.y + bounds.height - halfSize);
        
        // Fire cooldown
        if (this.fireCooldown > 0) this.fireCooldown--;
        
        // Shoot with Z or X
        if (input.isAnyPressed(['KeyZ', 'KeyX']) && this.fireCooldown === 0) {
            this.shoot();
            this.fireCooldown = this.fireRate;
        }
        
        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            
            // Remove if out of bounds
            return bullet.x >= bounds.x - 50 && bullet.x <= bounds.x + bounds.width + 50 &&
                   bullet.y >= bounds.y - 50 && bullet.y <= bounds.y + bounds.height + 50;
        });
        
        this.soul.isMoving = (dx !== 0 || dy !== 0);
    }
    
    shoot() {
        let vx = 0, vy = 0;
        
        switch (this.aimDirection) {
            case 'up': vy = -this.bulletSpeed; break;
            case 'down': vy = this.bulletSpeed; break;
            case 'left': vx = -this.bulletSpeed; break;
            case 'right': vx = this.bulletSpeed; break;
        }
        
        this.bullets.push({
            x: this.soul.x,
            y: this.soul.y,
            vx: vx,
            vy: vy,
            size: this.bulletSize
        });
    }
    
    draw(ctx) {
        // Draw all bullets
        ctx.fillStyle = this.color;
        this.bullets.forEach(bullet => {
            ctx.fillRect(bullet.x - bullet.size / 2, bullet.y - bullet.size / 2, 
                        bullet.size, bullet.size);
        });
        
        // Draw aim indicator
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 2;
        
        const aimLength = 20;
        const aimOffset = 15;
        
        ctx.beginPath();
        switch (this.aimDirection) {
            case 'up':
                ctx.moveTo(this.soul.x, this.soul.y - aimOffset);
                ctx.lineTo(this.soul.x, this.soul.y - aimOffset - aimLength);
                break;
            case 'down':
                ctx.moveTo(this.soul.x, this.soul.y + aimOffset);
                ctx.lineTo(this.soul.x, this.soul.y + aimOffset + aimLength);
                break;
            case 'left':
                ctx.moveTo(this.soul.x - aimOffset, this.soul.y);
                ctx.lineTo(this.soul.x - aimOffset - aimLength, this.soul.y);
                break;
            case 'right':
                ctx.moveTo(this.soul.x + aimOffset, this.soul.y);
                ctx.lineTo(this.soul.x + aimOffset + aimLength, this.soul.y);
                break;
        }
        ctx.stroke();
        ctx.restore();
    }
    
    /**
     * Get all bullets for collision checking
     */
    getBullets() {
        return this.bullets;
    }
    
    /**
     * Remove a bullet (called when it hits enemy)
     */
    removeBullet(bullet) {
        const index = this.bullets.indexOf(bullet);
        if (index > -1) {
            this.bullets.splice(index, 1);
        }
    }
}

/**
 * PURPLE MODE - Web/Platform mode (Muffet fight)
 * Soul can move along lines/platforms only
 */
export class PurpleMode extends BaseSoulMode {
    constructor(soul) {
        super(soul);
        this.color = '#ff00ff';
        this.modeName = SoulMode.PURPLE;
        
        // Platform lines
        this.lines = [];
        this.currentLine = null;
        this.positionOnLine = 0; // 0-1 position along current line
        
        // Movement along line
        this.lineSpeed = 3;
    }
    
    onEnter() {
        // Create default horizontal lines (3 lines across battle box)
        // These can be dynamically changed during battle
    }
    
    /**
     * Set the web lines that the soul can move on
     * @param {Array} lines - Array of line objects {x1, y1, x2, y2}
     */
    setLines(lines) {
        this.lines = lines;
        if (lines.length > 0 && !this.currentLine) {
            this.currentLine = lines[0];
            this.positionOnLine = 0.5; // Start in middle
        }
    }
    
    update(input, bounds) {
        if (!this.currentLine) return;
        
        // Move along current line
        let movement = 0;
        if (input.isAnyPressed(KEYS.MOVE_LEFT)) movement -= this.lineSpeed;
        if (input.isAnyPressed(KEYS.MOVE_RIGHT)) movement += this.lineSpeed;
        
        // Calculate line length and direction
        const dx = this.currentLine.x2 - this.currentLine.x1;
        const dy = this.currentLine.y2 - this.currentLine.y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        // Update position along line
        this.positionOnLine += movement / length;
        this.positionOnLine = clamp(this.positionOnLine, 0, 1);
        
        // Calculate actual position
        this.soul.x = this.currentLine.x1 + dx * this.positionOnLine;
        this.soul.y = this.currentLine.y1 + dy * this.positionOnLine;
        
        // Switch lines with up/down
        if (input.isAnyPressed(KEYS.MOVE_UP)) {
            const currentIndex = this.lines.indexOf(this.currentLine);
            if (currentIndex > 0) {
                this.currentLine = this.lines[currentIndex - 1];
                // Try to maintain horizontal position
            }
        }
        if (input.isAnyPressed(KEYS.MOVE_DOWN)) {
            const currentIndex = this.lines.indexOf(this.currentLine);
            if (currentIndex < this.lines.length - 1) {
                this.currentLine = this.lines[currentIndex + 1];
            }
        }
        
        this.soul.isMoving = (movement !== 0);
    }
    
    draw(ctx) {
        // Draw all lines
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 3;
        
        this.lines.forEach(line => {
            ctx.beginPath();
            ctx.moveTo(line.x1, line.y1);
            ctx.lineTo(line.x2, line.y2);
            ctx.stroke();
        });
        
        // Highlight current line
        if (this.currentLine) {
            ctx.globalAlpha = 0.6;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(this.currentLine.x1, this.currentLine.y1);
            ctx.lineTo(this.currentLine.x2, this.currentLine.y2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}
