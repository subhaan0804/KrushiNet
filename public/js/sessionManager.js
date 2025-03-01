// MODIFIED GLOBAL FETCH FUNCTION
async function authFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    // Merge headers with authorization
    const headers = {
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    // If sending JSON data, add Content-Type
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        if (typeof options.body === 'object') {
            options.body = JSON.stringify(options.body);
        }
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
    }

    return response;
}


// ORIGINAL GLOBAL FETCH FUNCTION
// async function authFetch(url, options = {}) {
//     const token = localStorage.getItem('token');
//     if (token) {
//         options.headers = {
//             ...options.headers,
//             'Authorization': `Bearer ${token}`
//         };
//     }
//     return fetch(url, options);
// };



async function checkSessionStatus() {
    try {
        const token = localStorage.getItem('token');
        console.log("Local Storage Token: ", token); // Keep for debugging
        if (!token) {
            updateNavbar();
            return;
        }

                const response = await authFetch('/auth/me');
        const userData = await response.json();
        updateNavbar(userData);
    } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('token');
        showSessionExpiredPopup();
        updateNavbar();
    }
}

function updateNavbar(user = null) {
    const navItems = document.querySelector('nav ul');
    const userProfileLi = navItems.querySelector('li:nth-last-child(1)');
    
    if (user) {
        userProfileLi.innerHTML = `
            <div class="dropdown">
                <a href="#" class="highlight dropdown-toggle">${user.firstName}</a>
                <div class="dropdown-content">
                    <a href="/user/profile">User Profile</a>
                    <a href="#" onclick="logout(event)">Logout</a>
                </div>
            </div>`;
    } else {
        userProfileLi.innerHTML = '<a href="/auth/login">Login/SignUp</a>';
    }
}

function showSessionExpiredPopup() {
    document.getElementById('alertMessage').textContent = 'Your session has expired. Please login again.';
    document.getElementById('alertPopup').classList.add('open-pop');
    document.getElementById('popupOverlay').style.display = 'block';
}

// Add logout function to sessionManager.js
async function logout(event) {
    event.preventDefault();
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            localStorage.removeItem('token');
            window.location.href = '/auth/login';
        }
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// Check session every 10 seconds
setInterval(checkSessionStatus, 10000);

// Initial check when page loads
document.addEventListener('DOMContentLoaded', checkSessionStatus);