/**
 * Moldsmal - Common slime enemy from Ruins
 */
class Moldsmal extends Enemy {
  constructor() {
    super({
      name: 'Moldsmal',
      game: 'undertale',
      hp: 50,
      attack: 6,
      defense: 0,
      encounterText: '* Moldsmal blocked the way!',
      checkText: 'MOLDSMAL - ATK 6 DEF 0\\n* Stereotypical: curvaceously attractive, but no brains.',
      dialogue: [
        '* Moldsmal is wiggling.',
        '* Moldsmal is rumbling.',
        '* The smell of lime gelatin permeates the air.'
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
          name: 'Impress',
          handler: (enemy) => {
            enemy.canSpare = true;
            return {
              text: '* You show off to Moldsmal. It gets excited!',
              canSpare: true
            };
          }
        },
        {
          name: 'Flirt',
          handler: (enemy) => {
            enemy.canSpare = true;
            return {
              text: '* You wiggle your hips. Moldsmal is slain.',
              canSpare: true
            };
          }
        }
      ]
    });
    
    this.location = 'Ruins';
  }

  /**
   * Moldsmal attack patterns
   */
  startAttack(battleEngine) {
    super.startAttack(battleEngine);
    
    this.currentAttackPattern = (engine, time) => {
      // Zigzag drops every 700ms
      if (Math.floor(time / 700) !== Math.floor((time - 16.67) / 700)) {
        this.spawnZigzagDrop(engine);
      }
      
      // Bomb pellets every 1500ms
      if (time > 1000 && Math.floor(time / 1500) !== Math.floor((time - 16.67) / 1500)) {
        this.spawnBombPellet(engine);
      }
    };
  }

  /**
   * Spawn zigzag dropping pellet
   */
  spawnZigzagDrop(engine) {
    const startX = engine.boxX + Math.random() * engine.boxWidth;
    
    const projectile = engine.spawnProjectile({
      x: startX,
      y: engine.boxY - 20,
      width: 8,
      height: 8,
      velocityX: 0,
      velocityY: 2,
      color: 'white',
      type: 'normal',
      shape: 'circle'
    });
    
    // Add zigzag motion
    if (projectile) {
      projectile.zigTime = 0;
      projectile.zigAmplitude = 2;
      
      const originalUpdate = projectile.update.bind(projectile);
      projectile.update = function(deltaTime) {
        this.zigTime += deltaTime * 0.15;
        this.velocityX = Math.sin(this.zigTime) * this.zigAmplitude;
        originalUpdate(deltaTime);
      };
    }
  }

  /**
   * Spawn bomb pellet that explodes mid-air
   */
  spawnBombPellet(engine) {
    const startX = engine.boxX + 50 + Math.random() * (engine.boxWidth - 100);
    const explodeY = engine.boxY + 40 + Math.random() * 40;
    
    const projectile = engine.spawnProjectile({
      x: startX,
      y: engine.boxY - 20,
      width: 10,
      height: 10,
      velocityX: 0,
      velocityY: 2,
      color: 'yellow',
      type: 'normal',
      shape: 'circle',
      damage: 3
    });
    
    // Add explosion logic
    if (projectile) {
      projectile.explodeY = explodeY;
      projectile.hasExploded = false;
      
      const originalUpdate = projectile.update.bind(projectile);
      projectile.update = function(deltaTime) {
        if (!this.hasExploded && this.y >= this.explodeY) {
          this.hasExploded = true;
          this.active = false; // Deactivate bomb
          
          // Spawn radial burst
          const burstCount = 8;
          for (let i = 0; i < burstCount; i++) {
            const angle = (Math.PI * 2 * i / burstCount);
            engine.spawnProjectile({
              x: this.x,
              y: this.y,
              width: 6,
              height: 6,
              velocityX: Math.cos(angle) * 2,
              velocityY: Math.sin(angle) * 2,
              color: 'white',
              type: 'normal',
              shape: 'circle',
              damage: 2
            });
          }
        }
        originalUpdate(deltaTime);
      };
    }
  }
}
