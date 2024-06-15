document.addEventListener('DOMContentLoaded', function () {
    // Select the logout button
    const logoutBtn = document.getElementById('logout-btn');

    // Add a click event listener to the logout button
    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        logout();
    });

    function logout() {
        // Clear user data (localStorage/sessionStorage/cookies)
        localStorage.clear();
        sessionStorage.clear();
        // If you have cookies, you might need to clear them as well
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/"; 
        });
        // Redirect to the login page
        window.location.href = 'login-register.html';
    }
});
