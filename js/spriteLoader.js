/**
 * spriteLoader.js
 * Loads and manages Undertale sprite assets
 */

/**
 * Sprite paths configuration
 */
export const SPRITE_PATHS = {
    // Base path
    BASE: 'data/assets/Undertale Sprites/',
    
    // Soul sprites
    SOUL: {
        RED_0: 'Battle/UI/Soul/spr_heart_0.png',
        RED_1: 'Battle/UI/Soul/spr_heart_1.png',
        BLUE_0: 'Battle/UI/Soul/spr_heartblue_0.png',
        BLUE_1: 'Battle/UI/Soul/spr_heartblue_1.png',
        GREEN_0: 'Battle/UI/Soul/spr_heartgreen_0.png',
        GREEN_1: 'Battle/UI/Soul/spr_heartgreen_1.png',
        YELLOW_0: 'Battle/UI/Soul/spr_heartyellow_0.png',
        YELLOW_1: 'Battle/UI/Soul/spr_heartyellow_1.png',
        PURPLE_0: 'Battle/UI/Soul/spr_heartpurple_0.png',
        PURPLE_1: 'Battle/UI/Soul/spr_heartpurple_1.png',
        ORANGE_0: 'Battle/UI/Soul/spr_heartorange_0.png',
        ORANGE_1: 'Battle/UI/Soul/spr_heartorange_1.png',
        BREAK: 'Battle/UI/Soul/spr_heartbreak_0.png',
        SHARDS: ['Battle/UI/Soul/spr_heartshards_0.png',
                 'Battle/UI/Soul/spr_heartshards_1.png',
                 'Battle/UI/Soul/spr_heartshards_2.png',
                 'Battle/UI/Soul/spr_heartshards_3.png']
    },
    
    // Button sprites
    BUTTONS: {
        FIGHT_0: 'Battle/UI/Buttons/spr_fightbt_0.png',
        FIGHT_1: 'Battle/UI/Buttons/spr_fightbt_1.png',
        ACT_0: 'Battle/UI/Buttons/spr_actbt_center_0.png',
        ACT_1: 'Battle/UI/Buttons/spr_actbt_center_1.png',
        ITEM_0: 'Battle/UI/Buttons/spr_itembt_0.png',
        ITEM_1: 'Battle/UI/Buttons/spr_itembt_1.png',
        MERCY_0: 'Battle/UI/Buttons/spr_mercybutton_normal_0.png',
        SPARE_0: 'Battle/UI/Buttons/spr_sparebt_0.png',
        SPARE_1: 'Battle/UI/Buttons/spr_sparebt_1.png',
        SPARE_YELLOW_0: 'Battle/UI/Buttons/spr_sparebt_bandage_0.png',
        SPARE_YELLOW_1: 'Battle/UI/Buttons/spr_sparebt_bandage_1.png'
    },
    
    // Damage numbers
    DAMAGE: {
        NUMBERS: [
            'Battle/UI/Damage/spr_dmgnum_0.png',
            'Battle/UI/Damage/spr_dmgnum_1.png',
            'Battle/UI/Damage/spr_dmgnum_2.png',
            'Battle/UI/Damage/spr_dmgnum_3.png',
            'Battle/UI/Damage/spr_dmgnum_4.png',
            'Battle/UI/Damage/spr_dmgnum_5.png',
            'Battle/UI/Damage/spr_dmgnum_6.png',
            'Battle/UI/Damage/spr_dmgnum_7.png',
            'Battle/UI/Damage/spr_dmgnum_8.png',
            'Battle/UI/Damage/spr_dmgnum_9.png'
        ],
        NUMBERS_ORANGE: [
            'Battle/UI/Damage/spr_dmgnum_o_0.png',
            'Battle/UI/Damage/spr_dmgnum_o_1.png',
            'Battle/UI/Damage/spr_dmgnum_o_2.png',
            'Battle/UI/Damage/spr_dmgnum_o_3.png',
            'Battle/UI/Damage/spr_dmgnum_o_4.png',
            'Battle/UI/Damage/spr_dmgnum_o_5.png',
            'Battle/UI/Damage/spr_dmgnum_o_6.png',
            'Battle/UI/Damage/spr_dmgnum_o_7.png',
            'Battle/UI/Damage/spr_dmgnum_o_8.png',
            'Battle/UI/Damage/spr_dmgnum_o_9.png'
        ],
        MISS: 'Battle/UI/Damage/spr_dmgmiss_o_0.png'
    },
    
    // Battle UI
    BATTLE_UI: {
        BORDER: 'Battle/UI/spr_border_0.png',
        HP_NAME: 'Battle/UI/spr_hpname_0.png',
        BACKGROUND: 'Battle/UI/BG/spr_battlebg_0.png',
        TARGET: 'Battle/UI/Attack/spr_target_0.png',
        DUST_CLOUD: [
            'Battle/UI/spr_dustcloud_0.png',
            'Battle/UI/spr_dustcloud_1.png',
            'Battle/UI/spr_dustcloud_2.png'
        ]
    },
    
    // Effects
    EFFECTS: {
        EXCLAMATION_0: 'Battle/UI/spr_exclamationpoint_0.png',
        EXCLAMATION_1: 'Battle/UI/spr_exclamationpoint_1.png'
    }
};

/**
 * SpriteLoader class - Manages sprite loading and caching
 */
export class SpriteLoader {
    constructor() {
        this.sprites = new Map();
        this.loading = new Map();
        this.loadedCount = 0;
        this.totalCount = 0;
    }
    
    /**
     * Load a single sprite
     * @param {string} key - Unique key for the sprite
     * @param {string} path - Path to sprite image
     * @returns {Promise<Image>}
     */
    loadSprite(key, path) {
        // Return cached sprite if already loaded
        if (this.sprites.has(key)) {
            return Promise.resolve(this.sprites.get(key));
        }
        
        // Return existing loading promise if already loading
        if (this.loading.has(key)) {
            return this.loading.get(key);
        }
        
        // Create new loading promise
        const loadPromise = new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.sprites.set(key, img);
                this.loading.delete(key);
                this.loadedCount++;
                console.log(`Loaded sprite: ${key} (${this.loadedCount}/${this.totalCount})`);
                resolve(img);
            };
            
            img.onerror = () => {
                this.loading.delete(key);
                console.error(`Failed to load sprite: ${key} at ${path}`);
                reject(new Error(`Failed to load sprite: ${key}`));
            };
            
            img.src = SPRITE_PATHS.BASE + path;
        });
        
        this.loading.set(key, loadPromise);
        this.totalCount++;
        return loadPromise;
    }
    
    /**
     * Load multiple sprites
     * @param {Object} spriteMap - Map of keys to paths
     * @returns {Promise<void>}
     */
    async loadSprites(spriteMap) {
        const promises = [];
        
        for (const [key, path] of Object.entries(spriteMap)) {
            if (Array.isArray(path)) {
                // Load array of sprites (animations)
                path.forEach((p, index) => {
                    promises.push(this.loadSprite(`${key}_${index}`, p));
                });
            } else {
                promises.push(this.loadSprite(key, path));
            }
        }
        
        await Promise.all(promises);
    }
    
    /**
     * Load all essential sprites for battle
     * @returns {Promise<void>}
     */
    async loadBattleSprites() {
        console.log('Loading battle sprites...');
        
        const essentialSprites = {
            // Soul sprites (red heart)
            'soul_red_0': SPRITE_PATHS.SOUL.RED_0,
            'soul_red_1': SPRITE_PATHS.SOUL.RED_1,
            'soul_break': SPRITE_PATHS.SOUL.BREAK,
            
            // Button sprites
            'btn_fight_0': SPRITE_PATHS.BUTTONS.FIGHT_0,
            'btn_fight_1': SPRITE_PATHS.BUTTONS.FIGHT_1,
            'btn_act_0': SPRITE_PATHS.BUTTONS.ACT_0,
            'btn_act_1': SPRITE_PATHS.BUTTONS.ACT_1,
            'btn_item_0': SPRITE_PATHS.BUTTONS.ITEM_0,
            'btn_item_1': SPRITE_PATHS.BUTTONS.ITEM_1,
            'btn_mercy_0': SPRITE_PATHS.BUTTONS.MERCY_0,
            'btn_spare_0': SPRITE_PATHS.BUTTONS.SPARE_0,
            'btn_spare_1': SPRITE_PATHS.BUTTONS.SPARE_1,
            
            // Battle UI
            'border': SPRITE_PATHS.BATTLE_UI.BORDER,
            'hp_name': SPRITE_PATHS.BATTLE_UI.HP_NAME,
            'background': SPRITE_PATHS.BATTLE_UI.BACKGROUND,
            'target': SPRITE_PATHS.BATTLE_UI.TARGET
        };
        
        // Load damage numbers
        SPRITE_PATHS.DAMAGE.NUMBERS.forEach((path, index) => {
            essentialSprites[`dmg_${index}`] = path;
        });
        
        SPRITE_PATHS.DAMAGE.NUMBERS_ORANGE.forEach((path, index) => {
            essentialSprites[`dmg_orange_${index}`] = path;
        });
        
        // Load dust clouds
        SPRITE_PATHS.BATTLE_UI.DUST_CLOUD.forEach((path, index) => {
            essentialSprites[`dust_${index}`] = path;
        });
        
        // Load heart shards
        SPRITE_PATHS.SOUL.SHARDS.forEach((path, index) => {
            essentialSprites[`shard_${index}`] = path;
        });
        
        await this.loadSprites(essentialSprites);
        
        console.log(`All battle sprites loaded! (${this.loadedCount} total)`);
    }
    
    /**
     * Get a loaded sprite
     * @param {string} key - Sprite key
     * @returns {Image|null}
     */
    getSprite(key) {
        return this.sprites.get(key) || null;
    }
    
    /**
     * Check if a sprite is loaded
     * @param {string} key - Sprite key
     * @returns {boolean}
     */
    hasSprite(key) {
        return this.sprites.has(key);
    }
    
    /**
     * Get loading progress
     * @returns {number} - Progress from 0 to 1
     */
    getProgress() {
        return this.totalCount > 0 ? this.loadedCount / this.totalCount : 0;
    }
    
    /**
     * Check if all sprites are loaded
     * @returns {boolean}
     */
    isComplete() {
        return this.loadedCount === this.totalCount && this.totalCount > 0;
    }
}

// Create singleton instance
export const spriteLoader = new SpriteLoader();
