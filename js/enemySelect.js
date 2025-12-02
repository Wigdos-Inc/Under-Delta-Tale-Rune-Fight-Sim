/**
 * enemySelect.js
 * Enemy selection menu for choosing which enemy/boss to fight
 */

import { gameModeManager, GAME_MODES } from './gameMode.js';

export class EnemySelectMenu {
    constructor() {
        this.undertaleEnemies = [
            // RUINS ENEMIES
            { name: 'Froggit', path: 'data/enemies/undertale/froggit.json', category: 'Ruins' },
            { name: 'Whimsun', path: 'data/enemies/undertale/whimsun.json', category: 'Ruins' },
            { name: 'Moldsmal', path: 'data/enemies/undertale/moldsmal.json', category: 'Ruins' },
            { name: 'Loox', path: 'data/enemies/undertale/loox.json', category: 'Ruins' },
            { name: 'Vegetoid', path: 'data/enemies/undertale/vegetoid.json', category: 'Ruins' },
            { name: 'Migosp', path: 'data/enemies/undertale/migosp.json', category: 'Ruins' },
            { name: 'Napstablook', path: 'data/enemies/undertale/napstablook.json', category: 'Ruins' },
            
            // SNOWDIN ENEMIES
            { name: 'Snowdrake', path: 'data/enemies/undertale/snowdrake.json', category: 'Snowdin' },
            { name: 'Ice Cap', path: 'data/enemies/undertale/icecap.json', category: 'Snowdin' },
            { name: 'Gyftrot', path: 'data/enemies/undertale/gyftrot.json', category: 'Snowdin' },
            { name: 'Doggo', path: 'data/enemies/undertale/doggo.json', category: 'Snowdin' },
            { name: 'Dogamy & Dogaressa', path: 'data/enemies/undertale/dogamy_dogaressa.json', category: 'Snowdin' },
            { name: 'Lesser Dog', path: 'data/enemies/undertale/lesserdog.json', category: 'Snowdin' },
            { name: 'Greater Dog', path: 'data/enemies/undertale/greaterdog.json', category: 'Snowdin' },
            { name: 'Jerry', path: 'data/enemies/undertale/jerry.json', category: 'Snowdin' },
            { name: 'Glyde', path: 'data/enemies/undertale/glyde.json', category: 'Snowdin' },
            
            // WATERFALL ENEMIES
            { name: 'Aaron', path: 'data/enemies/undertale/aaron.json', category: 'Waterfall' },
            { name: 'Woshua', path: 'data/enemies/undertale/woshua.json', category: 'Waterfall' },
            { name: 'Moldbygg', path: 'data/enemies/undertale/moldbygg.json', category: 'Waterfall' },
            { name: 'Temmie', path: 'data/enemies/undertale/temmie.json', category: 'Waterfall' },
            { name: 'Mad Dummy', path: 'data/enemies/undertale/maddummy.json', category: 'Waterfall' },
            { name: 'Shyren', path: 'data/enemies/undertale/shyren.json', category: 'Waterfall' },
            
            // HOTLAND ENEMIES
            { name: 'Vulkin', path: 'data/enemies/undertale/vulkin.json', category: 'Hotland' },
            { name: 'Tsunderplane', path: 'data/enemies/undertale/tsunderplane.json', category: 'Hotland' },
            { name: 'Pyrope', path: 'data/enemies/undertale/pyrope.json', category: 'Hotland' },
            { name: 'Muffet', path: 'data/enemies/undertale/muffet.json', category: 'Hotland' },
            { name: 'Royal Guards', path: 'data/enemies/undertale/royalguards.json', category: 'Hotland' },
            { name: 'So Sorry', path: 'data/enemies/undertale/sosorry.json', category: 'Hotland' },
            
            // CORE ENEMIES
            { name: 'Madjick', path: 'data/enemies/undertale/madjick.json', category: 'CORE' },
            { name: 'Knight Knight', path: 'data/enemies/undertale/knightknight.json', category: 'CORE' },
            { name: 'Final Froggit', path: 'data/enemies/undertale/finalfroggit.json', category: 'CORE' },
            { name: 'Whimsalot', path: 'data/enemies/undertale/whimsalot.json', category: 'CORE' },
            { name: 'Astigmatism', path: 'data/enemies/undertale/astigmatism.json', category: 'CORE' },
            
            // BOSSES
            { name: 'Toriel', path: 'data/enemies/undertale/bosses/toriel.json', category: 'Bosses' },
            { name: 'Papyrus', path: 'data/enemies/undertale/bosses/papyrus.json', category: 'Bosses' },
            { name: 'Undyne', path: 'data/enemies/undertale/bosses/undyne.json', category: 'Bosses' },
            { name: 'Undyne the Undying', path: 'data/enemies/undertale/bosses/undyne_undying.json', category: 'Bosses' },
            { name: 'Mettaton', path: 'data/enemies/undertale/bosses/mettaton.json', category: 'Bosses' },
            { name: 'Mettaton EX', path: 'data/enemies/undertale/bosses/mettaton_ex.json', category: 'Bosses' },
            { name: 'Mettaton NEO', path: 'data/enemies/undertale/bosses/mettaton_neo.json', category: 'Bosses' },
            { name: 'Asgore', path: 'data/enemies/undertale/bosses/asgore.json', category: 'Bosses' },
            { name: 'Photoshop Flowey', path: 'data/enemies/undertale/bosses/flowey.json', category: 'Bosses' },
            { name: 'Asriel Dreemurr', path: 'data/enemies/undertale/bosses/asriel.json', category: 'Bosses' },
            { name: 'Sans', path: 'data/enemies/undertale/bosses/sans.json', category: 'Bosses' },
            
            // TEST ENEMIES
            { name: 'Test Enemy', path: 'data/enemies/test_enemy.json', category: 'Test' },
            { name: 'Test Homing', path: 'data/enemies/undertale/test_homing.json', category: 'Test' },
            { name: 'Test Bouncing', path: 'data/enemies/undertale/test_bouncing.json', category: 'Test' },
            { name: 'Test Exploding', path: 'data/enemies/undertale/test_exploding.json', category: 'Test' },
            { name: 'Test Arc', path: 'data/enemies/undertale/test_arc.json', category: 'Test' },
            { name: 'Test Wave', path: 'data/enemies/undertale/test_wave.json', category: 'Test' },
            { name: 'Test Rotating Beam', path: 'data/enemies/undertale/test_rotating_beam.json', category: 'Test' },
            { name: 'Test Wall Attack', path: 'data/enemies/undertale/test_wall_attack.json', category: 'Test' },
            { name: 'Test Gaster Blaster', path: 'data/enemies/undertale/test_gaster_blaster.json', category: 'Test' }
        ];
        
        this.deltaruneEnemies = [
            // CHAPTER 1
            { name: 'Rudinn', path: 'data/enemies/deltarune/rudinn.json', category: 'Chapter 1' },
            { name: 'Hathy', path: 'data/enemies/deltarune/hathy.json', category: 'Chapter 1' },
            { name: 'Ponman', path: 'data/enemies/deltarune/ponman.json', category: 'Chapter 1' },
            { name: 'Jigsawry', path: 'data/enemies/deltarune/jigsawry.json', category: 'Chapter 1' },
            { name: 'C. Round', path: 'data/enemies/deltarune/cround.json', category: 'Chapter 1' },
            { name: 'K. Round', path: 'data/enemies/deltarune/kround.json', category: 'Chapter 1' },
            { name: 'Lancer', path: 'data/enemies/deltarune/bosses/lancer.json', category: 'Chapter 1 Bosses' },
            { name: 'Jevil', path: 'data/enemies/deltarune/bosses/jevil.json', category: 'Chapter 1 Bosses' },
            { name: 'King', path: 'data/enemies/deltarune/bosses/king.json', category: 'Chapter 1 Bosses' },
            
            // CHAPTER 2
            { name: 'Ambyu-Lance', path: 'data/enemies/deltarune/ambulance.json', category: 'Chapter 2' },
            { name: 'Virovirokun', path: 'data/enemies/deltarune/virovirokun.json', category: 'Chapter 2' },
            { name: 'Werewire', path: 'data/enemies/deltarune/werewire.json', category: 'Chapter 2' },
            { name: 'Tasque', path: 'data/enemies/deltarune/tasque.json', category: 'Chapter 2' },
            { name: 'Maus', path: 'data/enemies/deltarune/maus.json', category: 'Chapter 2' },
            { name: 'Spamton', path: 'data/enemies/deltarune/bosses/spamton.json', category: 'Chapter 2 Bosses' },
            { name: 'Spamton NEO', path: 'data/enemies/deltarune/bosses/spamton_neo.json', category: 'Chapter 2 Bosses' },
            { name: 'Queen', path: 'data/enemies/deltarune/bosses/queen.json', category: 'Chapter 2 Bosses' },
            { name: 'Berdly', path: 'data/enemies/deltarune/bosses/berdly.json', category: 'Chapter 2 Bosses' }
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
