/**
 * errorHandler.js
 * Centralized error handling and logging
 */

/**
 * Error severity levels
 */
export const ErrorLevel = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical'
};

/**
 * ErrorHandler class - Manages application errors
 */
export class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100; // Keep last 100 errors
        this.onErrorCallbacks = [];
    }
    
    /**
     * Log an error
     * @param {string} message - Error message
     * @param {ErrorLevel} level - Error severity level
     * @param {Error} error - Optional error object
     * @param {Object} context - Optional context information
     */
    log(message, level = ErrorLevel.ERROR, error = null, context = {}) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            message,
            level,
            error: error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : null,
            context
        };
        
        this.errors.push(errorEntry);
        
        // Keep only the last N errors
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }
        
        // Log to console based on level
        switch (level) {
            case ErrorLevel.INFO:
                console.info(`[INFO] ${message}`, context);
                break;
            case ErrorLevel.WARNING:
                console.warn(`[WARNING] ${message}`, context);
                break;
            case ErrorLevel.ERROR:
                console.error(`[ERROR] ${message}`, context);
                if (error) console.error(error);
                break;
            case ErrorLevel.CRITICAL:
                console.error(`[CRITICAL] ${message}`, context);
                if (error) console.error(error);
                break;
        }
        
        // Notify callbacks
        this.onErrorCallbacks.forEach(callback => {
            try {
                callback(errorEntry);
            } catch (e) {
                console.error('Error in error callback:', e);
            }
        });
    }
    
    /**
     * Register a callback for error notifications
     * @param {Function} callback - Callback function
     */
    onError(callback) {
        this.onErrorCallbacks.push(callback);
    }
    
    /**
     * Get all logged errors
     * @returns {Array} Array of error entries
     */
    getErrors() {
        return [...this.errors];
    }
    
    /**
     * Get errors by level
     * @param {ErrorLevel} level - Error level to filter by
     * @returns {Array} Filtered error entries
     */
    getErrorsByLevel(level) {
        return this.errors.filter(e => e.level === level);
    }
    
    /**
     * Clear all errors
     */
    clear() {
        this.errors = [];
    }
}

/**
 * Validate enemy JSON data
 * @param {Object} data - Enemy data to validate
 * @returns {Object} Validation result {valid: boolean, errors: Array}
 */
export function validateEnemyData(data) {
    const errors = [];
    
    if (!data || typeof data !== 'object') {
        return { valid: false, errors: ['Enemy data must be an object'] };
    }
    
    // Required fields
    if (!data.name || typeof data.name !== 'string') {
        errors.push('Enemy must have a valid name (string)');
    }
    
    if (typeof data.hp !== 'number' || data.hp <= 0) {
        errors.push('Enemy must have a valid HP (positive number)');
    }
    
    // Optional fields validation
    if (data.attack !== undefined && (typeof data.attack !== 'number' || data.attack < 0)) {
        errors.push('Attack must be a non-negative number');
    }
    
    if (data.defense !== undefined && (typeof data.defense !== 'number' || data.defense < 0)) {
        errors.push('Defense must be a non-negative number');
    }
    
    if (data.dialogue !== undefined && !Array.isArray(data.dialogue)) {
        errors.push('Dialogue must be an array');
    }
    
    if (data.acts !== undefined) {
        if (!Array.isArray(data.acts)) {
            errors.push('Acts must be an array');
        } else {
            data.acts.forEach((act, index) => {
                if (!act.name || typeof act.name !== 'string') {
                    errors.push(`Act ${index} must have a valid name`);
                }
                if (!act.effect || typeof act.effect !== 'string') {
                    errors.push(`Act ${index} must have a valid effect`);
                }
            });
        }
    }
    
    if (data.attackPatterns !== undefined) {
        if (!Array.isArray(data.attackPatterns)) {
            errors.push('Attack patterns must be an array');
        } else {
            data.attackPatterns.forEach((pattern, index) => {
                if (typeof pattern.duration !== 'number' || pattern.duration <= 0) {
                    errors.push(`Attack pattern ${index} must have a valid duration`);
                }
                if (!Array.isArray(pattern.waves)) {
                    errors.push(`Attack pattern ${index} must have a waves array`);
                }
            });
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate sprite data
 * @param {Object} sprites - Sprite configuration
 * @returns {Object} Validation result {valid: boolean, errors: Array}
 */
export function validateSpriteData(sprites) {
    const errors = [];
    
    if (!sprites || typeof sprites !== 'object') {
        return { valid: true, errors: [] }; // Sprites are optional
    }
    
    if (sprites.idle) {
        if (Array.isArray(sprites.idle)) {
            if (sprites.idle.length === 0) {
                errors.push('Idle sprite array cannot be empty');
            }
            sprites.idle.forEach((path, index) => {
                if (typeof path !== 'string') {
                    errors.push(`Sprite path ${index} must be a string`);
                }
            });
        } else if (typeof sprites.idle !== 'string') {
            errors.push('Idle sprite must be a string or array of strings');
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Safe JSON parse with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {string} context - Context for error messages
 * @returns {Object|null} Parsed object or null on error
 */
export function safeJSONParse(jsonString, context = 'JSON') {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        errorHandler.log(
            `Failed to parse ${context}`,
            ErrorLevel.ERROR,
            error,
            { jsonString: jsonString.substring(0, 100) }
        );
        return null;
    }
}

// Global error handler instance
export const errorHandler = new ErrorHandler();

// Set up global error handling
if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
        errorHandler.log(
            'Uncaught error',
            ErrorLevel.CRITICAL,
            event.error,
            {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            }
        );
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        errorHandler.log(
            'Unhandled promise rejection',
            ErrorLevel.CRITICAL,
            event.reason,
            { promise: 'Promise rejection' }
        );
    });
}
