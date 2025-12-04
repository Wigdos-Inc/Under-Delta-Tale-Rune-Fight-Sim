/**
 * Base Enemy class
 */
class Enemy {
  constructor(config) {
    this.name = config.name;
    this.game = config.game; // 'undertale' or 'deltarune'
    this.hp = config.hp;
    this.maxHP = config.hp;
    this.attack = config.attack || 5;
    this.defense = config.defense || 0;
    
    // Dialogue
    this.encounterText = config.encounterText || `* ${this.name} appeared!`;
    this.checkText = config.checkText || `* ${this.name}`;
    this.dialogue = config.dialogue || [`...`];
    this.lowHPDialogue = config.lowHPDialogue || this.dialogue;
    
    // ACT options
    this.acts = config.acts || [];
    this.canSpare = false;
    
    // Attack pattern
    this.attackPatterns = config.attackPatterns || [];
    this.currentPattern = 0;
    this.attackTimer = 0;
    
    // Sprite
    this.sprite = config.sprite || null;
    this.spriteX = 320;
    this.spriteY = 100;
    this.spriteWidth = 100;
    this.spriteHeight = 100;
  }

  /**
   * Start attack phase
   */
  startAttack(battleEngine) {
    this.attackTimer = 0;
    this.battleEngine = battleEngine;
    
    // Select attack pattern
    if (this.attackPatterns.length > 0) {
      const pattern = this.attackPatterns[this.currentPattern % this.attackPatterns.length];
      this.currentAttackPattern = pattern;
      this.currentPattern++;
    }
  }

  /**
   * Update attack (called every frame during defend phase)
   */
  updateAttack(battleEngine, deltaTime) {
    this.attackTimer += deltaTime * 16.67; // Convert to milliseconds
    
    if (this.currentAttackPattern) {
      this.currentAttackPattern(battleEngine, this.attackTimer);
    }
  }

  /**
   * Handle ACT action
   */
  handleAct(action) {
    const act = this.acts.find(a => a.name === action);
    
    if (act && act.handler) {
      return act.handler(this);
    }
    
    return {
      text: `* You did something.`,
      canSpare: false
    };
  }

  /**
   * Check action
   */
  getCheckText() {
    return this.checkText;
  }

  /**
   * Get random dialogue
   */
  getDialogue() {
    const dialogueArray = this.hp < this.maxHP * 0.3 ? this.lowHPDialogue : this.dialogue;
    return dialogueArray[Math.floor(Math.random() * dialogueArray.length)];
  }

  /**
   * Render enemy sprite
   */
  render(ctx) {
    if (this.sprite) {
      ctx.drawImage(
        this.sprite,
        this.spriteX - this.spriteWidth / 2,
        this.spriteY,
        this.spriteWidth,
        this.spriteHeight
      );
    } else {
      // Placeholder rectangle if no sprite
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(
        this.spriteX - this.spriteWidth / 2,
        this.spriteY,
        this.spriteWidth,
        this.spriteHeight
      );
      
      // Draw name
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.name, this.spriteX, this.spriteY + this.spriteHeight + 20);
    }
  }
}

// Attack pattern helper functions

/**
 * Spawn projectile in circular pattern
 */
function circularPattern(battleEngine, count, radius, speed, startAngle = 0) {
  const centerX = battleEngine.boxX + battleEngine.boxWidth / 2;
  const centerY = battleEngine.boxY + battleEngine.boxHeight / 2;
  
  for (let i = 0; i < count; i++) {
    const angle = startAngle + (Math.PI * 2 * i / count);
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    battleEngine.spawnProjectile({
      x: x,
      y: y,
      width: 10,
      height: 10,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      color: 'white',
      type: 'normal'
    });
  }
}

/**
 * Spawn projectiles from edge
 */
function edgePattern(battleEngine, edge, count, speed) {
  const box = {
    x: battleEngine.boxX,
    y: battleEngine.boxY,
    width: battleEngine.boxWidth,
    height: battleEngine.boxHeight
  };
  
  for (let i = 0; i < count; i++) {
    let x, y, velocityX, velocityY;
    
    switch (edge) {
      case 'top':
        x = box.x + (box.width / (count + 1)) * (i + 1);
        y = box.y - 20;
        velocityX = 0;
        velocityY = speed;
        break;
      case 'bottom':
        x = box.x + (box.width / (count + 1)) * (i + 1);
        y = box.y + box.height + 20;
        velocityX = 0;
        velocityY = -speed;
        break;
      case 'left':
        x = box.x - 20;
        y = box.y + (box.height / (count + 1)) * (i + 1);
        velocityX = speed;
        velocityY = 0;
        break;
      case 'right':
        x = box.x + box.width + 20;
        y = box.y + (box.height / (count + 1)) * (i + 1);
        velocityX = -speed;
        velocityY = 0;
        break;
    }
    
    battleEngine.spawnProjectile({
      x: x,
      y: y,
      width: 10,
      height: 10,
      velocityX: velocityX,
      velocityY: velocityY,
      color: 'white',
      type: 'normal'
    });
  }
}

/**
 * Random scatter pattern
 */
function randomScatter(battleEngine, count, speed) {
  const box = {
    x: battleEngine.boxX,
    y: battleEngine.boxY,
    width: battleEngine.boxWidth,
    height: battleEngine.boxHeight
  };
  
  for (let i = 0; i < count; i++) {
    const x = box.x + Math.random() * box.width;
    const y = box.y + Math.random() * box.height;
    const angle = Math.random() * Math.PI * 2;
    
    battleEngine.spawnProjectile({
      x: x,
      y: y,
      width: 8,
      height: 8,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      color: 'white',
      type: 'normal',
      shape: 'circle'
    });
  }
}
