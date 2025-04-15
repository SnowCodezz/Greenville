/**
 * Storage utilities for Greenville Cash
 * Handles encrypted data storage and synchronization
 */

import { encryptData, decryptData, getSessionKey } from './encryption.js';

/**
 * Save user data to localStorage
 * @param {object} userData - User data to save
 * @returns {Promise<boolean>} Success status
 */
export async function saveUserData(userData) {
    try {
        const currentUserEmail = localStorage.getItem('gcash_current_user');
        
        if (!currentUserEmail) {
            throw new Error('No user is currently logged in');
        }
        
        // Get session key
        const sessionKey = getSessionKey();
        
        if (!sessionKey) {
            throw new Error('No session key available');
        }
        
        // Encrypt user data
        const encryptedData = encryptData(userData, sessionKey);
        
        // Save to localStorage
        localStorage.setItem(`gcash_user_${currentUserEmail}`, encryptedData);
        
        // Update backup if enabled
        await backupUserData(encryptedData);
        
        return true;
    } catch (error) {
        console.error('Error saving user data:', error);
        return false;
    }
}

/**
 * Load user data from localStorage
 * @returns {Promise<object|null>} User data or null if not available
 */
export async function loadUserData() {
    try {
        const currentUserEmail = localStorage.getItem('gcash_current_user');
        
        if (!currentUserEmail) {
            return null;
        }
        
        // Get encrypted data from localStorage
        const encryptedData = localStorage.getItem(`gcash_user_${currentUserEmail}`);
        
        if (!encryptedData) {
            return null;
        }
        
        // Get session key
        const sessionKey = getSessionKey();
        
        if (!sessionKey) {
            throw new Error('No session key available');
        }
        
        // Decrypt user data
        const userData = decryptData(encryptedData, sessionKey);
        
        return userData;
    } catch (error) {
        console.error('Error loading user data:', error);
        return null;
    }
}

/**
 * Backup user data to an external source (GitHub Gist if configured)
 * @param {string} encryptedData - Encrypted user data
 * @returns {Promise<boolean>} Success status
 */
async function backupUserData(encryptedData) {
    try {
        // Check if backup is enabled
        const backupEnabled = localStorage.getItem('gcash_backup_enabled') === 'true';
        
        if (!backupEnabled) {
            return false;
        }
        
        // Get GitHub token (if user has configured it)
        const githubToken = localStorage.getItem('gcash_github_token');
        
        if (!githubToken) {
            return false;
        }
        
        // Get user email (for filename)
        const currentUserEmail = localStorage.getItem('gcash_current_user');
        const safeFilename = currentUserEmail.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        // Check if we have an existing gist ID
        let gistId = localStorage.getItem('gcash_backup_gist_id');
        
        // Data for the Gist
        const gistData = {
            description: 'Greenville Cash Encrypted Backup',
            public: false, // Private Gist
            files: {
                [`${safeFilename}.encrypted`]: {
                    content: encryptedData
                }
            }
        };
        
        let response;
        
        if (gistId) {
            // Update existing Gist
            response = await fetch(`https://api.github.com/gists/${gistId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gistData)
            });
        } else {
            // Create new Gist
            response = await fetch('https://api.github.com/gists', {
                method: 'POST',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gistData)
            });
            
            // Save Gist ID for future updates
            if (response.ok) {
                const gistResponse = await response.json();
                localStorage.setItem('gcash_backup_gist_id', gistResponse.id);
            }
        }
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        // Update last backup timestamp
        localStorage.setItem('gcash_last_backup', new Date().toISOString());
        
        return true;
    } catch (error) {
        console.error('Backup error:', error);
        return false;
    }
}

/**
 * Restore user data from backup
 * @param {string} password - User's password for decryption
 * @returns {Promise<object|null>} Restored user data or null if failed
 */
export async function restoreFromBackup(password) {
    try {
        // Get GitHub token
        const githubToken = localStorage.getItem('gcash_github_token');
        
        if (!githubToken) {
            throw new Error('No GitHub token available');
        }
        
        // Get backup Gist ID
        const gistId = localStorage.getItem('gcash_backup_gist_id');
        
        if (!gistId) {
            throw new Error('No backup Gist ID found');
        }
        
        // Fetch Gist from GitHub
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
            headers: {
                'Authorization': `token ${githubToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const gistData = await response.json();
        
        // Find the encrypted file
        const files = Object.values(gistData.files);
        
        if (files.length === 0) {
            throw new Error('No files found in backup Gist');
        }
        
        // Get encrypted content
        const encryptedData = files[0].content;
        
        // Decrypt data
        const userData = decryptData(encryptedData, password);
        
        return userData;
    } catch (error) {
        console.error('Restore error:', error);
        return null;
    }
}

/**
 * Configure GitHub backup
 * @param {string} githubToken - GitHub personal access token
 * @returns {Promise<boolean>} Success status
 */
export async function configureGithubBackup(githubToken) {
    try {
        // Validate token by making a test API call
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${githubToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Invalid GitHub token');
        }
        
        // Save token and enable backups
        localStorage.setItem('gcash_github_token', githubToken);
        localStorage.setItem('gcash_backup_enabled', 'true');
        
        return true;
    } catch (error) {
        console.error('GitHub configuration error:', error);
        return false;
    }
}

/**
 * Export user data as an encrypted file
 * @returns {Promise<string|null>} Data URL for download or null if failed
 */
export async function exportUserData() {
    try {
        const userData = await loadUserData();
        
        if (!userData) {
            throw new Error('No user data available');
        }
        
        // Convert data to JSON
        const dataStr = JSON.stringify(userData);
        
        // Create Blob from data
        const blob = new Blob([dataStr], { type: 'application/json' });
        
        // Create data URL for download
        const dataUrl = URL.createObjectURL(blob);
        
        return dataUrl;
    } catch (error) {
        console.error('Export error:', error);
        return null;
    }
}

/**
 * Import user data from a file
 * @param {File} file - File object containing user data
 * @param {string} password - Password for encryption
 * @returns {Promise<boolean>} Success status
 */
export async function importUserData(file, password) {
    try {
        // Read file content
        const fileContent = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
        
        // Parse JSON
        const userData = JSON.parse(fileContent);
        
        // Validate data structure
        if (!userData.email || !userData.fullname) {
            throw new Error('Invalid user data format');
        }
        
        // Encrypt data with provided password
        const encryptedData = encryptData(userData, password);
        
        // Store in localStorage
        localStorage.setItem(`gcash_user_${userData.email.toLowerCase()}`, encryptedData);
        
        return true;
    } catch (error) {
        console.error('Import error:', error);
        return false;
    }
}
