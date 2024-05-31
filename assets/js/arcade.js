// No Inspect Element (delete before submission)
document.onkeydown = function(e) {
    if(event.keyCode == 123) {
    return false;
    }
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)){
    return false;
    }
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)){
    return false;
    }
    if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)){
    return false;
    }
    }
    

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

    // Reset coins, turns, and score values
    coins = 16;
    turns = 0;
    score = 0;
    connectedCells = [];

    // Update the UI
    updateCoins(coins);
    updateTurns(turns);
    updateScore(score);

    // Generate new random buildings
    generateRandomBuilding();
});

// JavaScript Logic
const grid = document.getElementById('grid');
const buildings = ['residential', 'industry', 'commercial', 'park', 'road'];
let coins = 16;
let turns = 0;
let score = 0; // Score variable
let connectedCells = [];

document.addEventListener('DOMContentLoaded', generateRandomBuilding, false);

// Generate grid cells
for (let i = 0; i < 20 * 20; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    grid.appendChild(cell);
}

// Add event listeners for drag and drop
buildings.forEach(building => {
    const buildingElement = document.getElementById(building);
    buildingElement.addEventListener('dragstart', dragStart);
});

grid.addEventListener('dragover', dragOver);
grid.addEventListener('drop', drop);

function dragStart(event) {
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
                    alert("You've run out of coins!");
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
    for(let i = 0; i < adjacentIndices.length; i++) {
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
    for(let i = 0; i < adjacentIndices.length; i++) {
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