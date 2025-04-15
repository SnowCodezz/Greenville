/**
 * Main JavaScript file for common functionality across all pages
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initializeModals();
    initializeDropdowns();
    checkAuthStatus();
    
    // Set current date in relevant elements
    setCurrentDate();
});

/**
 * Check if user is logged in and handle page redirects
 */
function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem('gcash_logged_in') === 'true';
    const currentPage = window.location.pathname;
    
    // Get pages that should only be accessible when logged in
    const protectedPages = ['dashboard.html'];
    const authPages = ['login.html', 'signup.html'];
    
    // Check if current page is a protected page
    const isProtectedPage = protectedPages.some(page => currentPage.includes(page));
    const isAuthPage = authPages.some(page => currentPage.includes(page));
    
    // Redirect logic based on auth status and current page
    if (isLoggedIn) {
        // If user is on an auth page, redirect to dashboard
        if (isAuthPage) {
            window.location.href = 'dashboard.html';
        }
    } else {
        // If user is on a protected page, redirect to login
        if (isProtectedPage) {
            window.location.href = 'login.html';
        }
    }
}

/**
 * Initialize all modals
 */
function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    
    if (!modals.length) return;
    
    // Add event listeners to open modals
    document.querySelectorAll('[id$="-btn"]').forEach(button => {
        const modalId = button.id.replace('-btn', '-modal');
        const modal = document.getElementById(modalId);
        
        if (modal) {
            button.addEventListener('click', () => {
                openModal(modal);
            });
        }
    });
    
    // Add event listeners to close modals
    document.querySelectorAll('.close-modal, .cancel-modal').forEach(element => {
        const modal = element.closest('.modal');
        
        if (modal) {
            element.addEventListener('click', () => {
                closeModal(modal);
            });
        }
    });
    
    // Close modal when clicking outside the content
    modals.forEach(modal => {
        modal.addEventListener('click', event => {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });
}

/**
 * Open a modal
 * @param {HTMLElement} modal - The modal element to open
 */
function openModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling while modal is open
}

/**
 * Close a modal
 * @param {HTMLElement} modal - The modal element to close
 */
function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
}

/**
 * Initialize all dropdowns
 */
function initializeDropdowns() {
    const dropdownToggles = document.querySelectorAll('[id$="-dropdown"]');
    
    if (!dropdownToggles.length) return;
    
    dropdownToggles.forEach(toggle => {
        const menuId = toggle.id.replace('-dropdown', '-menu');
        const menu = document.getElementById(menuId);
        
        if (menu) {
            toggle.addEventListener('click', () => {
                menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', event => {
                if (!toggle.contains(event.target) && !menu.contains(event.target)) {
                    menu.style.display = 'none';
                }
            });
        }
    });
}

/**
 * Format currency amount
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: USD)
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

/**
 * Set current date in elements with id="current-date"
 */
function setCurrentDate() {
    const dateElements = document.querySelectorAll('#current-date');
    
    if (!dateElements.length) return;
    
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    const formattedDate = new Date().toLocaleDateString('en-US', options);
    
    dateElements.forEach(element => {
        element.textContent = formattedDate;
    });
}

/**
 * Display notification/alert to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, warning, info)
 * @param {number} duration - How long to show the notification in ms (default: 3000ms)
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add notification to the DOM
    document.body.appendChild(notification);
    
    // Add visible class to trigger animation
    setTimeout(() => {
        notification.classList.add('visible');
    }, 10);
    
    // Remove notification after duration
    setTimeout(() => {
        notification.classList.remove('visible');
        
        // Remove from DOM after fade out animation completes
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, duration);
}

/**
 * Helper function to validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} Whether the email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Helper function to validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Password strength details
 */
function validatePasswordStrength(password) {
    const result = {
        isValid: false,
        score: 0,
        feedback: ''
    };
    
    // Check minimum length
    if (password.length < 8) {
        result.feedback = 'Password should be at least 8 characters long';
        return result;
    }
    
    // Initialize score
    let score = 0;
    
    // Check for lowercase letters
    if (/[a-z]/.test(password)) score++;
    
    // Check for uppercase letters
    if (/[A-Z]/.test(password)) score++;
    
    // Check for numbers
    if (/[0-9]/.test(password)) score++;
    
    // Check for special characters
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    // Set score and feedback based on score
    result.score = score;
    
    switch(score) {
        case 0:
        case 1:
            result.feedback = 'Weak password';
            break;
        case 2:
            result.feedback = 'Fair password';
            result.isValid = true;
            break;
        case 3:
            result.feedback = 'Good password';
            result.isValid = true;
            break;
        case 4:
            result.feedback = 'Strong password';
            result.isValid = true;
            break;
    }
    
    return result;
}
