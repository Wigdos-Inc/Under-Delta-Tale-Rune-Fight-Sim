/**
 * Soul Controller for player movement during battle
 */
class SoulController {
  constructor(boxX, boxY, boxWidth, boxHeight) {
    this.x = 0;
    this.y = 0;
    this.width = 16;
    this.height = 16;
    this.speed = 4; // pixels per frame at 60fps
    this.color = '#ff0000';
    this.mode = 'red'; // red, green, blue, purple
    
    // Battle box bounds
    this.boxX = boxX;
    this.boxY = boxY;
    this.boxWidth = boxWidth;
    this.boxHeight = boxHeight;
    
    // Movement state
    this.movingUp = false;
    this.movingDown = false;
    this.movingLeft = false;
    this.movingRight = false;
    
    // Blue mode (gravity)
    this.velocityY = 0;
    this.gravity = 0.5;
    this.jumpPower = -8;
    this.onGround = false;
    
    // Green mode (facing)
    this.direction = 'down'; // up, down, left, right
    
    // Purple mode (line movement)
    this.linePosition = 0; // 0-1 along the line
    this.lineSpeed = 0.02;
    
    // Initialize at center
    this.reset();
  }

  /**
   * Reset soul to center of battle box
   */
  reset() {
    this.x = this.boxX + (this.boxWidth - this.width) / 2;
    this.y = this.boxY + (this.boxHeight - this.height) / 2;
    this.velocityY = 0;
    this.onGround = false;
  }

  /**
   * Set soul mode
   */
  setMode(mode) {
    this.mode = mode;
    
    // Set color based on mode
    switch (mode) {
      case 'red':
        this.color = '#ff0000';
        break;
      case 'blue':
        this.color = '#0000ff';
        this.velocityY = 0;
        break;
      case 'green':
        this.color = '#00ff00';
        break;
      case 'purple':
        this.color = '#ff00ff';
        break;
    }
  }

  /**
   * Update soul position based on mode
   */
  update() {
    switch (this.mode) {
      case 'red':
        this.updateRedMode();
        break;
      case 'blue':
        this.updateBlueMode();
        break;
      case 'green':
        this.updateGreenMode();
        break;
      case 'purple':
        this.updatePurpleMode();
        break;
    }
  }

  /**
   * Red mode: Free 4-directional movement
   */
  updateRedMode() {
    let newX = this.x;
    let newY = this.y;

    if (this.movingUp) newY -= this.speed;
    if (this.movingDown) newY += this.speed;
    if (this.movingLeft) newX -= this.speed;
    if (this.movingRight) newX += this.speed;

    // Clamp to battle box
    this.x = Math.max(this.boxX, Math.min(newX, this.boxX + this.boxWidth - this.width));
    this.y = Math.max(this.boxY, Math.min(newY, this.boxY + this.boxHeight - this.height));
  }

  /**
   * Blue mode: Gravity-based movement
   */
  updateBlueMode() {
    let newX = this.x;

    if (this.movingLeft) newX -= this.speed;
    if (this.movingRight) newX += this.speed;

    // Apply gravity
    this.velocityY += this.gravity;
    let newY = this.y + this.velocityY;

    // Check ground collision
    if (newY + this.height >= this.boxY + this.boxHeight) {
      newY = this.boxY + this.boxHeight - this.height;
      this.velocityY = 0;
      this.onGround = true;
    } else if (newY <= this.boxY) {
      newY = this.boxY;
      this.velocityY = 0;
      this.onGround = false;
    } else {
      this.onGround = false;
    }

    // Clamp X to battle box
    this.x = Math.max(this.boxX, Math.min(newX, this.boxX + this.boxWidth - this.width));
    this.y = newY;
  }

  /**
   * Green mode: Fixed position with direction changes
   */
  updateGreenMode() {
    // Soul stays in place, only direction changes
    // Projectiles approach from current direction
  }

  /**
   * Purple mode: Line-based movement
   */
  updatePurpleMode() {
    // Move along predefined lines
    if (this.movingLeft) this.linePosition -= this.lineSpeed;
    if (this.movingRight) this.linePosition += this.lineSpeed;

    // Clamp to line bounds
    this.linePosition = Math.max(0, Math.min(1, this.linePosition));

    // Calculate position on horizontal line (can be extended for different line types)
    this.x = this.boxX + this.linePosition * (this.boxWidth - this.width);
  }

  /**
   * Jump (Blue mode)
   */
  jump() {
    if (this.mode === 'blue' && this.onGround) {
      this.velocityY = this.jumpPower;
      this.onGround = false;
    }
  }

  /**
   * Set direction (Green mode)
   */
  setDirection(direction) {
    if (this.mode === 'green') {
      this.direction = direction;
    }
  }

  /**
   * Handle key down
   */
  handleKeyDown(key) {
    switch (key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.movingUp = true;
        if (this.mode === 'green') this.setDirection('up');
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.movingDown = true;
        if (this.mode === 'green') this.setDirection('down');
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.movingLeft = true;
        if (this.mode === 'green') this.setDirection('left');
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.movingRight = true;
        if (this.mode === 'green') this.setDirection('right');
        break;
      case 'z':
      case 'Z':
      case ' ':
        this.jump();
        break;
    }
  }

  /**
   * Handle key up
   */
  handleKeyUp(key) {
    switch (key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.movingUp = false;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.movingDown = false;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.movingLeft = false;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.movingRight = false;
        break;
    }
  }

  /**
   * Render soul
   */
  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Draw outline
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Draw direction indicator for Green mode
    if (this.mode === 'green') {
      ctx.fillStyle = '#ffffff';
      const centerX = this.x + this.width / 2;
      const centerY = this.y + this.height / 2;
      const indicatorSize = 4;

      switch (this.direction) {
        case 'up':
          ctx.fillRect(centerX - indicatorSize / 2, this.y - 2, indicatorSize, 4);
          break;
        case 'down':
          ctx.fillRect(centerX - indicatorSize / 2, this.y + this.height - 2, indicatorSize, 4);
          break;
        case 'left':
          ctx.fillRect(this.x - 2, centerY - indicatorSize / 2, 4, indicatorSize);
          break;
        case 'right':
          ctx.fillRect(this.x + this.width - 2, centerY - indicatorSize / 2, 4, indicatorSize);
          break;
      }
    }
  }
}
