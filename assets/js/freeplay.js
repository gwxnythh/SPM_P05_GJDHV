const grid = document.getElementById('grid');
const buildings = ['residential', 'industry', 'commercial', 'park', 'road'];
let coins = Infinity; // Set coins to Infinity for unlimited coins
let turns = 0;
let score = 0;
let connectedCells = [];
let demolishMode = false;

// Initialize the game
function init() {
    generateGrid();
    setupEventListeners();
    updateCoins(coins);
    updateTurns(turns);
    updateScore(score);
}

function generateGrid() {
    for (let i = 0; i < 5 * 5; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        grid.appendChild(cell);
    }
    cellClicked();
}

function setupEventListeners() {
    buildings.forEach(building => {
        const buildingElement = document.getElementById(building);
        buildingElement.addEventListener('dragstart', dragStart);
    });

    grid.addEventListener('dragover', dragOver);
    grid.addEventListener('drop', drop);

    const demolishButton = document.getElementById('demolish-btn');
    demolishButton.addEventListener('click', toggleDemolishMode);
}

function dragStart(event) {
    disableDemolishMode();
    event.dataTransfer.setData('text', event.target.parentNode.id); // Set the data to the parentNode id
}

function dragOver(event) {
    event.preventDefault();
}

function isAdjacentToConnected(cell) {
    const cellIndex = Array.from(grid.children).indexOf(cell);
    const row = Math.floor(cellIndex / 5);
    const col = cellIndex % 5;

    for (const connectedCell of connectedCells) {
        const connectedCellIndex = Array.from(grid.children).indexOf(connectedCell);
        const connectedRow = Math.floor(connectedCellIndex / 5);
        const connectedCol = connectedCellIndex % 5;

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
        if (connectedCells.length === 0 || isAdjacentToConnected(cell)) {
            let cloneNode = buildingElement.cloneNode(true);

            cloneNode.id = buildingId + "-" + Array.from(grid.children).indexOf(cell);
            cloneNode.classList.remove("building-icon");
            cloneNode.classList.add("building");
            cloneNode.style.display = "block";

            cell.appendChild(cloneNode);

            turns += 1;
            const buildingScore = calculateBuildingScore(buildingId, cell);
            score += buildingScore;
            updateTurns(turns);
            updateScore(score);
            connectedCells.push(cell);
            generateRandomBuilding();
        } else {
            alert("You can only build on squares adjacent to existing buildings.");
            return;
        }
    } else {
        alert("You can't build there.");
    }
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

function toggleDemolishMode() {
    demolishMode = !demolishMode;
    const demolishButton = document.getElementById('demolish-btn');
    demolishButton.classList.toggle('active', demolishMode);
}

function disableDemolishMode() {
    demolishMode = false;
    const demolishButton = document.getElementById('demolish-btn');
    demolishButton.classList.remove('active');
}

function cellClicked() {
    // Logic for cell click events when in demolish mode
    grid.addEventListener('click', event => {
        const cell = event.target;
        if (demolishMode && cell.classList.contains('cell') && cell.children.length > 0) {
            const buildingElement = cell.firstChild;
            const buildingId = buildingElement.id.split('-')[0];
            cell.removeChild(buildingElement);
            connectedCells = connectedCells.filter(c => c !== cell);
            turns += 1;
            updateTurns(turns);
        }
    });
}

function generateRandomBuilding() {
    const randomBuilding = buildings[Math.floor(Math.random() * buildings.length)];
    const buildingElement = document.getElementById(randomBuilding);
    // Logic to place the random building icon in the building selection area
}

function calculateBuildingScore(buildingId, cell) {
    // Placeholder function to calculate building score
    return 1;
}

function calculateBuildingCoinEarned(buildingId, cell) {
    // Placeholder function to calculate coins earned
    return 2;
}

function checkHighScoreAndUpdate(score) {
    // Logic to check and update the high score
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
