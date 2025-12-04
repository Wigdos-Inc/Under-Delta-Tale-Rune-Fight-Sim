/**
 * Migosp - Small insect enemy from Ruins
 */
class Migosp extends Enemy {
  constructor() {
    super({
      name: 'Migosp',
      game: 'undertale',
      hp: 40,
      attack: 7,
      defense: 0,
      encounterText: '* Migosp crawled up!',
      checkText: 'MIGOSP - ATK 7 DEF 0\\n* A lost soul looking for another to be with.',
      dialogue: [
        '* Migosp is  looking for someone to watch over it.',
        '* Migosp is trying to get your attention.',
        '* Smells like an old old film strip.'
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
          name: 'Encourage',
          handler: (enemy) => {
            enemy.canSpare = true;
            return {
              text: '* You encourage Migosp. It feels better about itself.',
              canSpare: true
            };
          }
        },
        {
          name: 'Steal',
          handler: (enemy) => ({
            text: '* You try to steal from Migosp. It doesn\'t have much...',
            canSpare: false
          })
        }
      ]
    });
    
    this.location = 'Ruins';
  }

  /**
   * Migosp attack patterns
   */
  startAttack(battleEngine) {
    super.startAttack(battleEngine);
    
    this.currentAttackPattern = (engine, time) => {
      // Small projectiles from random edges every 600ms
      if (Math.floor(time / 600) !== Math.floor((time - 16.67) / 600)) {
        this.spawnEdgeProjectile(engine);
      }
      
      // Scatter pattern at 2s and 4s
      if ((Math.abs(time - 2000) < 50 || Math.abs(time - 4000) < 50) && time > 1950) {
        randomScatter(engine, 5, 1.5);
      }
    };
  }

  /**
   * Spawn projectile from random edge
   */
  spawnEdgeProjectile(engine) {
    const edges = ['top', 'bottom', 'left', 'right'];
    const edge = edges[Math.floor(Math.random() * edges.length)];
    
    let x, y, velocityX, velocityY;
    const targetX = engine.soul.x + engine.soul.width / 2;
    const targetY = engine.soul.y + engine.soul.height / 2;
    
    switch (edge) {
      case 'top':
        x = engine.boxX + Math.random() * engine.boxWidth;
        y = engine.boxY - 20;
        break;
      case 'bottom':
        x = engine.boxX + Math.random() * engine.boxWidth;
        y = engine.boxY + engine.boxHeight + 20;
        break;
      case 'left':
        x = engine.boxX - 20;
        y = engine.boxY + Math.random() * engine.boxHeight;
        break;
      case 'right':
        x = engine.boxX + engine.boxWidth + 20;
        y = engine.boxY + Math.random() * engine.boxHeight;
        break;
    }
    
    // Calculate direction toward soul
    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = 2;
    
    velocityX = (dx / distance) * speed;
    velocityY = (dy / distance) * speed;
    
    engine.spawnProjectile({
      x: x,
      y: y,
      width: 6,
      height: 6,
      velocityX: velocityX,
      velocityY: velocityY,
      color: 'white',
      type: 'normal',
      shape: 'circle'
    });
  }
}
