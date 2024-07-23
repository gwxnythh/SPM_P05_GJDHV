const apiKey = "666c33a61bf4f00fdda6b84e";
const apiUrl = 'https://ngeeanncity-a92e.restdb.io/rest/member';

let usersData = []; // Array to store user data fetched from RestDB
let loggedInUser = null; // Variable to store currently logged-in user

// Function to fetch user data from RestDB
async function fetchUserData() {
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': apiKey,
                "Cache-Control": "no-cache"
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        usersData = data; // Store fetched data in usersData array
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Call fetchUserData on page load
document.addEventListener("DOMContentLoaded", function() {
    fetchUserData();
});

// Signup function
function signup() {
    const username = document.getElementById("signup-username").value;
    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm-password").value;

    // Basic validation
    if (username === "" || name === "" || email === "" || password === "" || confirmPassword === "") {
        alert("Please fill out all fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    // Check if the username or email already exists
    if (usersData.some(user => user.username === username)) {
        alert("Username already exists. Please use a different username.");
        return;
    }
    if (usersData.some(user => user.email === email)) {
        alert("Email already exists. Please use a different email.");
        return;
    }

    // Create new user object
    const newUser = {
        username: username,
        name: name,
        email: email,
        password: password,
    };

    // Add new user to RestDB
    fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-apikey": apiKey,
            "Cache-Control": "no-cache"
        },
        body: JSON.stringify(newUser)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to add new user');
        }
        return response.json();
    })
    .then(data => {
        alert("Signup successful! You can now log in.");
        document.getElementById('check').checked = false; // Switch to login form
        // Optionally update usersData with the newly created user
        usersData.push(newUser);
    })
    .catch(error => {
        console.error('Error signing up:', error);
    });
}

// Login function
function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    // Find user with matching username and password
    const user = usersData.find(user => user.username === username && user.password === password);

    if (user) {
        alert("Login successful!");
        // Save the logged-in user's username to local storage
        localStorage.setItem('loggedInUsername', username);
        // Redirect to main menu 
        window.location.href = "index.html";
    } else {
        alert("Invalid username or password.");
    }
}

// Function to switch between login and signup forms
function goToForm() {
    const cover = document.getElementById("cover-page");
    const regform = document.getElementById("form-page");

    cover.classList.toggle('hidden');
    regform.classList.toggle('hidden');
}

/* 
    # PROFILE PAGE
*/
// Function to fetch profile details based on username
async function fetchProfileDetails(username) {
    try {
        const response = await fetch(`${apiUrl}?q={"username":"${username}"}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': apiKey,
            }
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Fetched profile data:', data);
        return data[0]; // Assuming username is unique, so we take the first result
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

// Function to load profile details into HTML elements
async function loadProfileDetails(username) {
    const profileData = await fetchProfileDetails(username);
    if (profileData) {
        document.getElementById('display-username').textContent = profileData.username;
        document.getElementById('username-display').textContent = profileData.username;
        document.getElementById('name-display').textContent = profileData.name;
        document.getElementById('email-display').textContent = profileData.email;
        document.getElementById('password-display').textContent = '•'.repeat(profileData.password.length);
    
    }
}

// Load profile details when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Retrieve the logged-in user's username from local storage
    const loggedInUsername = localStorage.getItem('loggedInUsername');

    if (loggedInUsername) {
        loadProfileDetails(loggedInUsername);
    }
});