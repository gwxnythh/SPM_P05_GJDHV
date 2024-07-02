const grid = document.getElementById('grid');
const buildings = ['residential', 'industry', 'commercial', 'park', 'road'];
let coins = Infinity; // Set coins to Infinity for unlimited coins
let turns = 0;
let score = 0;
let connectedCells = [];
let demolishMode = false;
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
        cell.addEventListener('click', () => {
            if (!demolishMode) return;

            const buildingElement = cell.querySelector('div.building');
            if (buildingElement && coins >= 1) {
                coins -= 1;
                updateCoins(coins);

                const cellIndex = Array.from(grid.children).indexOf(cell); // Get the correct cell index
                const buildingIndex = buildingData.findIndex(data => data.index === cellIndex);

                if (buildingIndex > -1) {
                    buildingData.splice(buildingIndex, 1);
                }
                buildingElement.remove();

                // Update connectedCells
                connectedCells = Array.from(grid.querySelectorAll('.building')).map(building => building.parentNode);

                disableDemolishMode(); 
            } else if (!buildingElement) {
                alert("No building to demolish!"); 
            } else {
                alert("You don't have enough coins to demolish!");
            }
        });
    });
}
  
  function calculateCellIndex(cell, gridSize) {
    return Array.from(grid.children).indexOf(cell);
}

function generateRandomBuilding() {
    const randomBuilding = buildings[Math.floor(Math.random() * buildings.length)];
    const buildingElement = document.getElementById(randomBuilding);
    // Logic to place the random building icon in the building selection area
}

function calculateBuildingScore(buildingId, cell) {
  let buildingScore = 0;

  const row = Math.floor(Array.from(grid.children).indexOf(cell) / gridSize);
    const col = Array.from(grid.children).indexOf(cell) % gridSize;
  

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

  const row = Math.floor(Array.from(grid.children).indexOf(cell) / gridSize);
    const col = Array.from(grid.children).indexOf(cell) % gridSize;

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
    const adjacentIndices = findAdjacentBuilding(row, col, gridSize, gridSize); // Use gridSize consistently
  
    for (const adjacentIndex of adjacentIndices) {
      const adjacentCell = grid.children[adjacentIndex];
      if (adjacentCell && adjacentCell.children.length > 0) {
        const adjacentBuilding = adjacentCell.children[0].id.split('-')[0]; // Extract base ID
        if (adjacentBuilding === buildingType) {
          adjacentScore += scoreIncrement;
        }
      }
    }
    return adjacentScore;
  }


  function calculateConnectedRoadScore(row) {
    let connectedRoads = 0;
    let prevRoadCol = -1; 

    // Iterate only up to the current grid size
    for (let col = 0; col < gridSize; col++) { 
        const cellIndex = row * gridSize + col; // Calculate correct index

        // Ensure the cell exists before accessing it
        if (cellIndex < grid.children.length) { 
            const cell = grid.children[cellIndex];
            if (cell.children.length > 0 && cell.children[0].id.split('-')[0] === 'road') {
                if (prevRoadCol === -1 || col === prevRoadCol + 1) {
                    connectedRoads++; 
                }
                prevRoadCol = col; 
            }
        }
    }
    
    return connectedRoads > 1 ? 1 : 0;
}

function calculateAdjacentCoinEarned(row, col, buildingType, coinEarned) {
    let adjacentCoinEarned = 0;

    const adjacentIndices = findAdjacentBuilding(row, col, gridSize, gridSize); // Use gridSize here too
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