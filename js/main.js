/**
 * main.js
 * Entry point - initializes and runs the game loop
 */

import { Battle } from './battle.js';
import { enemySelectMenu } from './enemySelect.js';
import { MenuUI } from './menuUI.js';
import { gameModeManager } from './gameMode.js';

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
        this.gameState = 'menu'; // 'menu', 'battle', 'enemy_select'
        
        // Setup menu callback
        this.menuUI.setStartGameCallback(() => this.showEnemySelect());
    }
    
    /**
     * Initialize the game
     */
    init() {
        console.log('Initializing Under Delta Tale - Rune Fight Simulator');
        
        // Start with main menu
        this.gameState = 'menu';
        this.startGameLoop();
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
        if (this.gameState === 'menu') {
            this.menuUI.update();
        } else if (this.gameState === 'battle') {
            this.battle.update();
        }
    }
    
    /**
     * Render game
     */
    render() {
        if (this.gameState === 'menu') {
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
