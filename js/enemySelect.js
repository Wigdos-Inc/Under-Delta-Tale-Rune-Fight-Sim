/**
 * enemySelect.js
 * Enemy selection menu for choosing which enemy/boss to fight
 */

import { gameModeManager, GAME_MODES } from './gameMode.js';

export class EnemySelectMenu {
    constructor() {
        this.undertaleEnemies = [
            // RUINS
            { category: "Ruins", name: "Dummy", path: "data/enemies/dummy.json" },
            { category: "Ruins", name: "Froggit", path: "data/enemies/froggit.json" },
            { category: "Ruins", name: "Whimsun", path: "data/enemies/whimsun.json" },
            { category: "Ruins", name: "Moldsmal", path: "data/enemies/moldsmal.json" },
            { category: "Ruins", name: "Loox", path: "data/enemies/loox.json" },
            { category: "Ruins", name: "Vegetoid", path: "data/enemies/vegetoid.json" },
            { category: "Ruins", name: "Migosp", path: "data/enemies/migosp.json" },
            { category: "Ruins", name: "Napstablook", path: "data/enemies/napstablook.json" },
            { category: "Ruins (Boss)", name: "Toriel", path: "data/enemies/bosses/toriel.json" },
            
            // RUINS - HARD MODE
            { category: "Ruins (Hard Mode)", name: "Parsnik", path: "data/enemies/parsnik.json" },
            { category: "Ruins (Hard Mode)", name: "Moldessa", path: "data/enemies/moldessa.json" },
            { category: "Ruins (Hard Mode)", name: "Migospel", path: "data/enemies/migospel.json" },
            
            // SNOWDIN
            { category: "Snowdin", name: "Snowdrake", path: "data/enemies/snowdrake.json" },
            { category: "Snowdin", name: "Chilldrake", path: "data/enemies/chilldrake.json" },
            { category: "Snowdin", name: "Ice Cap", path: "data/enemies/icecap.json" },
            { category: "Snowdin", name: "Gyftrot", path: "data/enemies/gyftrot.json" },
            { category: "Snowdin", name: "Jerry", path: "data/enemies/jerry.json" },
            { category: "Snowdin", name: "Doggo", path: "data/enemies/doggo.json" },
            { category: "Snowdin", name: "Dogamy & Dogaressa", path: "data/enemies/dogamy_dogaressa.json" },
            { category: "Snowdin", name: "Lesser Dog", path: "data/enemies/lesser_dog.json" },
            { category: "Snowdin", name: "Greater Dog", path: "data/enemies/greater_dog.json" },
            { category: "Snowdin", name: "Glyde", path: "data/enemies/glyde.json" },
            { category: "Snowdin (Boss)", name: "Papyrus", path: "data/enemies/bosses/papyrus.json" },
            
            // WATERFALL
            { category: "Waterfall", name: "Aaron", path: "data/enemies/aaron.json" },
            { category: "Waterfall", name: "Woshua", path: "data/enemies/woshua.json" },
            { category: "Waterfall", name: "Moldbygg", path: "data/enemies/moldbygg.json" },
            { category: "Waterfall", name: "Shyren", path: "data/enemies/shyren.json" },
            { category: "Waterfall", name: "Temmie", path: "data/enemies/temmie.json" },
            { category: "Waterfall (Boss)", name: "Mad Dummy", path: "data/enemies/mad_dummy.json" },
            { category: "Waterfall (Boss)", name: "Undyne", path: "data/enemies/bosses/undyne.json" },
            
            // HOTLAND
            { category: "Hotland", name: "Vulkin", path: "data/enemies/vulkin.json" },
            { category: "Hotland", name: "Tsunderplane", path: "data/enemies/tsunderplane.json" },
            { category: "Hotland", name: "Pyrope", path: "data/enemies/pyrope.json" },
            { category: "Hotland", name: "Royal Guards", path: "data/enemies/royal_guards.json" },
            { category: "Hotland", name: "So Sorry", path: "data/enemies/so_sorry.json" },
            { category: "Hotland (Boss)", name: "Muffet", path: "data/enemies/muffet.json" },
            { category: "Hotland (Boss)", name: "Mettaton EX", path: "data/enemies/bosses/mettaton.json" },
            
            // CORE
            { category: "Core", name: "Final Froggit", path: "data/enemies/final_froggit.json" },
            { category: "Core", name: "Whimsalot", path: "data/enemies/whimsalot.json" },
            { category: "Core", name: "Astigmatism", path: "data/enemies/astigmatism.json" },
            { category: "Core", name: "Knight Knight", path: "data/enemies/knight_knight.json" },
            { category: "Core", name: "Madjick", path: "data/enemies/madjick.json" },
            
            // FINAL BOSSES
            { category: "Final Bosses", name: "Asgore", path: "data/enemies/bosses/asgore.json" },
            { category: "Final Bosses", name: "Flowey", path: "data/enemies/bosses/flowey.json" },
            { category: "Final Bosses", name: "Asriel Dreemurr", path: "data/enemies/bosses/asriel.json" },
            { category: "Final Bosses", name: "Sans", path: "data/enemies/bosses/sans.json" }
        ];
        
        this.deltaruneEnemies = [
            // CHAPTER 1
            { category: "Chapter 1", name: "Rudinn", path: "data/enemies/deltarune/rudinn.json" },
            { category: "Chapter 1", name: "Hathy", path: "data/enemies/deltarune/hathy.json" },
            { category: "Chapter 1", name: "Jigsawry", path: "data/enemies/deltarune/jigsawry.json" },
            { category: "Chapter 1", name: "Ponman", path: "data/enemies/deltarune/ponman.json" },
            { category: "Chapter 1", name: "Bloxer", path: "data/enemies/deltarune/bloxer.json" },
            { category: "Chapter 1", name: "Starwalker", path: "data/enemies/deltarune/starwalker.json" },
            { category: "Chapter 1 (Boss)", name: "Jevil", path: "data/enemies/deltarune/bosses/jevil.json" },
            { category: "Chapter 1 (Boss)", name: "King", path: "data/enemies/deltarune/bosses/king.json" },
            
            // CHAPTER 2
            { category: "Chapter 2", name: "Virovirokun", path: "data/enemies/deltarune/virovirokun.json" },
            { category: "Chapter 2", name: "Ambyu-Lance", path: "data/enemies/deltarune/ambyu_lance.json" },
            { category: "Chapter 2", name: "Werewire", path: "data/enemies/deltarune/werewire.json" },
            { category: "Chapter 2", name: "Tasque", path: "data/enemies/deltarune/tasque.json" },
            { category: "Chapter 2", name: "Maus", path: "data/enemies/deltarune/maus.json" },
            { category: "Chapter 2", name: "Swatchling", path: "data/enemies/deltarune/swatchling.json" },
            { category: "Chapter 2 (Boss)", name: "Spamton NEO", path: "data/enemies/deltarune/bosses/spamton_neo.json" },
            { category: "Chapter 2 (Boss)", name: "Queen", path: "data/enemies/deltarune/bosses/queen.json" },
            { category: "Chapter 2 (Boss)", name: "Tasque Manager", path: "data/enemies/deltarune/bosses/tasque_manager.json" },
            { category: "Chapter 2 (Boss)", name: "Sweet Cap'n Cakes", path: "data/enemies/deltarune/bosses/sweet_capn_cakes.json" }
        ];
        
        this.selectedIndex = 0;
        this.isActive = false;
        this.onSelectCallback = null;
    }
    
    getEnemyList() {
        return gameModeManager.getMode() === GAME_MODES.UNDERTALE ? 
            this.undertaleEnemies : this.deltaruneEnemies;
    }
    
    /**
     * Show the enemy selection menu
     * @param {Function} onSelect - Callback when enemy is selected
     * @param {string} dataPath - Base path for enemy data (optional)
     */
    show(onSelect, dataPath) {
        this.isActive = true;
        this.onSelectCallback = onSelect;
        this.render();
    }
    
    /**
     * Hide the menu
     */
    hide() {
        this.isActive = false;
        const menu = document.getElementById('enemy-select-menu');
        if (menu) {
            menu.style.display = 'none';
        }
    }
    
    /**
     * Render the menu
     */
    render() {
        // Create menu container if it doesn't exist
        let menu = document.getElementById('enemy-select-menu');
        if (!menu) {
            menu = document.createElement('div');
            menu.id = 'enemy-select-menu';
            menu.className = 'enemy-select-menu';
            document.body.appendChild(menu);
        }
        
        menu.style.display = 'block';
        
        // Build menu HTML
        let html = '<div class="enemy-select-header">';
        html += '<h2>SELECT YOUR OPPONENT</h2>';
        html += '<p>Choose an enemy or boss to fight</p>';
        html += '</div>';
        
        html += '<div class="enemy-select-content">';
        
        // Get enemies based on current game mode
        const enemies = this.getEnemyList();
        
        // Group by category
        const categories = {};
        enemies.forEach(enemy => {
            if (!categories[enemy.category]) {
                categories[enemy.category] = [];
            }
            categories[enemy.category].push(enemy);
        });
        
        // Render each category
        for (const [category, categoryEnemies] of Object.entries(categories)) {
            html += `<div class="enemy-category">`;
            html += `<h3>${category}</h3>`;
            html += `<div class="enemy-list">`;
            
            categoryEnemies.forEach((enemy, index) => {
                const globalIndex = enemies.indexOf(enemy);
                const isSelected = globalIndex === this.selectedIndex;
                html += `<button class="enemy-item ${isSelected ? 'selected' : ''}" data-index="${globalIndex}">`;
                html += enemy.name;
                html += '</button>';
            });
            
            html += '</div></div>';
        }
        
        html += '</div>';
        
        menu.innerHTML = html;
        
        // Add click handlers
        menu.querySelectorAll('.enemy-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.selectEnemy(index);
            });
        });
    }
    
    /**
     * Select an enemy
     * @param {number} index - Enemy index
     */
    selectEnemy(index) {
        this.selectedIndex = index;
        const enemies = this.getEnemyList();
        const enemy = enemies[index];
        
        if (this.onSelectCallback) {
            this.hide();
            this.onSelectCallback(enemy.path);
        }
    }
}

export const enemySelectMenu = new EnemySelectMenu();
