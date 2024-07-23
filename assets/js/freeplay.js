const grid = document.getElementById('grid');
const buildings = ['residential', 'industry', 'commercial', 'park', 'road'];
let coins = Infinity; // Set coins to Infinity for unlimited coins
let turns = 0;
let score = 0;
let connectedCells = [];
let demolishMode = false;
let gridSize = 5;  // Initial grid size
let gridExpanded = false; // Flag to track if the grid has been expanded
let doubleGridExpanded = false;
let buildingData = [];
let profit = 0; // Initialize profit
let upkeep = 0; // Initialize upkeep

let buildingMode = ''   // mode storing the buildingds type when it is in building mode

const APIKEY = "666c33a61bf4f00fdda6b84e";

// document.addEventListener('DOMContentLoaded', loadGamedata, false);

function loadGamedata() {
    const gameData = JSON.parse(localStorage.getItem('loadedGame'));
    if (gameData) {
        loadGameState(gameData);
    }
}

// Load Game State
function loadGameState(gameData) {

    if (gameData.gridExpanded) {
        gridSize = 15;
        gridExpanded = true;
        generateGrid();
        updateGridStyle();
    } else if (gameData.doubleGridExpanded) {
        gridSize = 25;
        gridExpanded = true;
        doubleGridExpanded = true;
        generateGrid();
        updateGridStyle();
    }

    const allGridCells = document.querySelectorAll('.cell');
    const gridData = JSON.parse(gameData.grid);

    gridData.forEach((grid, index) => {
        if (grid) {
            let cell = allGridCells[grid.index];
            let buildingElement = document.getElementById(grid.buildingId.split('-')[0]);
            let cloneNode = buildingElement.cloneNode(true);
            cloneNode.id = grid.buildingId;
            cloneNode.classList.remove("building-icon");
            cloneNode.classList.add("building");
            cloneNode.style.display = "display";
            cell.appendChild(cloneNode);
            connectedCells.push(cell);
        }
    });
    coins = gameData.coins;
    turns = gameData.turns;
    score = gameData.score;
    upkeep = gameData.upkeep;
    profit = gameData.profit;
    updateCoins(coins);
    updateTurns(turns);
    updateScore(score);
    updateProfit(profit); // Initialize profit display
    updateUpkeep(upkeep);
}

// Initialize the game
function init() {
    generateGrid();
    setupEventListeners();

    loadGamedata();

    updateCoins(coins);
    updateTurns(turns);
    updateScore(score);
    updateProfit(profit); // Initialize profit display
    updateUpkeep(upkeep);
}

function setupEventListeners() {
    buildings.forEach(building => {
        const buildingElement = document.getElementById(building);
        // buildingElement.addEventListener('dragstart', dragStart);
        buildingElement.addEventListener('click', onBuildingClick);
    });

    // grid.addEventListener('dragover', dragOver);
    // grid.addEventListener('drop', drop);
}

function onBuildingClick(event) {
    // Clear previous selection
    buildings.forEach(building => {
        const buildingElement = document.getElementById(building);
        buildingElement.style.border = "";
    });

    // Set the new selection
    buildingMode = event.target.parentNode.id;
    const buildingElement = document.getElementById(buildingMode);
    buildingElement.style.border = "2px dotted var(--primary-color)";
}

// function dragStart(event) {
//     disableDemolishMode();
//     event.dataTransfer.setData('text', event.target.parentNode.id); // Set the data to the parentNode id
// }

// function dragOver(event) {
//     event.preventDefault();
// }

// function drop(event) {
//     event.preventDefault();
//     const buildingId = event.dataTransfer.getData('text');
//     const buildingElement = document.getElementById(buildingId);
//     const cell = event.target;

//     if (cell.classList.contains('cell') && cell.children.length === 0) {
//         let cloneNode = buildingElement.cloneNode(true);

//         const cellIndex = Array.from(grid.children).indexOf(cell);
//         cloneNode.id = buildingId + "-" + cellIndex;
//         cloneNode.classList.remove("building-icon");
//         cloneNode.classList.add("building");
//         cloneNode.style.display = "block";

//         cell.appendChild(cloneNode);

//         buildingData.push({ id: buildingId, index: cellIndex });

//         turns += 1;
//         const buildingScore = calculateBuildingScore(buildingId, cell);
//         score += buildingScore;
//         updateTurns(turns);
//         updateScore(score);
//         connectedCells.push(cell); // Add the new cell to connectedCells

//         // Recalculate profit and upkeep
//         calculateProfitAndUpkeep(buildingId, cell);

//         // Check for game over condition
//         checkGameOver();
//     } else {
//         alert("You can't build there.");
//     }

//     if (shouldExpandGrid(cell)) {
//         expandGrid();
//     }
// }

function generateGrid() {
    // Store building data before clearing
    const previousBuildingData = [...buildingData]; // Create a shallow copy
    buildingData = [];

    grid.innerHTML = '';

    const totalCells = gridSize * gridSize;
    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        grid.appendChild(cell);
    }

    // Re-add buildings to the expanded grid
    repositionBuildings(previousBuildingData);

    // Update connectedCells using Array.from
    connectedCells = Array.from(grid.querySelectorAll('.building')).map(building => building.parentNode);
    cellClicked();
}

function repositionBuildings(previousData) {
    const oldGridSize = gridSize === 25 ? 15 : 5; // Determine the previous grid size correctly

    previousData.forEach(data => {
        const buildingElement = document.getElementById(data.id);
        if (!buildingElement) return;

        // Correct calculation for new index
        const oldRow = Math.floor(data.index / oldGridSize);
        const oldCol = data.index % oldGridSize;
        const expansionOffset = (gridSize - oldGridSize) / 2; // Calculate the offset due to expansion
        const newIndex = (oldRow + expansionOffset) * gridSize + (oldCol + expansionOffset);
        const cell = grid.children[newIndex];

        if (cell) {
            let cloneNode = buildingElement.cloneNode(true);
            cloneNode.id = data.id + "-" + newIndex;
            cloneNode.classList.remove("building-icon");
            cloneNode.classList.add("building");
            cloneNode.style.display = "block";
            cell.appendChild(cloneNode);

            buildingData.push({ id: data.id, index: newIndex });
        }
    });
}

function shouldExpandGrid(cell) {
    const cellIndex = Array.from(grid.children).indexOf(cell);
    const row = Math.floor(cellIndex / gridSize);
    const col = cellIndex % gridSize;

    // Check for first expansion (5x5 to 15x15) or second expansion (15x15 to 25x25)
    return (
        (row === 0 || row === gridSize - 1 || col === 0 || col === gridSize - 1) &&
        ((!gridExpanded && gridSize === 5) || (gridExpanded && !doubleGridExpanded && gridSize === 15)) // Check for the second expansion
    );
}

function expandGrid() {
    if (gridSize === 5) {
        gridExpanded = true;
        gridSize = 15; // Expand to 15x15
    } else if (gridSize === 15) {
        doubleGridExpanded = true;
        gridSize = 25; // Expand to 25x25
    }

    generateGrid();
    updateGridStyle();
}

function calculateNewIndex(oldIndex) {
    const oldGridSize = gridSize - 10; // Calculate the size of the previous grid
    const oldRow = Math.floor(oldIndex / oldGridSize);
    const oldCol = oldIndex % oldGridSize;

    // Calculate the new row and column based on the current grid size
    const newRow = oldRow + (gridSize - oldGridSize) / 2; // Center the buildings
    const newCol = oldCol + (gridSize - oldGridSize) / 2;

    return Math.min(newRow * gridSize + newCol, grid.children.length - 1); // Ensure index is within bounds
}

function updateGridStyle() {
    grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`; // Update columns
    grid.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;    // Update rows
}

function updateCoins(coins) {
    document.getElementById('coins').innerText = '∞'; // Display infinity symbol for unlimited coins
}

function updateTurns(turns) {
    document.getElementById('turns').innerText = turns;
}

function updateScore(score) {
    document.getElementById('score').innerText = score;
}

function updateProfit(profit) {
    document.getElementById('profit').innerText = profit; // Update profit display
}

function updateUpkeep(upkeep) {
    document.getElementById('upkeep').innerText = upkeep; // Update upkeep display
}


document.addEventListener('DOMContentLoaded', registerDemolishEvent, false);

function registerDemolishEvent() {
    const demolishButton = document.getElementById('demolish-btn');
    demolishButton.addEventListener('click', toggleDemolishMode);
}

function toggleDemolishMode() {
    demolishMode = !demolishMode;
    const demolishButton = document.getElementById('demolish-btn');
    demolishButton.style.color = demolishMode ? "red" : "";
}

function disableDemolishMode() {
    demolishMode = false;
    const demolishButton = document.getElementById('demolish-btn');
    demolishButton.style.color = "";
}

registerDemolishEvent();

// Call cellClicked once during initialization
document.addEventListener('DOMContentLoaded', init);
document.addEventListener('DOMContentLoaded', cellClicked);

// Function to remove a cell from connectedCells
function removeCellFromConnectedCells(specificDiv) {
    const index = connectedCells.findIndex(cell => cell.children[0] === specificDiv);
    if (index !== -1) {
        connectedCells.splice(index, 1);
    }
}

function cellClicked() {
    // Remove existing event listeners before reattaching
    const cells = document.querySelectorAll('#grid .cell');
    cells.forEach(cell => {
        cell.replaceWith(cell.cloneNode(true)); // Clone to remove event listeners
    });

    // Re-attach the event listeners to the new cells
    const newCells = document.querySelectorAll('#grid .cell');
    newCells.forEach(cell => {
        cell.addEventListener('click', function () {
            if (demolishMode && cell.children.length > 0) {
                const specificDiv = cell.children[0];
                removeCellFromConnectedCells(specificDiv); // Remove the cell from connectedCells
                specificDiv.remove();
                const cellIndex = Array.from(grid.children).indexOf(cell);
                const dataIndex = buildingData.findIndex(data => data.index === cellIndex);
                if (dataIndex !== -1) {
                    buildingData.splice(dataIndex, 1); // Remove the building data
                }
                
                // Recalculate profit and upkeep
                calculateProfitAndUpkeep();
                
                // Check for game over condition
                checkGameOver();
            } else if (buildingMode) {
                const buildingId = buildingMode;
                const buildingElement = document.getElementById(buildingId);
            
                if (cell.classList.contains('cell') && cell.children.length === 0) {
                    let cloneNode = buildingElement.cloneNode(true);
            
                    const cellIndex = Array.from(grid.children).indexOf(cell);
                    cloneNode.id = buildingId + "-" + cellIndex;
                    cloneNode.classList.remove("building-icon");
                    cloneNode.classList.add("building");
                    cloneNode.style.display = "block";
                    cloneNode.style.border = '';
            
                    cell.appendChild(cloneNode);
            
                    buildingData.push({ id: buildingId, index: cellIndex });
            
                    turns += 1;
                    const buildingScore = calculateBuildingScore(buildingId, cell);
                    score += buildingScore;
                    updateTurns(turns);
                    updateScore(score);
                    connectedCells.push(cell); // Add the new cell to connectedCells
            
                    // Recalculate profit and upkeep
                    calculateProfitAndUpkeep(buildingId, cell);
            
                    // Check for game over condition
                    checkGameOver();

                    // reset building mode
                    buildingElement.style.border = "";
                    buildingMode  = '';
                } else {
                    alert("You can't build there.");
                }
            
                if (shouldExpandGrid(cell)) {
                    expandGrid();
                }
            }
        });
    });
}

// Initialize variables to keep track of total industry count and cumulative coin generation
let totalIndustryCount = 0;
let totalCoinsGenerated = 0;

function calculateBuildingScore(buildingId, cell) {
    let buildingScore = 0;
    const adjacentCells = getAdjacentCells(cell);

    if (buildingId === "residential") {
        let adjacentIndustry = false;
        let adjacentResidentialCount = 0;
        let adjacentCommercialCount = 0;
        let adjacentParkCount = 0;

        adjacentCells.forEach(adjacentCell => {
            if (adjacentCell.children.length > 0) {
                const adjacentBuildingId = adjacentCell.children[0].id.split('-')[0];
                if (adjacentBuildingId === "industry") {
                    adjacentIndustry = true;
                } else if (adjacentBuildingId === "residential") {
                    adjacentResidentialCount++;
                } else if (adjacentBuildingId === "commercial") {
                    adjacentCommercialCount++;
                } else if (adjacentBuildingId === "park") {
                    adjacentParkCount++;
                }
            }
        });

        buildingScore = adjacentIndustry ? 1 : 0; // Scores 1 point if adjacent to industry
        buildingScore += adjacentResidentialCount * 1; // Scores 1 point per adjacent residential
        buildingScore += adjacentCommercialCount * 1; // Scores 1 point per adjacent commercial
        buildingScore += adjacentParkCount * 2; // Scores 2 points per adjacent park
    } else if (buildingId === "industry") {
        let adjacentResidentialCount = 0;

        adjacentCells.forEach(adjacentCell => {
            if (adjacentCell.children.length > 0) {
                const adjacentBuildingId = adjacentCell.children[0].id.split('-')[0];
                if (adjacentBuildingId === "residential") {
                    adjacentResidentialCount++;
                }
            }
        });

        // Increment total industry count
        totalIndustryCount++;

        // Each industry generates coins based on adjacent residential buildings
        totalCoinsGenerated += adjacentResidentialCount;

        buildingScore = totalIndustryCount * 1; // Scores 1 point per total industry count
        // No need to return coins here, handle coins generation elsewhere
    } else if (buildingId === "commercial") {
        let adjacentCommercialCount = 0;

        adjacentCells.forEach(adjacentCell => {
            if (adjacentCell.children.length > 0) {
                const adjacentBuildingId = adjacentCell.children[0].id.split('-')[0];
                if (adjacentBuildingId === "commercial") {
                    adjacentCommercialCount++;
                } else if (adjacentBuildingId === "residential") {
                    // Handle coins generation for commercial if needed
                }
            }
        });

        buildingScore = adjacentCommercialCount * 1; // Scores 1 point per adjacent commercial
        // Handle coins generation elsewhere
    } else if (buildingId === "park") {
        let adjacentParkCount = 0;

        adjacentCells.forEach(adjacentCell => {
            if (adjacentCell.children.length > 0) {
                const adjacentBuildingId = adjacentCell.children[0].id.split('-')[0];
                if (adjacentBuildingId === "park") {
                    adjacentParkCount++;
                }
            }
        });

        buildingScore = adjacentParkCount * 1; // Scores 1 point per adjacent park
    } else if (buildingId === "road") {
        let connectedRoadCount = 0;

        // Check horizontally connected roads in the same row
        let row = cell.row;
        adjacentCells.forEach(adjacentCell => {
            if (adjacentCell.children.length > 0) {
                const adjacentBuildingId = adjacentCell.children[0].id.split('-')[0];
                if (adjacentBuildingId === "road" && adjacentCell.row === row) {
                    connectedRoadCount++;
                }
            }
        });

        buildingScore = connectedRoadCount * 1; // Scores 1 point per connected road in the same row
    }

    return buildingScore;
}


function getAdjacentCells(cell) {
    const cellIndex = Array.from(grid.children).indexOf(cell);
    const row = Math.floor(cellIndex / gridSize);
    const col = cellIndex % gridSize;

    const adjacentCells = [];

    if (row > 0) adjacentCells.push(grid.children[cellIndex - gridSize]); // Top
    if (row < gridSize - 1) adjacentCells.push(grid.children[cellIndex + gridSize]); // Bottom
    if (col > 0) adjacentCells.push(grid.children[cellIndex - 1]); // Left
    if (col < gridSize - 1) adjacentCells.push(grid.children[cellIndex + 1]); // Right

    return adjacentCells;
}

function calculateProfitAndUpkeep(buildingId, cell) {
    switch(buildingId) {
        case 'residential':
            adjacentCells = getAdjacentCells(cell);
            isResidentCluster = true;
            adjacentCells.forEach(adjacentCell => {
                if (adjacentCell.children.length > 0 && adjacentCell.children[0].id.split('-')[0] === 'residential') {
                    isResidentCluster = false;
                }
            });
            if (isResidentCluster)  {
                upkeep += 1;
            }
            profit += 1;
            break;
        case 'industry':
            upkeep += 1;
            profit += 2;
            break;
        case 'commercial':
            upkeep += 1;
            profit += 3;
            break;
        case 'park':
            upkeep += 1;
            profit -= 1;
            break;
        case 'road':
            adjacentCells = getAdjacentCells(cell);
            numOfResidentAdjacent = 0;
            adjacentCells.forEach(adjacentCell => {
                if (adjacentCell.children.length > 0 && adjacentCell.children[0].id.split('-')[0] === 'road') {
                    numOfResidentAdjacent += 1;
                }
            });      
            upkeep += calculateUpKeepForRoad(numOfResidentAdjacent);
            profit -= 1;
            break;
    }

    updateProfit(profit); // Update profit display
    updateUpkeep(upkeep); // Update upkeep display
}

function calculateUpKeepForRoad(numOfResidentAdjacent) {
    if (numOfResidentAdjacent == 0) {
        return 1;
    } else if (numOfResidentAdjacent == 1) {
        return 0;
    } else if (numOfResidentAdjacent == 2) {
        return -1;
    } else if (numOfResidentAdjacent == 3) {
        return -2;
    }
}

function checkGameOver() {
    if (profit < upkeep) {
        // alert("Game Over! Profit is less than upkeep.");
        alert("Game Over! Your Profit is less than upkeep. You have score: " + score + ", profit: " + profit + ", and upkeep: " + upkeep);
        // checkHighScoreAndUpdate(score);
        var username = localStorage.getItem('loggedInUsername')
        if (username != null) {
            saveNewHighestScore(username, score);
        }
        // disableInteractions();
    }
}

function disableInteractions() {
    grid.removeEventListener('dragover', dragOver);
    grid.removeEventListener('drop', drop);
    const cells = document.querySelectorAll('#grid .cell');
    cells.forEach(cell => {
        cell.replaceWith(cell.cloneNode(true)); // Remove event listeners
    });
}

function checkHighScoreAndUpdate(newScore) {
    fetch(`https://ngeeanncity-a92e.restdb.io/rest/freeplayleaderboard?q={}&h={"$max":1}&sort=score&dir=-1`, {
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
                // let username = prompt("Please enter your name");
                var username = localStorage.getItem('loggedInUsername')
                if (username != null) {
                    saveNewHighestScore(username, newScore);
                }
            }
        });
}

function saveNewHighestScore(username, newScore) {
    fetch(`https://ngeeanncity-a92e.restdb.io/rest/freeplayleaderboard`, {
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
            window.location.href = 'index.html';
        });
}

const exitButton = document.getElementById("exit-button");
exitButton.addEventListener("click", function () {
    let filename = prompt("Please enter your file name:");
    if (filename != null) {
        saveGameData(filename);
    }
});

function saveGameData(filename) {
    let savedGrid = [];
    var grid = document.getElementById('grid');
    for (let i = 0; i < grid.children.length; i++) {
        var childWithClass = grid.children[i].querySelector('.building');
        if (childWithClass) {
            savedGrid.push({ index: i, buildingId: childWithClass.id})
        }
    }
    let jsondata = {
        "name": localStorage.getItem('loggedInUsername'),
        "filename": filename,
        "grid": JSON.stringify(savedGrid),
        "coins": coins,
        "turns": turns,
        "score": score,
        "upkeep": upkeep,
        "profit": profit,
        "gridExpanded": gridExpanded,
        "doubleGridExpanded": doubleGridExpanded
    };

    fetch(`https://ngeeanncity-a92e.restdb.io/rest/freeplaygamedata`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": APIKEY,
            "Cache-Control": "no-cache",
        },
        body: JSON.stringify(jsondata),
    })
        .then((res) => res.json())
        .then((response) => {
            window.location.href = 'index.html';
            alert("Game data saved successfully!");
        });
}
