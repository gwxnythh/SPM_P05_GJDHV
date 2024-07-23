const APIKEY = "666c33a61bf4f00fdda6b84e";
const loadSaveGameContainer = document.querySelector('.loadsavegame-files');

// Assuming the logged-in user's ID or username is stored in localStorage
const loggedInUser = localStorage.getItem('loggedInUsername');

document.addEventListener('DOMContentLoaded', loadDefaultSaveGames);

function loadDefaultSaveGames() {
    loadSavedGames(false);
}

function loadSavedGames(isFreeplayMode = false) {
    console.log('loadsavedgames: ', isFreeplayMode)
    var mode = 'arcadegamedata';
    if (isFreeplayMode) {
        mode = 'freeplaygamedata';
    }
    fetch(`https://ngeeanncity-a92e.restdb.io/rest/` + mode, {
        method: "GET",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": APIKEY,
            "Cache-Control": "no-cache",
        },
    })
        .then(res => res.json())
        .then(response => {
            console.log('response: ', response)
            // Filter games to only include those saved by the logged-in user
            const userGames = response.filter(game => game.name === loggedInUser);
            console.log('userGames: ', userGames)
            displaySavedGames(userGames, isFreeplayMode);
        })
        .catch(error => {
            console.error('Error fetching saved games:', error);
        });
}

function displaySavedGames(savedGames, isFreeplayMode) {
    loadSaveGameContainer.innerHTML = ""; // Clear the container
    savedGames.reverse().forEach((game, index) => {
        const gameBox = document.createElement('div');
        gameBox.classList.add('game-box');
        gameBox.innerHTML = `
            <h3>Arcade</h3>
            <h4>${game.filename}</h4>
            <p>Save ${savedGames.length - index}</p>
        `;
        gameBox.addEventListener('click', () => loadGame(game, isFreeplayMode));
        loadSaveGameContainer.appendChild(gameBox);
    });
}

function loadGame(game, isFreeplayMode) {
    // Logic to load the game state from the selected game
    // You can redirect to the game page and pass the game data or set it in local storage
    localStorage.setItem('loadedGame', JSON.stringify(game));
    if (isFreeplayMode) {
        window.location.href = 'freeplay.html';
    } else {
        window.location.href = 'arcade.html';
    }
}

// Event listeners for buttons
// Select the buttons
const arcadeLoadGameBtn = document.getElementById("arcade-load-game-btn");
const freeLoadGameBtn = document.getElementById("free-load-game-btn");

// Add event listeners to the buttons
arcadeLoadGameBtn.addEventListener("click", function (event) {
    event.preventDefault();
    loadSavedGames(false);
    arcadeLoadGameBtn.classList.add('active');
    freeLoadGameBtn.classList.remove('active');
});

freeLoadGameBtn.addEventListener("click", function (event) {
    event.preventDefault();
    loadSavedGames(true);
    freeLoadGameBtn.classList.add('active');
    arcadeLoadGameBtn.classList.remove('active');
});