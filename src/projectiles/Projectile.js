/**
 * Projectile class for enemy attacks
 */
class Projectile {
  constructor() {
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.color = 'white';
    this.type = 'normal'; // normal, blue, orange, green
    this.shape = 'rect'; // rect, circle
    this.damage = 1;
    this.sprite = null;
  }

  /**
   * Initialize projectile with properties
   */
  init(properties) {
    this.active = true;
    this.x = properties.x || 0;
    this.y = properties.y || 0;
    this.width = properties.width || 10;
    this.height = properties.height || 10;
    this.velocityX = properties.velocityX || 0;
    this.velocityY = properties.velocityY || 0;
    this.color = properties.color || 'white';
    this.type = properties.type || 'normal';
    this.shape = properties.shape || 'rect';
    this.damage = properties.damage || 1;
    this.sprite = properties.sprite || null;
  }

  /**
   * Update projectile position
   */
  update(deltaTime) {
    if (!this.active) return;

    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
  }

  /**
   * Check if projectile is outside battle box
   */
  isOutOfBounds(boxX, boxY, boxWidth, boxHeight) {
    const padding = 50; // Extra padding before deactivating
    return (
      this.x + this.width < boxX - padding ||
      this.x > boxX + boxWidth + padding ||
      this.y + this.height < boxY - padding ||
      this.y > boxY + boxHeight + padding
    );
  }

  /**
   * Check collision with soul
   */
  checkCollision(soulX, soulY, soulWidth, soulHeight) {
    if (!this.active) return false;

    if (this.shape === 'circle') {
      // Circle collision (use center points)
      const radius = this.width / 2;
      const centerX = this.x + radius;
      const centerY = this.y + radius;
      const soulCenterX = soulX + soulWidth / 2;
      const soulCenterY = soulY + soulHeight / 2;
      
      const distance = Math.sqrt(
        Math.pow(centerX - soulCenterX, 2) + 
        Math.pow(centerY - soulCenterY, 2)
      );
      
      return distance < radius + (soulWidth / 2);
    } else {
      // Rectangle collision (AABB)
      return (
        this.x < soulX + soulWidth &&
        this.x + this.width > soulX &&
        this.y < soulY + soulHeight &&
        this.y + this.height > soulY
      );
    }
  }

  /**
   * Check if soul is within graze distance (for Deltarune)
   */
  checkGraze(soulX, soulY, soulWidth, soulHeight, grazeDistance = 10) {
    if (!this.active) return false;

    const expandedX = this.x - grazeDistance;
    const expandedY = this.y - grazeDistance;
    const expandedWidth = this.width + grazeDistance * 2;
    const expandedHeight = this.height + grazeDistance * 2;

    return (
      expandedX < soulX + soulWidth &&
      expandedX + expandedWidth > soulX &&
      expandedY < soulY + soulHeight &&
      expandedY + expandedHeight > soulY &&
      !this.checkCollision(soulX, soulY, soulWidth, soulHeight)
    );
  }

  /**
   * Render projectile
   */
  render(ctx) {
    if (!this.active) return;

    if (this.sprite) {
      // Render sprite if available
      ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    } else {
      // Render colored shape
      ctx.fillStyle = this.color;
      
      if (this.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(
          this.x + this.width / 2,
          this.y + this.height / 2,
          this.width / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      } else {
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
    }
  }

  /**
   * Deactivate projectile
   */
  deactivate() {
    this.active = false;
  }
}
