/**
 * Whimsun - Timid insect enemy from Ruins
 */
class Whimsun extends Enemy {
  constructor() {
    super({
      name: 'Whimsun',
      game: 'undertale',
      hp: 10, // Very fragile
      attack: 2,
      defense: 0,
      encounterText: '* Whimsun approached meekly!',
      checkText: 'WHIMSUN - ATK 2 DEF 0\\n* This monster is too sensitive to fight...',
      dialogue: [
        '* Whimsun is thinking about its attack...',
        '* Whimsun is trying to muster courage...',
        '* The smell of cotton candy fills the air.'
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
          name: 'Console',
          handler: (enemy) => {
            enemy.canSpare = true;
            return {
              text: '* You console Whimsun. It appreciates the sentiment.',
              canSpare: true
            };
          }
        },
        {
          name: 'Spare',
          handler: (enemy) => {
            // Can always spare immediately
            return {
              text: '* Whimsun is too timid to fight.',
              canSpare: true
            };
          }
        }
      ]
    });
    
    this.location = 'Ruins';
    this.canSpare = true; // Can spare immediately
    this.ringAngle = 0;
  }

  /**
   * Whimsun attack patterns
   */
  startAttack(battleEngine) {
    super.startAttack(battleEngine);
    this.ringAngle = 0;
    
    this.currentAttackPattern = (engine, time) => {
      // Rotating ring of butterflies around soul
      const ringRadius = 60;
      const butterflies = 8;
      const rotationSpeed = 0.02;
      
      this.ringAngle += rotationSpeed;
      
      // Spawn butterflies in rotating pattern (every 100ms to create continuous ring)
      if (Math.floor(time / 100) !== Math.floor((time - 16.67) / 100)) {
        for (let i = 0; i < butterflies; i++) {
          const angle = this.ringAngle + (Math.PI * 2 * i / butterflies);
          const soulX = engine.soul.x + engine.soul.width / 2;
          const soulY = engine.soul.y + engine.soul.height / 2;
          
          engine.spawnProjectile({
            x: soulX + Math.cos(angle) * ringRadius - 4,
            y: soulY + Math.sin(angle) * ringRadius - 4,
            width: 8,
            height: 8,
            velocityX: 0,
            velocityY: 0,
            color: 'white',
            type: 'normal',
            shape: 'circle'
          });
        }
      }
      
      // Vertical columns occasionally
      if (time > 2000 && Math.floor(time / 1200) !== Math.floor((time - 16.67) / 1200)) {
        this.spawnColumn(engine);
      }
    };
  }

  /**
   * Spawn vertical column of insects
   */
  spawnColumn(engine) {
    const x = engine.boxX + 50 + Math.random() * (engine.boxWidth - 100);
    const count = 5;
    
    for (let i = 0; i < count; i++) {
      engine.spawnProjectile({
        x: x,
        y: engine.boxY - 20 - (i * 15),
        width: 8,
        height: 8,
        velocityX: 0,
        velocityY: 1.5,
        color: 'white',
        type: 'normal',
        shape: 'circle'
      });
    }
  }
}
