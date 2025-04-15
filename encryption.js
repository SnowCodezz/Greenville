/**
 * Encryption utilities for Greenville Cash
 * Uses CryptoJS library for encryption/decryption
 */

/**
 * Generate a secure encryption key from password
 * @param {string} password - User's password
 * @param {string} salt - Salt for key derivation (optional)
 * @returns {string} Derived encryption key
 */
function deriveKeyFromPassword(password, salt = 'greenville_cash_salt') {
    // Use PBKDF2 to derive a key from the password
    // 10000 iterations is recommended minimum for security
    const key = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32, // 256 bits
        iterations: 10000
    });
    
    return key.toString();
}

/**
 * Encrypt data using AES encryption
 * @param {object|string} data - Data to encrypt
 * @param {string} password - Encryption key (user's password)
 * @returns {string} Encrypted data as string
 */
export function encryptData(data, password) {
    try {
        // Convert data to JSON string if it's an object
        const dataStr = typeof data === 'object' ? JSON.stringify(data) : String(data);
        
        // Derive encryption key from password
        const key = deriveKeyFromPassword(password);
        
        // Generate random IV (Initialization Vector)
        const iv = CryptoJS.lib.WordArray.random(128 / 8); // 128 bits
        
        // Encrypt data using AES in CBC mode with the derived key and IV
        const encrypted = CryptoJS.AES.encrypt(dataStr, key, {
            iv: iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC
        });
        
        // Combine IV and encrypted data for storage
        // Format: iv:ciphertext
        const result = iv.toString() + ':' + encrypted.toString();
        
        return result;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
}

/**
 * Decrypt data using AES decryption
 * @param {string} encryptedData - Encrypted data string
 * @param {string} password - Decryption key (user's password)
 * @returns {object|string} Decrypted data
 */
export function decryptData(encryptedData, password) {
    try {
        // Split the encrypted data to get IV and ciphertext
        const parts = encryptedData.split(':');
        if (parts.length !== 2) {
            throw new Error('Invalid encrypted data format');
        }
        
        const iv = CryptoJS.enc.Hex.parse(parts[0]);
        const ciphertext = parts[1];
        
        // Derive decryption key from password
        const key = deriveKeyFromPassword(password);
        
        // Decrypt data
        const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
            iv: iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC
        });
        
        // Convert to UTF-8 string
        const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
        
        if (!decryptedStr) {
            throw new Error('Decryption failed - wrong password or corrupted data');
        }
        
        // Try to parse as JSON if possible
        try {
            return JSON.parse(decryptedStr);
        } catch (e) {
            // If not valid JSON, return as string
            return decryptedStr;
        }
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
}

/**
 * Store session encryption key in memory
 * @param {string} key - Encryption key to store in session
 */
export function storeSessionKey(key) {
    // Store key in session storage (lost when browser is closed)
    sessionStorage.setItem('gcash_session_key', key);
}

/**
 * Get session encryption key from memory
 * @returns {string|null} Session key or null if not found
 */
export function getSessionKey() {
    return sessionStorage.getItem('gcash_session_key');
}

/**
 * Clear session encryption key from memory
 */
export function clearSessionKey() {
    sessionStorage.removeItem('gcash_session_key');
}

/**
 * Generate a random strong password
 * @param {number} length - Length of password (default: 16)
 * @returns {string} Generated password
 */
export function generateRandomPassword(length = 16) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
    let password = '';
    
    // Generate random bytes
    const randomValues = new Uint8Array(length);
    window.crypto.getRandomValues(randomValues);
    
    // Convert random bytes to password characters
    for (let i = 0; i < length; i++) {
        password += charset[randomValues[i] % charset.length];
    }
    
    return password;
}

/**
 * Hash a string (e.g., for ID generation)
 * @param {string} input - String to hash
 * @returns {string} Hashed string
 */
export function hashString(input) {
    return CryptoJS.SHA256(input).toString();
}
