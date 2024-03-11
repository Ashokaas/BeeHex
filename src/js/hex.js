
let currentGame;

var unsavedChanges = false;

const hexagonStates = {
    0 : "empty",
    1 : "player1",
    2 : "player2",
    3 : "wall"
}


function generateGrid(n) {
    let hexSection = document.querySelector("#hexagon-grid");
    hexSection.innerHTML = "";
    for (let i = 0; i < n; i++) {
        let row = document.createElement("section");
        row.classList.add("hexagon-row");
        hexSection.appendChild(row);

        for (let k = 0; k < i; k++) {
            let spacer = document.createElement("div");
            spacer.classList.add("spacer");
            row.appendChild(spacer);
        }
        for (let j = 0; j < n; j++) {
            let first_border = document.createElement("div")
            first_border.classList.add("hexagon_border")
            first_border.style.transform = "scale(1.2)"
            first_border.style.backgroundColor = "rgb(27, 27, 27)"
            row.appendChild(first_border)


            let greenHex = document.createElement("div");
            greenHex.style.zIndex = "-10"
            greenHex.classList.add("hexagon_border");
            
            // (Ouest) Si première colonne
            if (j === 0 && (i > 0 && i < n-1) ) {
                greenHex.classList.add("hexagon_w_border");
            } 
            // (Nord) Si première ligne
            else if (i === 0 && (j > 0 && j < n-1)) {
                greenHex.classList.add("hexagon_n_border");
            }
            // (Est) Si dernière colonne
            else if (j === n-1 && (i > 0 && i < n-1)) {
                greenHex.classList.add("hexagon_e_border");
            } 
            // (Sud) Si dernière ligne
            else if (i === n-1 && (j > 0 && j < n-1)) {
                greenHex.classList.add("hexagon_s_border");
            }

            // (Nord-Ouest) Si première ligne et première colonne
            else if (i === 0 && j === 0) {
                greenHex.classList.add("hexagon_nw_border");
            }
            // (Nord-Est) Si première ligne et dernière colonne
            else if (i === 0 && j === n-1) {
                greenHex.classList.add("hexagon_ne_border");
            }
            // (Sud-Ouest) Si dernière ligne et première colonne
            else if (i === n-1 && j === 0) {
                greenHex.classList.add("hexagon_sw_border");
            }
            // (Sud-Est) Si dernière ligne et dernière colonne
            else if (i === n-1 && j === n-1) {
                greenHex.classList.add("hexagon_se_border");
            }


            row.appendChild(greenHex);
            
            let hex = document.createElement("div");
            hex.classList.add("hexagon");
            hex.classList.add(`${j}-${i}`);
            hex.setAttribute("onclick", "currentGame.clickHexagon(this)")
            row.appendChild(hex);


        }
    }
}

function startGame(gridSize, j1_name, j2_name, j1_type, j2_type, timer) {
    document.getElementById("player1-name").innerText = j1_name;
    document.getElementById("player2-name").innerText = j2_name;
    clearGrid();
    currentGame = new Game(gridSize);
    unsavedChanges = true;
    // document.getElementById(`player1_status`).classList.add("current_player");
    document.getElementById('victory_screen').style.display = "none";
    generateGrid(gridSize);
}

function clearGrid() {
    let hexSection = document.querySelector("#hexagon-grid");
    hexSection.innerHTML = "";

}

function clickEventHexagon(hex) {
    let coords = hex.classList[1].split("-");
    let x = parseInt(coords[0]);
    let y = parseInt(coords[1]);
    hex.classList.add(currentGame.placePiece(x, y))
}

function generateRandomGrid(n) {
    if (n >= 20) {
        n = 1
    }
    generateGrid(n);
    setTimeout(() => {
        generateRandomGrid(n+1);
    }, 500);
}


// Hexagon states : Empty = 0 | Player 1 = 1 | Player 2 = 2 | Wall = 3 
class Game {
    constructor(size) {
        this.board = new Board(size);
        this.turn = 1
        this.turns = 0;
        this.player1Color = "red";
        this.player2Color = "blue";
        document.getElementById('player'+ this.turn + '-timer').classList.add(this["player" + this.turn + "Color"]);
        document.getElementById('player'+ this.turn + '-timer').classList.add("active-timer");
    }
    
    clickHexagon(hexagon) {
        let coords = hexagon.classList[1].split("-");
        let x = parseInt(coords[0]);
        let y = parseInt(coords[1]);
        console.log(this.board.grid);
        if (this.board.isValidPlacementXY(x, y)) {
            this.board.applyMoveXY(x, y, this.turn);
            this.updateVisualHexagon(hexagon, this.turn)
            
            let result = this.board.checkForWinnerXY(x, y);
            if (result.winner) {
                unsavedChanges = false;
                document.getElementById('victory_screen').style.display = "flex";
                document.getElementById('victory_screen').getElementsByTagName('span')[0].innerText = `Joueur ${this.turn}`;
                document.getElementById(`player${this.turn}-timer`).classList.remove(`${this[`player${this.turn}Color`]}`);
                document.getElementById(`player${this.turn}-timer`).classList.remove("active-timer");
                currentGame = undefined;
                return;
            }
         //   document.getElementById(`player${this.turn}_status`).classList.remove("current_player");
            
            document.getElementById(`player${this.turn}-timer`).classList.remove(`${this[`player${this.turn}Color`]}`);
            document.getElementById(`player${this.turn}-timer`).classList.remove("active-timer");
            this.turn = this.turn === 1 ? 2 : 1;
            this.turns++;
         //   document.getElementById(`player${this.turn}_status`).classList.add("current_player");
            document.getElementById(`player${this.turn}-timer`).classList.add(`${this[`player${this.turn}Color`]}`);
            document.getElementById(`player${this.turn}-timer`).classList.add("active-timer");
            
            
        }
    }
    updateVisualHexagon(visualHexagon, state) {
        visualHexagon.classList.remove("empty", this.player1Color, this.player2Color, "wall");
        let stateClass = hexagonStates[state];
        if (stateClass === "player1") {
            stateClass = this.player1Color;
        }
        if (stateClass === "player2") {
            stateClass = this.player2Color;
        }
        visualHexagon.classList.add(stateClass);
    }
}

class Board {
    constructor(size) {
        this.size = size;
        this.grid = new Array(size).fill().map(() => Array(size).fill(0));
    }

    isValidPlacementXY(x, y) {
        return this.grid[y][x] === 0;
    }
    isValidPlacement(hexagon) {
        return this.isValidPlacementXY(hexagon[0], hexagon[1]);
    }

    applyMoveXY(x, y, type) {
        this.grid[y][x] = type;
        return this;
    }

    applyMove(move) {
        this.grid[move[1]][move[0]] = move[2];
        return this;
    }
    applyMoves(moves) {
        for (let move of moves) {
            this.applyMove(move);
        }
        return this;
    }

    copy() {
        let newBoard = new Board(this.size);
        for (let i = 0; i < this.size; i++) {
            newBoard.grid[i] = this.grid[i].slice();
        }
        return newBoard;
    }
    checkForWinnerXY(x, y) {
        let hexagonState = this.grid[y][x];
        if (hexagonState != 1 && hexagonState != 2) {
            console.warn("Check for winner called on hexagon of type " + hexagonState + ".");
            return { winner: false, winningHexagons: [] };
        }
    
        let hexagonsToCheck = [[x, y]];
        let checkedHexagons = [];
        let winningHexagons = [];
        let lowerBound = false;
        let higherBound = false;
    
        while (hexagonsToCheck.length > 0) {
            let hexagon = hexagonsToCheck.pop();
            checkedHexagons.push(this.hashHexagon(hexagon));
            winningHexagons.push(hexagon); // Ajout de l'hexagone à la liste gagnante
    
            let ownSurroundingHexagons = this.filterHexagons(this.getSurroundingHexagons(hexagon[0], hexagon[1]), hexagonState);
    
            for (let ownHexagon of ownSurroundingHexagons) {
                if (!checkedHexagons.includes(this.hashHexagon(ownHexagon))) {
                    hexagonsToCheck.push(ownHexagon);
                }
            }
    
            if (hexagonState === 1) {
                if (hexagon[0] === 0) {
                    lowerBound = true;
                }
                if (hexagon[0] === this.size - 1) {
                    higherBound = true;
                }
            } else {
                if (hexagon[1] === 0) {
                    lowerBound = true;
                }
                if (hexagon[1] === this.size - 1) {
                    higherBound = true;
                }
            }
    
            if (lowerBound && higherBound) {
                return { winner: true, winningHexagons: winningHexagons };
            }
        }
    
        return { winner: false, winningHexagons: [] };
    }
    

    hashXY(x, y) {
        return x + y * this.size
    }

    hashHexagon(hexagon) {
        return this.hashXY(hexagon[0], hexagon[1])
    }

    checkForWinner(hexagon) {
        this.checkForWinnerXY(hexagon[0], hexagon[1]);
    }

    filterHexagons(hexagons, state) {
        let filteredHexagons = []
        for (let hexagon of hexagons) {
            if (this.grid[hexagon[1]][hexagon[0]] === state) {
                filteredHexagons.push(hexagon);
            }
        }
        return filteredHexagons
    }

    getSurroundingHexagons(x, y) {
        let surroundingHexagons = [];
        if (x > 0) {
            surroundingHexagons.push([x - 1, y]);
        }
        if (x < this.size - 1) {
            surroundingHexagons.push([x + 1, y]);
        }
        if (y > 0) {
            surroundingHexagons.push([x, y - 1]);
        }
        if (y < this.size - 1) {
            surroundingHexagons.push([x, y + 1]);
        }
        if (x > 0 && y < this.size - 1) {
            surroundingHexagons.push([x - 1, y + 1]);
        }
        if (x < this.size - 1 && y > 0) {
            surroundingHexagons.push([x + 1, y - 1]);
        }
        return surroundingHexagons;
    }

}


$(document).ready(function() {
    function scaleHexagonGrid() {
        const hexagonGrid = $('#hexagon-grid');
        const outerWidth = hexagonGrid.outerWidth();

        if (outerWidth === 0) {
            console.log(outerWidth);
            setTimeout(scaleHexagonGrid, 100);
            return;
        }

        const screen_width = window.innerWidth;
        if (screen_width < 1115) {
            hexagonGrid.css('transform', `scale(${(screen_width / (outerWidth*1.25))})`);
            //hexagonGrid.css('margin', `${-1/(screen_width / outerWidth)*50}`)
        } else {
            hexagonGrid.css('transform', 'scale(1.0)');
            //hexagonGrid.css('margin', `0`)
        }
        //console.log(screen_width, outerWidth);
    }

    scaleHexagonGrid();

    window.addEventListener('resize', scaleHexagonGrid);
});



$(document).ready(function() {
    var dataReceived = localStorage.getItem("data");

    if (dataReceived) {
        var parsedData = JSON.parse(dataReceived);

        for (var key in parsedData) {
            if (parsedData.hasOwnProperty(key)) {
                var value = parsedData[key];
                console.log(key + ": " + value);

            }
        }

        startGame(parsedData.grid_size_in, parsedData.j1_name, parsedData.j2_name, parsedData.j1_type, parsedData.j2_type, parsedData.timer);
    } else {
        startGame(9, "Joueur 1", "Joueur 2", "human", "human", false);
    }

    localStorage.removeItem("data");

});


// Demande de confirmation avant de quitter la page si la partie n'est pas terminée
/*window.addEventListener('beforeunload', function (e) {
    if (unsavedChanges) {
        e.preventDefault();
    }
});*/

