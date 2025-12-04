/**
 * Battle Engine - Core battle system
 */
class BattleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Battle state
    this.currentEnemy = null;
    this.isActive = false;
    this.state = 'idle'; // idle, menu, attacking, defending
    this.battleStartTime = 0;
    this.attackTimer = 0;
    this.attackDuration = 5000; // 5 seconds per attack
    
    // Player stats
    this.maxHP = 92;
    this.currentHP = 92;
    this.level = 19;
    this.damageTaken = 0;
    this.invulnerabilityFrames = 0;
    this.invulnerabilityDuration = 30; // frames
    
    // Battle box
    this.boxX = 32;
    this.boxY = 245;
    this.boxWidth = 565;
    this.boxHeight = 140;
    
    // Components
    this.soul = new SoulController(this.boxX, this.boxY, this.boxWidth, this.boxHeight);
    this.projectilePool = new ProjectilePool(150);
    
    // Timing
    this.lastFrameTime = 0;
    this.fps = 60;
    this.frameDelay = 1000 / this.fps;
    
    // Input state
    this.setupInputHandlers();
  }

  /**
   * Setup keyboard and touch input handlers
   */
  setupInputHandlers() {
    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (this.state === 'defending') {
        this.soul.handleKeyDown(e.key);
      }
    });

    document.addEventListener('keyup', (e) => {
      if (this.state === 'defending') {
        this.soul.handleKeyUp(e.key);
      }
    });

    // Touch controls (to be implemented)
    // TODO: Add touch event handlers for mobile
  }

  /**
   * Start battle with enemy
   */
  startBattle(enemy) {
    this.currentEnemy = enemy;
    this.isActive = true;
    this.state = 'menu';
    this.currentHP = this.maxHP;
    this.damageTaken = 0;
    this.battleStartTime = Date.now();
    
    this.soul.reset();
    this.projectilePool.clear();
    
    // Show battle screen
    document.getElementById('enemySelection').classList.add('hidden');
    document.getElementById('battleScreen').classList.remove('hidden');
    
    // Update UI
    this.updateHPBar();
    this.showDialogue(enemy.encounterText);
    
    // Start game loop
    this.lastFrameTime = performance.now();
    this.gameLoop();
  }

  /**
   * Main game loop
   */
  gameLoop(currentTime) {
    if (!this.isActive) return;

    const deltaTime = (currentTime - this.lastFrameTime) / this.frameDelay;
    
    if (deltaTime >= 1) {
      this.update(deltaTime);
      this.render();
      this.lastFrameTime = currentTime;
    }

    requestAnimationFrame((time) => this.gameLoop(time));
  }

  /**
   * Update battle state
   */
  update(deltaTime) {
    if (this.state === 'defending') {
      // Update attack timer
      this.attackTimer += deltaTime * this.frameDelay;
      
      // Update soul
      this.soul.update();
      
      // Update projectiles
      this.projectilePool.update(deltaTime, this.boxX, this.boxY, this.boxWidth, this.boxHeight);
      
      // Check collisions
      if (this.invulnerabilityFrames <= 0) {
        const hits = this.projectilePool.checkCollisions(
          this.soul.x,
          this.soul.y,
          this.soul.width,
          this.soul.height
        );
        
        if (hits.length > 0) {
          this.handleHit(hits[0]);
        }
      } else {
        this.invulnerabilityFrames -= deltaTime;
      }
      
      // Update enemy attack pattern
      if (this.currentEnemy) {
        this.currentEnemy.updateAttack(this, deltaTime);
      }
      
      // Check if attack phase is over
      if (this.attackTimer >= this.attackDuration) {
        this.endDefendPhase();
      }
    }
  }

  /**
   * Render battle scene
   */
  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render enemy sprite (if in attacking state)
    if (this.state === 'defending' && this.currentEnemy) {
      this.currentEnemy.render(this.ctx);
    }
    
    // Render battle box
    this.renderBattleBox();
    
    // Render projectiles
    if (this.state === 'defending') {
      this.projectilePool.render(this.ctx);
      this.soul.render(this.ctx);
    }
  }

  /**
   * Render battle box
   */
  renderBattleBox() {
    // Box background
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(this.boxX, this.boxY, this.boxWidth, this.boxHeight);
    
    // Box border
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(this.boxX, this.boxY, this.boxWidth, this.boxHeight);
  }

  /**
   * Handle player hit
   */
  handleHit(hit) {
    const projectile = hit.projectile;
    
    // Handle different bullet types
    switch (projectile.type) {
      case 'normal':
        this.takeDamage(projectile.damage);
        break;
      case 'blue':
        // Blue bullets only hurt when moving
        if (this.soul.movingUp || this.soul.movingDown || 
            this.soul.movingLeft || this.soul.movingRight) {
          this.takeDamage(projectile.damage);
        }
        break;
      case 'orange':
        // Orange bullets only hurt when standing still
        if (!this.soul.movingUp && !this.soul.movingDown && 
            !this.soul.movingLeft && !this.soul.movingRight) {
          this.takeDamage(projectile.damage);
        }
        break;
      case 'green':
        // Green bullets heal
        this.heal(Math.abs(projectile.damage));
        break;
    }
    
    // Deactivate projectile after hit
    projectile.deactivate();
  }

  /**
   * Take damage
   */
  takeDamage(damage) {
    this.currentHP -= damage;
    this.damageTaken += damage;
    this.invulnerabilityFrames = this.invulnerabilityDuration;
    
    this.updateHPBar();
    
    if (this.currentHP <= 0) {
      this.currentHP = 0;
      this.gameOver();
    }
  }

  /**
   * Heal player
   */
  heal(amount) {
    this.currentHP = Math.min(this.currentHP + amount, this.maxHP);
    this.updateHPBar();
  }

  /**
   * Update HP bar UI
   */
  updateHPBar() {
    const hpPercent = (this.currentHP / this.maxHP) * 100;
    document.getElementById('hpBarFill').style.width = hpPercent + '%';
    document.getElementById('hpText').textContent = `${Math.max(0, Math.floor(this.currentHP))} / ${this.maxHP}`;
  }

  /**
   * Show dialogue text
   */
  showDialogue(text) {
    const dialogueBox = document.getElementById('dialogueBox');
    const dialogueText = document.getElementById('dialogueText');
    
    dialogueText.textContent = text;
    dialogueBox.classList.add('visible');
    
    // Hide other UI
    document.getElementById('battleButtons').style.display = 'none';
  }

  /**
   * Hide dialogue
   */
  hideDialogue() {
    document.getElementById('dialogueBox').classList.remove('visible');
  }

  /**
   * Start defend phase (enemy attack)
   */
  startDefendPhase() {
    this.state = 'defending';
    this.attackTimer = 0;
    this.projectilePool.clear();
    this.soul.reset();
    
    this.hideDialogue();
    
    // Start enemy attack pattern
    if (this.currentEnemy) {
      this.currentEnemy.startAttack(this);
    }
  }

  /**
   * End defend phase
   */
  endDefendPhase() {
    this.state = 'menu';
    this.projectilePool.clear();
    
    // Show battle buttons
    document.getElementById('battleButtons').style.display = 'flex';
    this.showDialogue('* What will you do?');
  }

  /**
   * Handle FIGHT action
   */
  handleFight() {
    // TODO: Implement FIGHT mini-game
    this.showDialogue('* FIGHT action not yet implemented.');
    setTimeout(() => this.startDefendPhase(), 2000);
  }

  /**
   * Handle ACT action
   */
  handleAct(action) {
    if (this.currentEnemy) {
      const result = this.currentEnemy.handleAct(action);
      this.showDialogue(result.text);
      
      if (result.canSpare) {
        // Enemy can be spared
        setTimeout(() => this.victory(), 2000);
      } else {
        setTimeout(() => this.startDefendPhase(), 2000);
      }
    }
  }

  /**
   * Handle ITEM action
   */
  handleItem() {
    this.showDialogue('* No items available.');
    setTimeout(() => this.startDefendPhase(), 2000);
  }

  /**
   * Handle MERCY action (spare/flee)
   */
  handleMercy(action) {
    if (action === 'spare') {
      if (this.currentEnemy && this.currentEnemy.canSpare) {
        this.victory();
      } else {
        this.showDialogue('* The enemy is not ready to be spared.');
        setTimeout(() => this.startDefendPhase(), 2000);
      }
    } else if (action === 'flee') {
      this.endBattle(false);
    }
  }

  /**
   * Victory
   */
  victory() {
    this.isActive = false;
    const completionTime = Date.now() - this.battleStartTime;
    
    // Show results
    this.showResults('VICTORY!', completionTime, this.damageTaken);
    
    // Record defeat if logged in
    if (apiClient.isAuthenticated) {
      apiClient.recordDefeat(
        this.currentEnemy.name,
        this.currentEnemy.game,
        completionTime,
        this.damageTaken
      ).then(data => {
        if (data.isNewBest) {
          document.getElementById('newBestText').classList.remove('hidden');
        }
      }).catch(err => {
        console.error('Failed to record defeat:', err);
      });
    } else {
      // Save to localStorage for guests
      this.saveGuestProgress(completionTime);
    }
  }

  /**
   * Game over
   */
  gameOver() {
    this.isActive = false;
    this.showDialogue('* You cannot give up just yet...');
    
    setTimeout(() => {
      this.showResults('GAME OVER', 0, this.damageTaken);
    }, 2000);
  }

  /**
   * Show battle results
   */
  showResults(title, time, damage) {
    document.getElementById('resultsTitle').textContent = title;
    document.getElementById('resultTime').textContent = (time / 1000).toFixed(2) + 's';
    document.getElementById('resultDamage').textContent = damage;
    document.getElementById('resultsModal').classList.remove('hidden');
  }

  /**
   * End battle
   */
  endBattle(victory) {
    this.isActive = false;
    
    // Return to menu
    document.getElementById('battleScreen').classList.add('hidden');
    document.getElementById('enemySelection').classList.remove('hidden');
  }

  /**
   * Save guest progress to localStorage
   */
  saveGuestProgress(completionTime) {
    const guestData = JSON.parse(localStorage.getItem('guestProgress') || '{}');
    
    if (!guestData[this.currentEnemy.name] || 
        completionTime < guestData[this.currentEnemy.name].time) {
      guestData[this.currentEnemy.name] = {
        time: completionTime,
        damage: this.damageTaken,
        date: new Date().toISOString()
      };
      
      localStorage.setItem('guestProgress', JSON.stringify(guestData));
      document.getElementById('newBestText').classList.remove('hidden');
    }
  }

  /**
   * Spawn projectile (called by enemy attacks)
   */
  spawnProjectile(properties) {
    return this.projectilePool.get(properties);
  }
}
