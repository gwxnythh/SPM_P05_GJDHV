const arcadeURL = "https://ngeeanncity-a92e.restdb.io/rest/arcadeleaderboard";
const freePlayURL = "https://ngeeanncity-a92e.restdb.io/rest/freeplayleaderboard";
const apiKey = "666c33a61bf4f00fdda6b84e";

async function fetchLeaderboard(url) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': apiKey,
            }
        });

        if (!response.ok) {
            console.error(`Network response was not ok: ${response.status} - ${response.statusText}`);
            return;
        }

        const data = await response.json();
        console.log('Fetched data:', data); // Debugging log
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

function updateLeaderboard(data) {
    const tbody = document.querySelector('#leaderboard-table tbody');
    tbody.innerHTML = '';
    data.sort((a, b) => b.score - a.score);
    data.slice(0, 10).forEach((item, index) => { // Limit to top 10 users
        const row = document.createElement('tr');
        row.innerHTML = `<td>${index + 1}</td><td>${item.name}</td><td>${item.score}</td>`;

        // Highlight top 3 scorers with different colors
        if (index === 0) {
            row.classList.add('gold-bg'); // 1st place
        } else if (index === 1) {
            row.classList.add('silver-bg'); // 2nd place
        } else if (index === 2) {
            row.classList.add('bronze-bg'); // 3rd place
        }

        tbody.appendChild(row);
    });
}

async function loadLeaderboard(url) {
    const data = await fetchLeaderboard(url);
    if (data) {
        updateLeaderboard(data);
    }
}

// Event listeners for buttons
// Select the buttons
const arcadeButton = document.querySelector('.right-buttons button:nth-child(1)');
const freePlayButton = document.querySelector('.right-buttons button:nth-child(2)');

// Add event listeners to the buttons
arcadeButton.addEventListener('click', () => {
    loadLeaderboard(arcadeURL);
    arcadeButton.classList.add('active');
    freePlayButton.classList.remove('active');
});

freePlayButton.addEventListener('click', () => {
    loadLeaderboard(freePlayURL);
    freePlayButton.classList.add('active');
    arcadeButton.classList.remove('active');
});


// Load the arcade leaderboard by default
loadLeaderboard(arcadeURL);
