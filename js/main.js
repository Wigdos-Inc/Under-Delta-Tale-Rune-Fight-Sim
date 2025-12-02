/**
 * main.js
 * Entry point - initializes and runs the game loop
 */

import { Battle } from './battle.js';

/**
 * Game class - Main game controller
 */
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.battle = new Battle(this.canvas);
        this.lastTime = 0;
        this.running = false;
    }
    
    /**
     * Initialize the game
     */
    init() {
        console.log('Initializing Under Delta Tale - Rune Fight Simulator');
        
        // Start battle with default enemy
        this.battle.startBattle('data/enemies/test_enemy.json');
        
        // Start game loop
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
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
        this.battle.update();
    }
    
    /**
     * Render game
     */
    render() {
        this.battle.draw();
    }
    
    /**
     * Stop the game
     */
    stop() {
        this.running = false;
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
    
    // Make game accessible globally for debugging
    window.game = game;
});
