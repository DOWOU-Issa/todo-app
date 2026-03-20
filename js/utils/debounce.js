/**
 * Utilitaires pour optimiser les performances
 */

/**
 * Debounce function - limite la fréquence d'exécution d'une fonction
 */
export function debounce(func, delay) {
    let timeoutId;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeoutId);
            func(...args);
        };
        
        clearTimeout(timeoutId);
        timeoutId = setTimeout(later, delay);
    };
}

/**
 * Throttle function - limite le nombre d'exécutions dans le temps
 */
export function throttle(func, limit) {
    let inThrottle;
    
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

/**
 * Rate limiter - limite le nombre d'appels par seconde
 */
export class RateLimiter {
    constructor(maxCalls, interval) {
        this.maxCalls = maxCalls;
        this.interval = interval;
        this.calls = [];
    }
    
    canExecute() {
        const now = Date.now();
        this.calls = this.calls.filter(time => now - time < this.interval);
        
        if (this.calls.length < this.maxCalls) {
            this.calls.push(now);
            return true;
        }
        
        return false;
    }
}

/**
 * Exécute une fonction avec un délai
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Exécute une fonction de manière asynchrone avec retry
 */
export async function retry(fn, maxRetries = 3, delayMs = 1000) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                await delay(delayMs * Math.pow(2, i)); // Exponential backoff
            }
        }
    }
    
    throw lastError;
}