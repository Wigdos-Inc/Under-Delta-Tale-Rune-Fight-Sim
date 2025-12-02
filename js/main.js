/**
 * main.js
 * Entry point - initializes and runs the game loop
 */

import { Battle } from './battle.js';
import { enemySelectMenu } from './enemySelect.js';
import { MenuUI } from './menuUI.js';
import { gameModeManager } from './gameMode.js';
import { spriteLoader } from './spriteLoader.js';

/**
 * Game class - Main game controller
 */
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.battle = new Battle(this.canvas);
        this.menuUI = new MenuUI(this.canvas);
        this.lastTime = 0;
        this.running = false;
        this.gameState = 'loading'; // 'loading', 'menu', 'battle', 'enemy_select'
        this.spritesLoaded = false;
        
        // Setup menu callback
        this.menuUI.setStartGameCallback(() => this.showEnemySelect());
    }
    
    /**
     * Initialize the game
     */
    async init() {
        console.log('Initializing Under Delta Tale - Rune Fight Simulator');
        
        // Load sprites first
        this.gameState = 'loading';
        this.showLoadingScreen();
        
        try {
            await spriteLoader.loadBattleSprites();
            console.log('All sprites loaded successfully!');
            this.spritesLoaded = true;
            
            // Start with main menu
            this.gameState = 'menu';
        } catch (error) {
            console.error('Error loading sprites:', error);
            // Continue anyway with text fallbacks
            this.gameState = 'menu';
        }
        
        this.startGameLoop();
    }
    
    /**
     * Show loading screen
     */
    showLoadingScreen() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '32px "Determination Mono", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Loading sprites...', this.canvas.width / 2, this.canvas.height / 2);
    }
    
    /**
     * Show enemy selection menu
     */
    showEnemySelect() {
        this.gameState = 'enemy_select';
        const dataPath = gameModeManager.getDataPath();
        enemySelectMenu.show((enemyPath) => {
            console.log('Starting battle with:', enemyPath);
            this.startBattle(enemyPath);
        }, dataPath);
    }
    
    /**
     * Start a battle with selected enemy
     * @param {string} enemyPath - Path to enemy JSON
     */
    startBattle(enemyPath) {
        this.gameState = 'battle';
        this.battle.startBattle(enemyPath);
    }
    
    /**
     * Start game loop
     */
    startGameLoop() {
        if (!this.running) {
            this.running = true;
            this.lastTime = performance.now();
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
    
    /**
     * Main game loop
     * @param {number} currentTime - Current timestamp
     */
    gameLoop(currentTime) {
        if (!this.running) return;
        
        // Calculate delta time
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update game state
        this.update(deltaTime);
        
        // Render
        this.render();
        
        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    /**
     * Update game state
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        if (this.gameState === 'loading') {
            // Update loading progress display
            const progress = spriteLoader.getProgress();
            if (spriteLoader.isComplete()) {
                this.gameState = 'menu';
            }
        } else if (this.gameState === 'menu') {
            this.menuUI.update();
        } else if (this.gameState === 'battle') {
            this.battle.update();
        }
    }
    
    /**
     * Render game
     */
    render() {
        if (this.gameState === 'loading') {
            this.showLoadingScreen();
            
            // Show progress
            const progress = spriteLoader.getProgress();
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '20px "Determination Mono", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                `${Math.floor(progress * 100)}%`, 
                this.canvas.width / 2, 
                this.canvas.height / 2 + 40
            );
        } else if (this.gameState === 'menu') {
            this.menuUI.draw();
        } else if (this.gameState === 'battle') {
            this.battle.draw();
        }
        // enemy_select state uses HTML overlay
    }
    
    /**
     * Stop the game
     */
    stop() {
        this.running = false;
    }
    
    /**
     * Return to main menu
     */
    returnToMenu() {
        this.gameState = 'menu';
        enemySelectMenu.hide();
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
    
    // Make game accessible globally for debugging
    window.game = game;
});
