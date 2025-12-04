/**
 * Projectile pool for efficient memory management
 */
class ProjectilePool {
  constructor(poolSize = 150) {
    this.poolSize = poolSize;
    this.pool = [];
    
    // Pre-allocate projectiles
    for (let i = 0; i < poolSize; i++) {
      this.pool.push(new Projectile());
    }
  }

  /**
   * Get inactive projectile from pool
   */
  get(properties) {
    // Find first inactive projectile
    for (let projectile of this.pool) {
      if (!projectile.active) {
        projectile.init(properties);
        return projectile;
      }
    }

    // Pool exhausted, return null
    console.warn('Projectile pool exhausted! Consider increasing pool size.');
    return null;
  }

  /**
   * Update all active projectiles
   */
  update(deltaTime, boxX, boxY, boxWidth, boxHeight) {
    for (let projectile of this.pool) {
      if (projectile.active) {
        projectile.update(deltaTime);
        
        // Deactivate if out of bounds
        if (projectile.isOutOfBounds(boxX, boxY, boxWidth, boxHeight)) {
          projectile.deactivate();
        }
      }
    }
  }

  /**
   * Render all active projectiles
   */
  render(ctx) {
    for (let projectile of this.pool) {
      if (projectile.active) {
        projectile.render(ctx);
      }
    }
  }

  /**
   * Check collisions with soul
   */
  checkCollisions(soulX, soulY, soulWidth, soulHeight) {
    const hits = [];
    
    for (let projectile of this.pool) {
      if (projectile.active && projectile.checkCollision(soulX, soulY, soulWidth, soulHeight)) {
        hits.push({
          projectile: projectile,
          type: projectile.type,
          damage: projectile.damage
        });
      }
    }
    
    return hits;
  }

  /**
   * Check graze with soul (Deltarune mechanic)
   */
  checkGrazes(soulX, soulY, soulWidth, soulHeight, grazeDistance = 10) {
    const grazes = [];
    
    for (let projectile of this.pool) {
      if (projectile.active && projectile.checkGraze(soulX, soulY, soulWidth, soulHeight, grazeDistance)) {
        grazes.push(projectile);
      }
    }
    
    return grazes;
  }

  /**
   * Clear all active projectiles
   */
  clear() {
    for (let projectile of this.pool) {
      projectile.deactivate();
    }
  }

  /**
   * Get count of active projectiles
   */
  getActiveCount() {
    return this.pool.filter(p => p.active).length;
  }

  /**
   * Get count of available projectiles
   */
  getAvailableCount() {
    return this.pool.filter(p => !p.active).length;
  }
}
