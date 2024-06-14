const apiKey = "666c33a61bf4f00fdda6b84e";
const apiUrl = 'https://ngeeanncity-a92e.restdb.io/rest/member';

let usersData = []; // Array to store user data fetched from RestDB

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
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm-password").value;

    // Basic validation
    if (email === "" || password === "" || confirmPassword === "") {
        alert("Please fill out all fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    // Check if the email already exists
    if (usersData.some(user => user.email === email)) {
        alert("Email already exists. Please use a different email.");
        return;
    }

    // Create new user object
    const newUser = {
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
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    // Find user with matching email and password
    const user = usersData.find(user => user.email === email && user.password === password);

    if (user) {
        alert("Login successful!");
        // Redirect to main menu 
        window.location.href = "index.html";
    } else {
        alert("Invalid email or password.");
    }
}

// Function to switch between login and signup forms
function goToForm() {
    const cover = document.getElementById("cover-page");
    const regform = document.getElementById("form-page");

    cover.classList.toggle('hidden');
    regform.classList.toggle('hidden');
}
