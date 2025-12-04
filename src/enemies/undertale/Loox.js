/**
 * Loox - Eyeball enemy from Ruins
 */
class Loox extends Enemy {
  constructor() {
    super({
      name: 'Loox',
      game: 'undertale',
      hp: 50,
      attack: 6,
      defense: 0,
      encounterText: '* Loox drew near!',
      checkText: 'LOOX - ATK 6 DEF 0\\n* Don\'t pick on him. Family name is Eyewalker.',
      dialogue: [
        '* Loox stares at you.',
        '* Loox is wandering around nervously.',
        '* It\'s self-conscious about its eye.'
      ],
      lowHPDialogue: [
        '* Loox is flaking apart.',
        '* Loox\'s eyeball is shaking.'
      ],
      acts: [
        {
          name: 'Check',
          handler: (enemy) => ({
            text: enemy.checkText,
            canSpare: false
          })
        },
        {
          name: 'Pick On',
          handler: (enemy) => {
            if (enemy.hp < enemy.maxHP * 0.3) {
              enemy.canSpare = true;
              return {
                text: '* You pick on Loox. It can\'t do anything...',
                canSpare: true
              };
            }
            return {
              text: '* You rudely lecture Loox about staring at people.',
              canSpare: false
            };
          }
        },
        {
          name: 'Don\'t Pick On',
          handler: (enemy) => {
            if (enemy.hp < enemy.maxHP * 0.3) {
              enemy.canSpare = true;
              return {
                text: '* You don\'t pick on Loox. It seems appreciative.',
                canSpare: true
              };
            }
            return {
              text: '* You show respect to Loox.',
              canSpare: false
            };
          }
        }
      ]
    });
    
    this.location = 'Ruins';
  }

  /**
   * Loox attack patterns
   */
  startAttack(battleEngine) {
    super.startAttack(battleEngine);
    
    this.currentAttackPattern = (engine, time) => {
      // Bouncing orbs every 800ms
      if (Math.floor(time / 800) !== Math.floor((time - 16.67) / 800)) {
        this.spawnBouncingOrb(engine);
      }
      
      // Wiggle trail every 1500ms
      if (time > 1000 && Math.floor(time / 1500) !== Math.floor((time - 16.67) / 1500)) {
        this.spawnWiggleTrail(engine);
      }
    };
  }

  /**
   * Spawn bouncing orb with physics
   */
  spawnBouncingOrb(engine) {
    const startX = engine.boxX + Math.random() * engine.boxWidth;
    const startY = engine.boxY - 20;
    
    const projectile = engine.spawnProjectile({
      x: startX,
      y: startY,
      width: 12,
      height: 12,
      velocityX: (Math.random() - 0.5) * 4,
      velocityY: 3,
      color: 'white',
      type: 'normal',
      shape: 'circle',
      damage: 2
    });
    
    // Add bounce physics
    if (projectile) {
      const originalUpdate = projectile.update.bind(projectile);
      projectile.update = function(deltaTime) {
        // Check for wall bounces
        if (this.x <= engine.boxX || this.x + this.width >= engine.boxX + engine.boxWidth) {
          this.velocityX *= -1;
          this.x = Math.max(engine.boxX, Math.min(this.x, engine.boxX + engine.boxWidth - this.width));
        }
        
        // Check for floor/ceiling bounces
        if (this.y <= engine.boxY || this.y + this.height >= engine.boxY + engine.boxHeight) {
          this.velocityY *= -1;
          this.y = Math.max(engine.boxY, Math.min(this.y, engine.boxY + engine.boxHeight - this.height));
        }
        
        originalUpdate(deltaTime);
      };
    }
  }

  /**
   * Spawn wiggle trail moving horizontally
   */
  spawnWiggleTrail(engine) {
    const count = 10;
    const y = engine.boxY + 20 + Math.random() * (engine.boxHeight - 40);
    const direction = Math.random() > 0.5 ? 1 : -1;
    const startX = direction > 0 ? engine.boxX - 30 : engine.boxX + engine.boxWidth + 30;
    
    for (let i = 0; i < count; i++) {
      const projectile = engine.spawnProjectile({
        x: startX + (direction * i * 15),
        y: y,
        width: 8,
        height: 8,
        velocityX: direction * 2,
        velocityY: 0,
        color: 'white',
        type: 'normal',
        shape: 'circle'
      });
      
      // Add sine wave motion
      if (projectile) {
        projectile.waveTime = i * 0.5;
        projectile.waveAmplitude = 20;
        projectile.baseY = y;
        
        const originalUpdate = projectile.update.bind(projectile);
        projectile.update = function(deltaTime) {
          this.waveTime += deltaTime * 0.1;
          this.y = this.baseY + Math.sin(this.waveTime) * this.waveAmplitude;
          originalUpdate(deltaTime);
        };
      }
    }
  }
}
