/**
 * Froggit - Tutorial enemy from Ruins
 */
class Froggit extends Enemy {
  constructor() {
    super({
      name: 'Froggit',
      game: 'undertale',
      hp: 30,
      attack: 4,
      defense: 1,
      encounterText: '* Froggit hopped close!',
      checkText: 'FROGGIT - ATK 4 DEF 1\\n* Life is difficult for this enemy.',
      dialogue: [
        '* Froggit doesn\'t seem to know why it\'s here.',
        '* Froggit hops to and fro.',
        '* The battlefield is filled with the smell of mustard seed.'
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
          name: 'Compliment',
          handler: (enemy) => {
            enemy.canSpare = true;
            return {
              text: '* You tell Froggit that it\'s doing a great job. It is flattered.',
              canSpare: true
            };
          }
        },
        {
          name: 'Threaten',
          handler: (enemy) => ({
            text: '* You threaten Froggit. It makes no sense.',
            canSpare: false
          })
        }
      ]
    });
    
    this.location = 'Ruins';
    this.flyTimer = 0;
  }

  /**
   * Froggit attack patterns
   */
  startAttack(battleEngine) {
    super.startAttack(battleEngine);
    this.flyTimer = 0;
    
    this.currentAttackPattern = (engine, time) => {
      // Spawn flies every 600ms
      if (Math.floor(time / 600) > Math.floor(this.flyTimer / 600)) {
        this.spawnFlies(engine);
      }
      this.flyTimer = time;
    };
  }

  /**
   * Spawn flies in downward arcs
   */
  spawnFlies(engine) {
    const count = 3;
    const startY = engine.boxY - 20;
    const startXMin = engine.boxX + 50;
    const startXMax = engine.boxX + engine.boxWidth - 50;
    
    for (let i = 0; i < count; i++) {
      const startX = startXMin + Math.random() * (startXMax - startXMin);
      const arcDirection = Math.random() > 0.5 ? 1 : -1;
      
      const projectile = engine.spawnProjectile({
        x: startX,
        y: startY,
        width: 8,
        height: 8,
        velocityX: arcDirection * 1.5,
        velocityY: 2,
        color: 'white',
        type: 'normal',
        shape: 'circle'
      });
      
      // Add arc motion (sine wave)
      if (projectile) {
        projectile.arcTime = 0;
        projectile.arcAmplitude = 30;
        projectile.arcFrequency = 0.05;
        projectile.baseVelocityX = projectile.velocityX;
        
        // Override update to add sine wave motion
        const originalUpdate = projectile.update.bind(projectile);
        projectile.update = function(deltaTime) {
          this.arcTime += deltaTime * 0.1;
          this.velocityX = this.baseVelocityX + Math.sin(this.arcTime) * this.arcAmplitude * this.arcFrequency;
          originalUpdate(deltaTime);
        };
      }
    }
  }
}
