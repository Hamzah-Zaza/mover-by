document.addEventListener("DOMContentLoaded", () => {
  const gameBoard = document.getElementById("gameBoard");
  const infoBox = document.getElementById("infoBox"); // Reference to the info box
  const speed = 353;
  let score = 0; // Variable to keep track of the score
  let visitedCollisionCells = []; // Array to store visited collision cell coordinates
  let ghosts = [];
  let lives = 3; // Add this variable to keep track of lives

  // Add this function to display lives
  const displayLives = () => {
    const livesBox = document.getElementById("livesBox");
    if (livesBox) {
      livesBox.textContent = `Lives: ${lives}`;
    }
  };

  // Modify displayLivesAndScore to call displayLives
  const displayLivesAndScore = () => {
    displayScore();
    displayLives(); // Call the new function to display lives
  };

  const createCell = () => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    return cell;
  };

  const createGhost = (index) => {
    const ghost = document.createElement("div");
    ghost.classList.add("ghost", `ghost-${index}`);
    return ghost;
  };

  const populateGameBoard = () => {
    const forbiddenCells = [
      [0, 4], [0, 5], [1, 0], [1, 19], [2, 0], [2, 4], [2, 5], [2, 7], [2, 10], [2, 11],
      [2, 14], [2, 19], [3, 4], [3, 7], [3, 9], [3, 10], [3, 11], [3, 14], [3, 15], [3, 16],
      [4, 0], [4, 2], [4, 7], [4, 14], [5, 0], [5, 3], [5, 10], [5, 12], [5, 14], [5, 16],
      [5, 19], [6, 2], [6, 10], [6, 11], [6, 19], [7, 0], [7, 3], [7, 7], [7, 11], [7, 12],
      [7, 14], [7, 15], [7, 17], [8, 0], [8, 2], [8, 5], [8, 9], [8, 19], [9, 0], [9, 6],
      [9, 11], [9, 12], [9, 13], [9, 14], [9, 15], [9, 19], [10, 0], [10, 5], [10, 7],
      [10, 11], [10, 11], [10, 17], [11, 0], [11, 4], [11, 10], [11, 17], [12, 0], [12, 2],
      [12, 3], [12, 12], [12, 13], [12, 14], [12, 15], [12, 17], [13, 0], [13, 3], [13, 6],
      [13, 8], [13, 9], [13, 15], [13, 17], [14, 2], [14, 15], [14, 17], [14, 19], [15, 3],
      [15, 10], [15, 12], [15, 15], [15, 17], [15, 19], [16, 5], [16, 6], [16, 7], [16, 8],
      [16, 9], [16, 11], [16, 16], [17, 0], [17, 1], [17, 2], [17, 5], [17, 9], [17, 14],
      [17, 19], [18, 16], [19, 0], [19, 2], [19, 3], [19, 4], [19, 6], [19, 7], [19, 8],
      [19, 9], [19, 10], [19, 14], [19, 18], [19, 19],
    ];
    
    const collisionCells = [
      [1, 3], [1, 9], [1, 18], [3, 1], [3, 6], [5, 18], [8, 17], [9, 7],
      [11, 2], [11, 11], [16, 2], [16, 18], [17, 8], [19, 15],
    ];

    // New winning cell coordinates
    const winningCellCoords = [19, 17];

    for (let row = 0; row < 20; row++) {
      for (let column = 0; column < 20; column++) {
        const cell = createCell();
        cell.style.left = column * 20 + "px";
        cell.style.top = row * 20 + "px";

        // Check if the current cell is a forbidden cell
        if (
          forbiddenCells.some(
            (coords) => coords[0] === row && coords[1] === column
          )
        ) {
          cell.classList.add("forbidden");
          // Set data attributes to identify the forbidden cells
          cell.dataset.row = row;
          cell.dataset.column = column;
        }

        // Check if the current cell is the winning cell
        if (winningCellCoords[0] === row && winningCellCoords[1] === column) {
          cell.classList.add("winning-cell");
          cell.style.backgroundColor = "yellow"; // Set mover color
        }

        gameBoard.appendChild(cell);
      }
    }

    collisionCells.forEach((coords, index) => {
      const collisionCell = createCell();
      collisionCell.classList.add("collision", `collision-${index}`);
      collisionCell.style.left = coords[1] * 20 + "px";
      collisionCell.style.top = coords[0] * 20 + "px";
      collisionCell.dataset.row = coords[0];
      collisionCell.dataset.column = coords[1];
      gameBoard.appendChild(collisionCell);
    });



    const ghostPositions = [
      { x: 5, y: 3 },
      { x: 7, y: 17 },
      { x: 11, y: 11 },
      { x: 17, y: 3 },
    ];

    ghostPositions.forEach((position, index) => {
      const ghost = createGhost(index);
      ghost.style.left = `${position.x * 20}px`;
      ghost.style.top = `${position.y * 20}px`;
      gameBoard.appendChild(ghost);
      ghosts.push(ghost);
    });
  };

  // Modify moveGhost function to store interval ID
  const moveGhost = (ghost) => {
    ghost.intervalId = setInterval(() => {
      // Check if lives are greater than 0 before allowing the ghost to move
      if (lives > 0) {
        let randomDirection;

        do {
          randomDirection = Math.floor(Math.random() * 4); // 0: up, 1: down, 2: left, 3: right
        } while (!isValidDirection(ghost, randomDirection));

        let nextX = parseInt(ghost.style.left);
        let nextY = parseInt(ghost.style.top);

        // Adjust the nextX and nextY based on the randomDirection
        switch (randomDirection) {
          case 0: // up
            nextY = Math.max(0, nextY - 20);
            break;
          case 1: // down
            nextY = Math.min(380, nextY + 20);
            break;
          case 2: // left
            nextX = Math.max(0, nextX - 20);
            break;
          case 3: // right
            nextX = Math.min(380, nextX + 20);
            break;
        }

        ghost.style.left = nextX + "px";
        ghost.style.top = nextY + "px";
      }
    }, speed);
  };

  // Function to check if the next direction is valid
  const isValidDirection = (ghost, direction) => {
    let nextX = parseInt(ghost.style.left);
    let nextY = parseInt(ghost.style.top);

    switch (direction) {
      case 0: // up
        nextY = Math.max(0, nextY - 20);
        break;
      case 1: // down
        nextY = Math.min(390, nextY + 20);
        break;
      case 2: // left
        nextX = Math.max(0, nextX - 20);
        break;
      case 3: // right
        nextX = Math.min(390, nextX + 20);
        break;
    }

    const forbiddenCell = gameBoard.querySelector(
      '.forbidden[data-row="' +
        Math.floor(nextY / 20) +
        '"][data-column="' +
        Math.floor(nextX / 20) +
        '"]'
    );
    return !forbiddenCell;
  };

  // Function to display the score on the screen
  const displayScore = () => {
    if (infoBox) {
      infoBox.textContent = `Score: ${score}`;
    }
  };

  const createMover = () => {
    const mover = document.createElement("div");
    mover.classList.add("mover");
    return mover;
  };

  populateGameBoard();

  const mover = createMover();
  gameBoard.appendChild(mover);

  let moverPosition = { x: 0, y: 0 };
  let moving = false;

  const updateMoverPosition = () => {
    mover.style.transform = `translate(${moverPosition.x * 20}px, ${
      moverPosition.y * 20
    }px)`;
  };

  let intervalId;
  let currentDirection;

  // Modify handleGhostCollision to call displayLivesAndScore and show game-over cover
  const handleGhostCollision = () => {
    const moverRect = mover.getBoundingClientRect();

    ghosts.forEach((ghost, index) => {
      const ghostRect = ghost.getBoundingClientRect();

      // Check for collision between Mover and each ghost
      if (
        moverRect.left < ghostRect.right &&
        moverRect.right > ghostRect.left &&
        moverRect.top < ghostRect.bottom &&
        moverRect.bottom > ghostRect.top
      ) {
        // Collision with a ghost
        lives--;

        // Update and display lives and score
        displayLivesAndScore();

        if (lives > 0) {
          // Mover still has lives, reset positions
          moverPosition = { x: 0, y: 0 };
          updateMoverPosition();

          // Reset ghosts to their initial positions
          ghostPositions.forEach((position, ghostIndex) => {
            ghosts[ghostIndex].style.left = `${position.x * 20}px`;
            ghosts[ghostIndex].style.top = `${position.y * 20}px`;
          });
        } else {
          // Lives reached 0, show game-over cover
          const gameOverCover = document.getElementById("gameOverCover");
          if (gameOverCover) {
            gameOverCover.style.display = "block";
          }
        }
      }
    });
  };

  // Function to check if a collision cell has already been visited
  const isCollisionCellVisited = (x, y) => {
    return visitedCollisionCells.some(
      (coords) => coords.x === x && coords.y === y
    );
  };

  // Function to stop all game movements
  const stopGameMovements = () => {
    clearInterval(intervalId); // Stop Mover movement
    ghosts.forEach((ghost) => clearInterval(ghost.intervalId)); // Stop all ghosts movements
    moving = false;
  };

  // Modify handleMoverMovement function to check for winning conditions
  const handleMoverMovement = (nextX, nextY) => {
    const forbiddenCell = gameBoard.querySelector(
      '.forbidden[data-row="' + nextY + '"][data-column="' + nextX + '"]'
    );
    const collisionCell = gameBoard.querySelector(
      '.collision[data-row="' + nextY + '"][data-column="' + nextX + '"]'
    );

    // Check if the next position is forbidden or a collision cell
    if (forbiddenCell) {
      clearInterval(intervalId);
      moving = false;
    } else {
      moverPosition.x = nextX;
      moverPosition.y = nextY;
      updateMoverPosition();

      // If it's a collision cell and hasn't been visited, increase the score,
      // store the new color, change Mover color to the collision cell color
      if (collisionCell && !isCollisionCellVisited(nextX, nextY)) {
        score += 10; // Increase the score by 10 (you can adjust this as needed)
        visitedCollisionCells.push({ x: nextX, y: nextY }); // Mark the collision cell as visited
        displayScore(); // Function to display the updated score

        // Get the background color of the collision cell
        const collisionColor = getComputedStyle(collisionCell).backgroundColor;

        // Change Mover color to the collision cell color
        mover.style.backgroundColor = collisionColor;

        // Optional: Remove the collision cell
        collisionCell.remove();
      }

      // Call handleGhostCollision to check for collisions with ghosts
      handleGhostCollision();

      // Check if the user has 140 points and reached the winning cell
      const winningCellCoords = [19, 17];
      if (
        score >= 140 &&
        moverPosition.x === winningCellCoords[1] &&
        moverPosition.y === winningCellCoords[0]
      ) {
        stopGameMovements(); // Stop all movements when winning conditions are met
        const gameOverCover = document.getElementById("gameOverCover");
        if (gameOverCover) {
          // Display "Victory" in the center of the game-over-cover
          gameOverCover.textContent = "Victory";
          gameOverCover.style.color = "white";
          gameOverCover.style.display = "block";
        }
        return; // Add this to exit the function after winning conditions are met
      }

      // Check if lives have reached 0
      if (lives <= 0) {
        stopGameMovements(); // Stop all movements when lives reach 0
        const gameOverCover = document.getElementById("gameOverCover");
        if (gameOverCover) {
          // Display "Defeat" in the center of the game-over-cover
          gameOverCover.textContent = "Defeat";
          gameOverCover.style.color = "white";
          gameOverCover.style.display = "block";
        }
      }
    }
  };

  let ghostsStartedMoving = false; // Add this variable to track whether ghosts started moving

  // Function to start moving the ghosts after a brief delay
  const startGhostMovements = () => {
    ghosts.forEach((ghost, index) => {
      moveGhost(ghost);
    });
  };

  const moveMover = () => {
    if (!moving && lives > 0 && score < 140) {
      // Add condition to check if score is less than 140
      moving = true;

      intervalId = setInterval(() => {
        let nextX = moverPosition.x;
        let nextY = moverPosition.y;

        switch (currentDirection) {
          case "up":
            nextY = Math.max(0, nextY - 1);
            break;
          case "down":
            nextY = Math.min(19, nextY + 1);
            break;
          case "left":
            nextX = Math.max(0, nextX - 1);
            break;
          case "right":
            nextX = Math.min(19, nextX + 1);
            break;
        }

        // Call the separate function to handle Mover movement
        handleMoverMovement(nextX, nextY);

        // Check if winning conditions are met
        if (
          score >= 140 &&
          nextX === winningCellCoords[1] &&
          nextY === winningCellCoords[0]
        ) {
          stopGameMovements(); // Stop all movements when winning conditions are met
        }

        // Check if lives have reached 0
        if (lives <= 0) {
          stopGameMovements(); // Stop all movements when lives reach 0
        }

        // Start moving the ghosts after Mover's first move
        if (!ghostsStartedMoving) {
          ghostsStartedMoving = true;
          startGhostMovements();
        }
      }, speed);
    }
  };

  document.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "ArrowUp":
        currentDirection = "up";
        moveMover();
        break;
      case "ArrowDown":
        currentDirection = "down";
        moveMover();
        break;
      case "ArrowLeft":
        currentDirection = "left";
        moveMover();
        break;
      case "ArrowRight":
        currentDirection = "right";
        moveMover();
        break;
    }
  });
});
