// Get the restart button
const restartButton = document.getElementById("restart-button");

// Add event listener for restart button click
restartButton.addEventListener("click", function () {
    // Get all building elements within the grid
    const buildings = document.querySelectorAll("#grid .building");

    // Remove each building from the grid
    buildings.forEach(function (building) {
        building.remove();
    });
});

const APIKEY = "666c33a61bf4f00fdda6b84e";

// JavaScript Logic
const grid = document.getElementById('grid');
const buildings = ['residential', 'industry', 'commercial', 'park', 'road'];
let coins = 16;
let turns = 0;
let score = 0; // Score variable
let connectedCells = [];
let demolishMode = false;

const exitButton = document.getElementById("exit-button");
exitButton.addEventListener("click", function () {
    let username = prompt("Please enter your name");
    if (username != null) {
        saveGameData(username);
    }
});

document.addEventListener('DOMContentLoaded', generateRandomBuilding, false);
document.addEventListener('DOMContentLoaded', registerDemolishEvent, false);

function registerDemolishEvent() {
    const demolishButton = document.getElementById('demolish-btn');
    demolishButton.addEventListener('click', enableDemolishMode);
}

function enableDemolishMode() {
    demolishMode = true;
    const demolishButton = document.getElementById('demolish-btn');
    demolishButton.style.border = "2px dotted red";  
}

function disableDemolishMode() {
    demolishMode = false;
    const demolishButton = document.getElementById('demolish-btn');
    demolishButton.style.border = "";  
}

// Generate grid cells
for (let i = 0; i < 20 * 20; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    grid.appendChild(cell);
}
cellClicked();

// Add event listeners for drag and drop
buildings.forEach(building => {
    const buildingElement = document.getElementById(building);
    buildingElement.addEventListener('dragstart', dragStart);
});

grid.addEventListener('dragover', dragOver);
grid.addEventListener('drop', drop);

function dragStart(event) {
    disableDemolishMode()
    event.dataTransfer.setData('text', event.target.parentNode.id); // Set the data to the parentNode id
}

function dragOver(event) {
    event.preventDefault();
}

function isAdjacentToConnected(cell) {
    const cellIndex = Array.from(grid.children).indexOf(cell);
    const row = Math.floor(cellIndex / 20);
    const col = cellIndex % 20;

    // Check if the cell is adjacent to any of the connected cells
    for (const connectedCell of connectedCells) {
        const connectedCellIndex = Array.from(grid.children).indexOf(connectedCell);
        const connectedRow = Math.floor(connectedCellIndex / 20);
        const connectedCol = connectedCellIndex % 20;

        // Check if the cell is adjacent to the connected cell (up, down, left, right)
        if ((Math.abs(row - connectedRow) === 1 && col === connectedCol) ||
            (row === connectedRow && Math.abs(col - connectedCol) === 1)) {
            return true;
        }
    }
    return false;
}

function drop(event) {
    event.preventDefault();
    const buildingId = event.dataTransfer.getData('text');
    const buildingElement = document.getElementById(buildingId);
    const cell = event.target;

    if (cell.classList.contains('cell') && cell.children.length === 0) {
        if (coins > 0) {
            if (connectedCells.length === 0 || isAdjacentToConnected(cell)) {
                let cloneNode = buildingElement.cloneNode(true);

                cloneNode.id = buildingId + "-" + cell;
                cloneNode.classList.remove("building-icon");
                cloneNode.classList.add("building");
                cloneNode.style.display = "display";

                cell.appendChild(cloneNode);

                coins -= 1;
                turns += 1;
                const buildingScore = calculateBuildingScore(buildingId, cell); // Calculate score based on building type and adjacent buildings
                const coinsEarned = calculateBuildingCoinEarned(buildingId, cell);
                score += buildingScore; // Update score with building score
                coins += coinsEarned;   // Update coins with coins earned
                updateCoins(coins);
                updateTurns(turns);
                updateScore(score); // Update score in the UI
                connectedCells.push(cell);
                if (coins === 0) {
                    alert("You've run out of coins! You have score: " + score);
                    checkHighScoreAndUpdate(score);
                    return;
                }
                generateRandomBuilding();
            } else {
                alert("You can only build on squares adjacent to existing buildings.");
                return;
            }
        } else {
            alert("You've run out of coins!");
        }
    } else {
        alert("You can't build there.");
    }
}
function updateCoins(coins) {
    document.getElementById('coins').innerText = coins;
}

function updateTurns(turns) {
    document.getElementById('turns').innerText = turns;
}

function updateScore(score) {
    document.getElementById('score').innerText = score; // Update score in the UI
}

// Function to calculate score based on building type and adjacent buildings
function calculateBuildingScore(buildingId, cell) {
    let buildingScore = 0;

    const row = Math.floor(Array.from(grid.children).indexOf(cell) / 20);
    const col = Array.from(grid.children).indexOf(cell) % 20;

    switch (buildingId) {
        case 'residential':
            // Check adjacent cells for industry, residential, commercial, and park
            buildingScore += calculateAdjacentScore(row, col, 'industry', 1);
            buildingScore += calculateAdjacentScore(row, col, 'residential', 1);
            buildingScore += calculateAdjacentScore(row, col, 'commercial', 1);
            buildingScore += calculateAdjacentScore(row, col, 'park', 2);
            break;
        case 'industry':
            // Increment score by 1 for each industry
            buildingScore += 1;
            break;
        case 'commercial':
            // Check adjacent cells for commercial
            buildingScore += calculateAdjacentScore(row, col, 'commercial', 1);
            break;
        case 'park':
            // Check adjacent cells for park
            buildingScore += calculateAdjacentScore(row, col, 'park', 1);
            break;
        case 'road':
            // Increment score by 1 for each connected road group in the same row
            buildingScore += calculateConnectedRoadScore(row);
            break;
        default:
            break;
    }

    return buildingScore;
}

function calculateBuildingCoinEarned(buildingId, cell) {
    let coinsEarned = 0;

    const row = Math.floor(Array.from(grid.children).indexOf(cell) / 20);
    const col = Array.from(grid.children).indexOf(cell) % 20;

    switch (buildingId) {
        case 'residential':
            break;
        case 'industry':
            coinsEarned += calculateAdjacentCoinEarned(row, col, 'residential', 1);
            break;
        case 'commercial':
            coinsEarned += calculateAdjacentCoinEarned(row, col, 'residential', 1);
            break;
        case 'park':
            break;
        case 'road':
            break;
        default:
            break;
    }

    return coinsEarned;
}

// Function to calculate score based on adjacent buildings of a specific type
function calculateAdjacentScore(row, col, buildingType, scoreIncrement) {
    let adjacentScore = 0;

    const adjacentIndices = findAdjacentBuilding(row, col, 20, 20);
    for (let i = 0; i < adjacentIndices.length; i++) {
        const adjacentCell = grid.children[adjacentIndices[i]];
        if (adjacentCell.children.length > 0) {
            const adjacentBuilding = adjacentCell.children[0].id.split('-')[0];
            if (adjacentBuilding === buildingType) {
                adjacentScore += scoreIncrement;
            }
        }
    }

    return adjacentScore;
}

function calculateConnectedRoadScore(row) {
    let connectedRoads = 0;
    let prevRoadCol = -1; // Variable to store the column index of the previous road in the same row

    // Iterate through each column in the specified row
    for (let col = 0; col < 20; col++) {
        const cell = grid.children[row * 20 + col];
        if (cell.children.length > 0 && cell.children[0].id.split('-')[0] === 'road') {
            if (prevRoadCol === -1 || col === prevRoadCol + 1) {
                connectedRoads++; // Increment the count if a new road is in the same row as the previous road
            }
            prevRoadCol = col; // Update the previous road column index
        }
    }

    // Return 1 if more than one road is connected in the same row and it's not the first road, otherwise return 0
    return connectedRoads > 1 ? 1 : 0;
}

function calculateAdjacentCoinEarned(row, col, buildingType, coinEarned) {
    let adjacentCoinEarned = 0;

    const adjacentIndices = findAdjacentBuilding(row, col, 20, 20);
    for (let i = 0; i < adjacentIndices.length; i++) {
        const adjacentCell = grid.children[adjacentIndices[i]];
        if (adjacentCell.children.length > 0) {
            const adjacentBuilding = adjacentCell.children[0].id.split('-')[0];
            if (adjacentBuilding === buildingType) {
                adjacentCoinEarned += coinEarned;
            }
        }
    }

    return adjacentCoinEarned;
}

function findAdjacentBuilding(row, col, maxCols, maxRows) {
    const adjacentIndices = [];
    const currentIndex = row * maxCols + col;
    // Check above cell
    if (row > 0) {
        adjacentIndices.push(currentIndex - maxCols);
    }
    // Check below cell
    if (row < maxRows - 1) {
        adjacentIndices.push(currentIndex + maxCols);
    }
    // Check left cell
    if (col > 0) {
        adjacentIndices.push(currentIndex - 1);
    }
    // Check right cell
    if (col < maxCols - 1) {
        adjacentIndices.push(currentIndex + 1);
    }

    return adjacentIndices;
}

function generateRandomBuilding() {
    resetBuildingDisplay();
    let randomBuildingOne = getRandomBuildingType();
    let randomBuildingTwo = getRandomBuildingType();
    while (randomBuildingOne === randomBuildingTwo) {
        randomBuildingTwo = getRandomBuildingType();
    }
    document.getElementById(randomBuildingOne).style.display = "block";
    document.getElementById(randomBuildingTwo).style.display = "block";
}

function resetBuildingDisplay() {
    for (let i = 0; i < buildings.length; i++) {
        document.getElementById(buildings[i]).style.display = "none";
    }
}

function getRandomBuildingType() {
    return buildings[Math.floor(Math.random() * buildings.length)];
}

function cellClicked(el, etype) {
    const cells = document.querySelectorAll('#grid .cell');
    cells.forEach(function(cell) {
        cell.addEventListener('click', function() {
            if (!demolishMode) {
                return
            }
            const specificDiv = cell.querySelector('div.building');
            if (specificDiv) {
                coins -= 1;
                updateCoins(coins);
                removeCellFromConnectedCells(specificDiv);
                specificDiv.remove();
                disableDemolishMode();
            }
        });
    });
}

function removeCellFromConnectedCells(specificDiv) {
    const index = connectedCells.findIndex(cell => cell.children[0] === specificDiv);
    if (index !== -1) {
        connectedCells.splice(index, 1);
    }
}

function checkHighScoreAndUpdate(newScore) {
    fetch(`https://ngeeanncity-a92e.restdb.io/rest/leaderboard?q={}&h={"$max":1}&sort=score&dir=-1`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": APIKEY,
            "Cache-Control": "no-cache",
        },
    })
        .then((res) => res.json())
        .then((response) => {
            if (response.length == 0 || newScore > response[0].score) {
                let username = prompt("Please enter your name");
                if (username != null) {
                    saveNewHighestScore(username, newScore); 
                }
            }
        });
}

function saveNewHighestScore(username, newScore) {
    fetch(`https://ngeeanncity-a92e.restdb.io/rest/leaderboard`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": APIKEY,
            "Cache-Control": "no-cache",
        },
        body: JSON.stringify({ name: username, score: newScore }),
    })
        .then((res) => res.json())
        .then((response) => {
            console.log(response);
        });
}

function saveGameData(username) {
    let gameData = [];
    var grid = document.getElementById('grid');
    for (let i = 0; i < grid.children.length; i++) {
        var childWithClass = grid.children[i].querySelector('.building');
        if (childWithClass) {
            gameData.push({ index: i, buildingId: childWithClass.id})
        }
    }
    fetch(`https://ngeeanncity-a92e.restdb.io/rest/gamedata`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": APIKEY,
            "Cache-Control": "no-cache",
        },
        body: JSON.stringify({ name: username, grid: JSON.stringify(gameData)}),
    })
        .then((res) => res.json())
        .then((response) => {
            window.location.href = 'index.html';
        });
}