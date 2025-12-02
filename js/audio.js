/**
 * audio.js
 * Audio manager for sound effects and music
 */

import { CONFIG } from './config.js';

/**
 * AudioManager class - Handles all audio playback
 */
export class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.enabled = CONFIG.SOUND.enabled;
        this.volume = CONFIG.SOUND.volume;
    }
    
    /**
     * Load a sound effect
     * @param {string} name - Sound identifier
     * @param {string} path - Path to audio file
     */
    loadSound(name, path) {
        try {
            const audio = new Audio(path);
            audio.volume = this.volume;
            this.sounds[name] = audio;
        } catch (error) {
            console.warn(`Failed to load sound: ${name}`, error);
        }
    }
    
    /**
     * Play a sound effect
     * @param {string} name - Sound identifier
     */
    playSound(name) {
        if (!this.enabled || !this.sounds[name]) return;
        
        try {
            const sound = this.sounds[name].cloneNode();
            sound.volume = this.volume;
            sound.play().catch(e => console.warn(`Failed to play sound: ${name}`, e));
        } catch (error) {
            console.warn(`Error playing sound: ${name}`, error);
        }
    }
    
    /**
     * Play background music
     * @param {string} path - Path to music file
     * @param {boolean} loop - Whether to loop the music
     */
    playMusic(path, loop = true) {
        if (!this.enabled) return;
        
        try {
            if (this.music) {
                this.music.pause();
            }
            
            this.music = new Audio(path);
            this.music.volume = this.volume * 0.5; // Music is quieter than SFX
            this.music.loop = loop;
            this.music.play().catch(e => console.warn('Failed to play music', e));
        } catch (error) {
            console.warn('Error playing music', error);
        }
    }
    
    /**
     * Stop background music
     */
    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
    }
    
    /**
     * Set volume for all sounds
     * @param {number} volume - Volume level (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.volume;
        });
        
        if (this.music) {
            this.music.volume = this.volume * 0.5;
        }
    }
    
    /**
     * Toggle sound on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopMusic();
        }
    }
}

// Create global audio manager instance
export const audioManager = new AudioManager();

// Optional: Load default sounds if they exist
// Developers can add their own sound files and uncomment these lines
/*
audioManager.loadSound('hit', 'sounds/hit.wav');
audioManager.loadSound('select', 'sounds/select.wav');
audioManager.loadSound('hurt', 'sounds/hurt.wav');
audioManager.loadSound('attack', 'sounds/attack.wav');
*/
