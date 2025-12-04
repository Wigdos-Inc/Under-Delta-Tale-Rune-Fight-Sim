/**
 * UI Renderer for battle interface
 */
class UIRenderer {
  constructor() {
    this.elements = {
      battleButtons: document.getElementById('battleButtons'),
      actMenu: document.getElementById('actMenu'),
      mercyMenu: document.getElementById('mercyMenu'),
      dialogueBox: document.getElementById('dialogueBox')
    };
  }

  /**
   * Show battle buttons
   */
  showBattleButtons() {
    this.hideAllMenus();
    this.elements.battleButtons.style.display = 'flex';
  }

  /**
   * Hide battle buttons
   */
  hideBattleButtons() {
    this.elements.battleButtons.style.display = 'none';
  }

  /**
   * Show ACT menu with options
   */
  showActMenu(acts) {
    this.hideAllMenus();
    this.elements.actMenu.innerHTML = '';
    
    acts.forEach(act => {
      const button = document.createElement('button');
      button.className = 'menu-option';
      button.textContent = act.name;
      button.dataset.action = act.name;
      this.elements.actMenu.appendChild(button);
    });
    
    this.elements.actMenu.classList.remove('hidden');
  }

  /**
   * Show MERCY menu
   */
  showMercyMenu() {
    this.hideAllMenus();
    this.elements.mercyMenu.classList.remove('hidden');
  }

  /**
   * Hide all menus
   */
  hideAllMenus() {
    this.elements.actMenu.classList.add('hidden');
    this.elements.mercyMenu.classList.add('hidden');
  }

  /**
   * Show dialogue
   */
  showDialogue(text) {
    this.elements.dialogueBox.querySelector('#dialogueText').textContent = text;
    this.elements.dialogueBox.classList.add('visible');
  }

  /**
   * Hide dialogue
   */
  hideDialogue() {
    this.elements.dialogueBox.classList.remove('visible');
  }
}
