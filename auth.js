/**
 * Authentication functionality for Greenville Cash
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication related elements
    initializeAuthForms();
    initializePasswordStrengthMeter();
    initializeLogoutLink();
});

/**
 * Initialize authentication forms (login and signup)
 */
function initializeAuthForms() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            handleLogin();
        });
    }
    
    // Handle signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            event.preventDefault();
            handleSignup();
        });
    }
}

/**
 * Initialize password strength meter
 */
function initializePasswordStrengthMeter() {
    const passwordInput = document.getElementById('password');
    const strengthIndicator = document.getElementById('password-strength');
    
    if (!passwordInput || !strengthIndicator) return;
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = validatePasswordStrength(password);
        
        // Update strength indicator width
        strengthIndicator.style.width = `${(strength.score / 4) * 100}%`;
        
        // Update strength indicator color
        switch(strength.score) {
            case 0:
            case 1:
                strengthIndicator.style.backgroundColor = '#dc3545'; // Red
                break;
            case 2:
                strengthIndicator.style.backgroundColor = '#ffc107'; // Yellow
                break;
            case 3:
                strengthIndicator.style.backgroundColor = '#28a745'; // Green
                break;
            case 4:
                strengthIndicator.style.backgroundColor = '#20c997'; // Teal
                break;
        }
        
        // Show tooltip with feedback
        strengthIndicator.setAttribute('title', strength.feedback);
    });
}

/**
 * Initialize logout link functionality
 */
function initializeLogoutLink() {
    const logoutLink = document.getElementById('logout-link');
    
    if (!logoutLink) return;
    
    logoutLink.addEventListener('click', function(event) {
        event.preventDefault();
        handleLogout();
    });
}

/**
 * Handle login form submission
 */
function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember')?.checked || false;
    
    // Validate email
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Validate password
    if (!password) {
        showNotification('Please enter your password', 'error');
        return;
    }
    
    // Attempt to decrypt user data
    try {
        // Check if the user exists in local storage
        const encryptedUserData = localStorage.getItem(`gcash_user_${email.toLowerCase()}`);
        
        if (!encryptedUserData) {
            showNotification('Email or password is incorrect', 'error');
            return;
        }
        
        // Import encryption module
        import('./encryption.js').then(module => {
            const { decryptData } = module;
            
            try {
                // Decrypt user data using password as key
                const userData = decryptData(encryptedUserData, password);
                
                // Successful login
                localStorage.setItem('gcash_logged_in', 'true');
                localStorage.setItem('gcash_current_user', email.toLowerCase());
                
                if (rememberMe) {
                    // Set a cookie that expires in 30 days
                    const expiryDate = new Date();
                    expiryDate.setDate(expiryDate.getDate() + 30);
                    document.cookie = `gcash_remember=${email.toLowerCase()}; expires=${expiryDate.toUTCString()}; path=/`;
                }
                
                // Show success message and redirect to dashboard
                showNotification('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
                
            } catch (error) {
                // Decryption failed (wrong password)
                showNotification('Email or password is incorrect', 'error');
            }
        });
        
    } catch (error) {
        showNotification('An error occurred during login', 'error');
        console.error('Login error:', error);
    }
}

/**
 * Handle signup form submission
 */
function handleSignup() {
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const termsAccepted = document.getElementById('terms')?.checked || false;
    
    // Validate full name
    if (!fullname || fullname.trim().length < 2) {
        showNotification('Please enter your full name', 'error');
        return;
    }
    
    // Validate email
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Validate password
    const passwordStrength = validatePasswordStrength(password);
    if (!passwordStrength.isValid) {
        showNotification(passwordStrength.feedback, 'error');
        return;
    }
    
    // Validate password confirmation
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    // Validate terms acceptance
    if (!termsAccepted) {
        showNotification('You must accept the Terms and Conditions', 'error');
        return;
    }
    
    // Check if email is already registered
    if (localStorage.getItem(`gcash_user_${email.toLowerCase()}`)) {
        showNotification('This email is already registered', 'error');
        return;
    }
    
    // Create user account
    try {
        // Import encryption module
        import('./encryption.js').then(module => {
            const { encryptData } = module;
            
            // Create user data object
            const userData = {
                fullname,
                email: email.toLowerCase(),
                createdAt: new Date().toISOString(),
                accounts: [],
                transactions: [],
                budgets: [],
                settings: {
                    currency: 'USD',
                    theme: 'light',
                    notifications: true
                }
            };
            
            // Encrypt user data using password as key
            const encryptedUserData = encryptData(userData, password);
            
            // Store encrypted user data in local storage
            localStorage.setItem(`gcash_user_${email.toLowerCase()}`, encryptedUserData);
            
            // Set current user session
            localStorage.setItem('gcash_logged_in', 'true');
            localStorage.setItem('gcash_current_user', email.toLowerCase());
            
            // Show success message and redirect to dashboard
            showNotification('Account created successfully! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        });
        
    } catch (error) {
        showNotification('An error occurred during registration', 'error');
        console.error('Signup error:', error);
    }
}

/**
 * Handle user logout
 */
function handleLogout() {
    // Clear authentication data
    localStorage.removeItem('gcash_logged_in');
    localStorage.removeItem('gcash_current_user');
    
    // Clear remember me cookie
    document.cookie = 'gcash_remember=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Show notification and redirect to homepage
    showNotification('You have been logged out successfully', 'info');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

/**
 * Check if user has a remember me cookie and auto-login
 */
function checkRememberMeCookie() {
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        
        if (cookie.startsWith('gcash_remember=')) {
            const email = cookie.substring('gcash_remember='.length, cookie.length);
            
            // Auto-login if email is found
            if (email && localStorage.getItem(`gcash_user_${email}`)) {
                localStorage.setItem('gcash_logged_in', 'true');
                localStorage.setItem('gcash_current_user', email);
                return true;
            }
        }
    }
    
    return false;
}

/**
 * Get the current logged in user's data
 * @returns {Promise<object|null>} User data or null if not logged in
 */
async function getCurrentUserData() {
    const isLoggedIn = localStorage.getItem('gcash_logged_in') === 'true';
    const currentUserEmail = localStorage.getItem('gcash_current_user');
    
    if (!isLoggedIn || !currentUserEmail) {
        return null;
    }
    
    // Get encrypted user data
    const encryptedUserData = localStorage.getItem(`gcash_user_${currentUserEmail}`);
    
    if (!encryptedUserData) {
        return null;
    }
    
    try {
        // Import encryption module and prompt for password
        const { decryptData } = await import('./encryption.js');
        
        // TODO: In a real app, we would need to prompt for password here
        // For demo purposes, we'll use a session storage key
        const sessionKey = sessionStorage.getItem('gcash_session_key');
        
        if (!sessionKey) {
            return null;
        }
        
        // Decrypt user data using session key
        const userData = decryptData(encryptedUserData, sessionKey);
        return userData;
        
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}
