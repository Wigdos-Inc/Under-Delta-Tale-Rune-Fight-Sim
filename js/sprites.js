/**
 * sprites.js
 * Sprite loading and management system
 */

/**
 * SpriteManager class - Handles loading and caching of sprite images
 */
export class SpriteManager {
    constructor() {
        this.sprites = new Map();
        this.loadingPromises = new Map();
        this.basePath = 'data/assets/Undertale Sprites/';
    }
    
    /**
     * Load a sprite image
     * @param {string} path - Path relative to base assets folder
     * @returns {Promise<HTMLImageElement>} Loaded image
     */
    async loadSprite(path) {
        // Check if already loaded
        if (this.sprites.has(path)) {
            return this.sprites.get(path);
        }
        
        // Check if currently loading
        if (this.loadingPromises.has(path)) {
            return this.loadingPromises.get(path);
        }
        
        // Start loading
        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.sprites.set(path, img);
                this.loadingPromises.delete(path);
                resolve(img);
            };
            img.onerror = () => {
                console.error(`Failed to load sprite: ${path}`);
                this.loadingPromises.delete(path);
                reject(new Error(`Failed to load sprite: ${path}`));
            };
            img.src = this.basePath + path;
        });
        
        this.loadingPromises.set(path, promise);
        return promise;
    }
    
    /**
     * Load multiple sprites
     * @param {Array<string>} paths - Array of sprite paths
     * @returns {Promise<Array<HTMLImageElement>>} Loaded images
     */
    async loadSprites(paths) {
        return Promise.all(paths.map(path => this.loadSprite(path)));
    }
    
    /**
     * Get a loaded sprite
     * @param {string} path - Sprite path
     * @returns {HTMLImageElement|null} Sprite image or null
     */
    getSprite(path) {
        return this.sprites.get(path) || null;
    }
    
    /**
     * Check if sprite is loaded
     * @param {string} path - Sprite path
     * @returns {boolean} True if loaded
     */
    isLoaded(path) {
        return this.sprites.has(path);
    }
    
    /**
     * Draw a sprite
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} path - Sprite path
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} scale - Scale factor (default 1)
     */
    drawSprite(ctx, path, x, y, scale = 1) {
        const sprite = this.getSprite(path);
        if (sprite) {
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
            ctx.restore();
        }
    }
    
    /**
     * Draw a sprite with custom dimensions
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} path - Sprite path
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     */
    drawSpriteCustom(ctx, path, x, y, width, height) {
        const sprite = this.getSprite(path);
        if (sprite) {
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(sprite, x, y, width, height);
            ctx.restore();
        }
    }
    
    /**
     * Draw part of a sprite (for sprite sheets)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} path - Sprite path
     * @param {number} sx - Source X
     * @param {number} sy - Source Y
     * @param {number} sw - Source width
     * @param {number} sh - Source height
     * @param {number} dx - Destination X
     * @param {number} dy - Destination Y
     * @param {number} dw - Destination width
     * @param {number} dh - Destination height
     */
    drawSpritePart(ctx, path, sx, sy, sw, sh, dx, dy, dw, dh) {
        const sprite = this.getSprite(path);
        if (sprite) {
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(sprite, sx, sy, sw, sh, dx, dy, dw, dh);
            ctx.restore();
        }
    }
}

/**
 * AnimatedSprite class - Handles sprite animations
 */
export class AnimatedSprite {
    constructor(frames, frameRate = 10) {
        this.frames = frames; // Array of sprite paths
        this.frameRate = frameRate; // Frames per second
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.loop = true;
        this.playing = true;
    }
    
    /**
     * Update animation
     * @param {number} deltaTime - Time since last frame in ms
     */
    update(deltaTime = 16.67) {
        if (!this.playing) return;
        
        this.frameTimer += deltaTime;
        const frameTime = 1000 / this.frameRate;
        
        if (this.frameTimer >= frameTime) {
            this.frameTimer = 0;
            this.currentFrame++;
            
            if (this.currentFrame >= this.frames.length) {
                if (this.loop) {
                    this.currentFrame = 0;
                } else {
                    this.currentFrame = this.frames.length - 1;
                    this.playing = false;
                }
            }
        }
    }
    
    /**
     * Draw current frame
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {SpriteManager} spriteManager - Sprite manager
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} scale - Scale factor
     */
    draw(ctx, spriteManager, x, y, scale = 1) {
        const framePath = this.frames[this.currentFrame];
        spriteManager.drawSprite(ctx, framePath, x, y, scale);
    }
    
    /**
     * Reset animation to start
     */
    reset() {
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.playing = true;
    }
    
    /**
     * Get current frame path
     * @returns {string} Current frame sprite path
     */
    getCurrentFrame() {
        return this.frames[this.currentFrame];
    }
}

// Global sprite manager instance
export const spriteManager = new SpriteManager();
