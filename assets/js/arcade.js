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

// JavaScript Logic
const grid = document.getElementById('grid');
const buildings = ['residential', 'industry', 'commercial', 'park', 'road'];
let coins = 16;
let turns = 0;
let score = 0; // Score variable
let connectedCells = [];

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
                cell.appendChild(buildingElement.cloneNode(true));
                coins -= 1;
                turns += 1;
                const buildingScore = calculateBuildingScore(buildingId, cell); // Calculate score based on building type and adjacent buildings
                score += buildingScore; // Update score with building score
                updateCoins(coins);
                updateTurns(turns);
                updateScore(score); // Update score in the UI
                connectedCells.push(cell);
                if (coins === 0) {
                    alert("You've run out of coins!");
                    return;
                }
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
    const col = Array.from(cell.parentNode.children).indexOf(cell);

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

// Function to calculate score based on adjacent buildings of a specific type
function calculateAdjacentScore(row, col, buildingType, scoreIncrement) {
    let adjacentScore = 0;

    // Check adjacent cells
    for (let i = Math.max(row - 1, 0); i <= Math.min(row + 1, 19); i++) {
        for (let j = Math.max(col - 1, 0); j <= Math.min(col + 1, 19); j++) {
            if (i !== row || j !== col) {
                const adjacentCell = grid.children[i * 20 + j];
                if (adjacentCell.children.length > 0) {
                    const adjacentBuilding = adjacentCell.children[0].id;
                    if (adjacentBuilding === buildingType) {
                        adjacentScore += scoreIncrement;
                    }
                }
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
        if (cell.children.length > 0 && cell.children[0].id === 'road') {
            if (prevRoadCol === -1 || col === prevRoadCol + 1) {
                connectedRoads++; // Increment the count if a new road is in the same row as the previous road
            }
            prevRoadCol = col; // Update the previous road column index
        }
    }

    // Return 1 if more than one road is connected in the same row and it's not the first road, otherwise return 0
    return connectedRoads > 1 ? 1 : 0;
}