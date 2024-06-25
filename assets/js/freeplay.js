const grid = document.getElementById('grid');
const buildings = ['residential', 'industry', 'commercial', 'park', 'road'];
let coins = Infinity; // Set coins to Infinity for unlimited coins
let turns = 0;
let score = 0;
let connectedCells = [];
let demolishMode = true;
let gridSize = 5;  // Initial grid size
let gridExpanded = false; // Flag to track if the grid has been expanded
let doubleGridExpanded = false
let buildingData = [];

// Initialize the game
function init() {
    generateGrid();
    setupEventListeners();
    updateCoins(coins);
    updateTurns(turns);
    updateScore(score);
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
  const row = Math.floor(cellIndex / gridSize); // Use the current gridSize
  const col = cellIndex % gridSize;             // Use the current gridSize

  for (const connectedCell of connectedCells) {
      const connectedCellIndex = Array.from(grid.children).indexOf(connectedCell);
      const connectedRow = Math.floor(connectedCellIndex / gridSize); // Use the current gridSize
      const connectedCol = connectedCellIndex % gridSize;             // Use the current gridSize

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

          const cellIndex = Array.from(grid.children).indexOf(cell);
          cloneNode.id = buildingId + "-" + cellIndex; 
          cloneNode.classList.remove("building-icon");
          cloneNode.classList.add("building");
          cloneNode.style.display = "block";

          cell.appendChild(cloneNode);

          buildingData.push({ id: buildingId, index: cellIndex });
            
            turns += 1;
            const buildingScore = calculateBuildingScore(buildingId, cell);
            score += buildingScore;
            updateTurns(turns);
            updateScore(score);
            connectedCells.push(cell); // Add the new cell to connectedCells
            generateRandomBuilding();
        } else {
            alert("You can only build on squares adjacent to existing buildings.");
            return;
        }
    } else {
        alert("You can't build there.");
    }

    if (shouldExpandGrid(cell)) {
        expandGrid();
    }}


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
    return 1;
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
    return 2;
}
// Function to calculate score based on adjacent buildings of a specific type
function calculateAdjacentScore(row, col, buildingType, scoreIncrement) {
  let adjacentScore = 0;
  const adjacentIndices = findAdjacentBuilding(row, col, 20, 20);
  for (const adjacentIndex of adjacentIndices) {
      const adjacentCell = grid.children[adjacentIndex];

      if (adjacentCell?.children?.length) { // Optional chaining for conciseness
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

function checkHighScoreAndUpdate(score) {
    // Logic to check and update the high score
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);