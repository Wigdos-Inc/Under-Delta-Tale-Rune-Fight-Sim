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
                buttonPath: 'data/assets/Undertale Sprites/Battle/UI/Buttons',
                soulPath: 'data/assets/Undertale Sprites/Battle/UI/Soul/spr_heart_0.png',
                battleBoxPath: 'data/assets/Undertale Sprites/Battle/UI',
                enemyPath: 'data/assets/Undertale Sprites/Battle',
                dataPath: 'data/enemies/',
                colors: {
                    primary: '#ffffff',
                    secondary: '#ffff00',
                    accent: '#ff0000',
                    hp: '#ff0000',
                    hpFill: '#ffff00'
                }
            },
            [GAME_MODES.DELTARUNE]: {
                name: 'DELTARUNE',
                buttonPath: 'data/assets/Deltarune Sprites/UI/Battle/Buttons/Ch1',
                soulPath: 'data/assets/Deltarune Sprites/UI/Battle/Soul/Ch1/spr_heart_0.png',
                battleBoxPath: 'data/assets/Deltarune Sprites/UI/Battle/Battle Box/Ch1',
                enemyPath: 'data/assets/Deltarune Sprites/Characters',
                dataPath: 'data/enemies/deltarune/',
                colors: {
                    primary: '#ffffff',
                    secondary: '#00ffff',
                    accent: '#ff00ff',
                    hp: '#00c000',
                    hpFill: '#ffff00',
                    tp: '#ff8800'
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
