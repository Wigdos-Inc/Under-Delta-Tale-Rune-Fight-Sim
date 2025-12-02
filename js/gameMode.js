/**
 * gameMode.js
 * Game mode selection and configuration
 */

export const GAME_MODES = {
    UNDERTALE: 'undertale',
    DELTARUNE: 'deltarune'
};

export class GameModeManager {
    constructor() {
        this.currentMode = GAME_MODES.UNDERTALE;
        this.config = {
            [GAME_MODES.UNDERTALE]: {
                name: 'UNDERTALE',
                buttonPath: 'Undertale Sprites/Battle/UI/Buttons/',
                soulPath: 'Undertale Sprites/Battle/UI/Soul/',
                battleBoxPath: 'Undertale Sprites/Battle/UI/BG/',
                enemyPath: 'Undertale Sprites/Battle/',
                dataPath: 'data/enemies/',
                colors: {
                    primary: '#ffffff',
                    secondary: '#ffff00',
                    accent: '#ff0000'
                }
            },
            [GAME_MODES.DELTARUNE]: {
                name: 'DELTARUNE',
                buttonPath: 'Deltarune Sprites/UI/Battle/Buttons/Ch1/',
                soulPath: 'Deltarune Sprites/UI/Battle/Soul/Ch1/',
                battleBoxPath: 'Deltarune Sprites/UI/Battle/Battle Box/Ch1/',
                enemyPath: 'Deltarune Sprites/Characters/',
                dataPath: 'data/enemies/deltarune/',
                colors: {
                    primary: '#ffffff',
                    secondary: '#00ffff',
                    accent: '#ff00ff'
                }
            }
        };
    }

    setMode(mode) {
        if (this.config[mode]) {
            this.currentMode = mode;
            console.log(`Game mode set to: ${this.config[mode].name}`);
        }
    }

    getMode() {
        return this.currentMode;
    }

    getConfig() {
        return this.config[this.currentMode];
    }

    getButtonPath() {
        return this.config[this.currentMode].buttonPath;
    }

    getSoulPath() {
        return this.config[this.currentMode].soulPath;
    }

    getBattleBoxPath() {
        return this.config[this.currentMode].battleBoxPath;
    }

    getEnemyPath() {
        return this.config[this.currentMode].enemyPath;
    }

    getDataPath() {
        return this.config[this.currentMode].dataPath;
    }

    getColors() {
        return this.config[this.currentMode].colors;
    }
}

export const gameModeManager = new GameModeManager();
