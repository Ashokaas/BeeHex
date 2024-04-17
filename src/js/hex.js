
let currentGame;

var unsavedChanges = false;

var grid_size = 9
var j1_name = "Joueur 1";
var j2_name = "Joueur 2";
var j1_type = "human";
var j2_type = "human";
var timer = "0:00";
var game_UUID = 0; 

const hexagonStates = {
    0 : "empty",
    1 : "player1",
    2 : "player2",
    3 : "wall"
}


function updateGameUID() {
    game_UUID = Date.now()
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
    updateGameUID()
    document.getElementById("player1-name").innerText = j1_name;
    document.getElementById("player2-name").innerText = j2_name;
    clearGrid();
    currentGame = new Game(gridSize, timer);
    unsavedChanges = true;
    // document.getElementById(`player1_status`).classList.add("current_player");
    document.getElementById('victory_screen').style.display = "none";
    document.getElementById('revert').style.display = "flex";

    applyTimerStatus(1, true);
    applyTimerStatus(2, false);
    if (convertTimerToMs(timer) === 0) {
        document.getElementById('player1-timer').classList.add("no_timer")
        document.getElementById('player2-timer').classList.add("no_timer")
    }
    generateGrid(gridSize);
}

function restartGame() {
    startGame(grid_size, j1_name, j2_name, j1_type, j2_type, timer);
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

function applyTimerStatus(player, status) {
    if (status) {
        document.getElementById(`player${player}-timer`).classList.add("active-timer");
        document.getElementById(`player${player}-timer`).classList.add(currentGame[`player${player}Color`]);
    } else {
        document.getElementById(`player${player}-timer`).classList.remove("active-timer");
        document.getElementById(`player${player}-timer`).classList.remove(currentGame[`player${player}Color`]);
    }
}

function convertTimerToMs(timer) {
    try {
        if (timer.includes("-")) { return 0 }
        let time = timer.split(":");
        return parseInt(time[0]) * 60000 + parseInt(time[1]) * 1000;
    } catch (e) {
        return 0;
    }
}

function convertMsToTimer(ms) {
    if (ms >= 60000) {
        let minutes = Math.floor(ms / 60000);
        let seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    } else {
        let seconds = Math.floor(ms / 1000);
        let deciseconds = Math.floor((ms % 1000) / 100);
        return `${seconds}.${deciseconds}`;
    }
}
// Hexagon states : Empty = 0 | Player 1 = 1 | Player 2 = 2 | Wall = 3 


function checkIfHexagonsAreConnected(board, hex1, hex2, player) {
    let hexagonsToCheck = [hex1];
    let checkedHexagons = [];
    while (hexagonsToCheck.length > 0) {
        let hexagon = hexagonsToCheck.pop();
        checkedHexagons.push(hexagon);
        let surroundingHexagons = board.getSurroundingHexagons(hexagon[0], hexagon[1]);
        let ownSurroundingHexagons = board.filterHexagons(surroundingHexagons, player);
        if (ownSurroundingHexagons.some(hex => hex[0] === hex2[0] && hex[1] === hex2[1])) {
            return true;
        }
        for (let ownHexagon of ownSurroundingHexagons) {
            if (!isCoordinateInArray(checkedHexagons, ownHexagon)) {
                hexagonsToCheck.push(ownHexagon);
            }
        }
    }
    return false;
}



function isCoordinateInArray(array, coord) {
    for (let i = 0; i < array.length; i++) {
        if (array[i][0] === coord[0] && array[i][1] === coord[1]) {
            return true;
        }
    }
    return false;
}

function simpleBot(board, player) {
    function getBridgeHexagons(board, x, y) {
        let surroundingHexagons = [];
        if (x < board.size - 1 && y > 1) {
            surroundingHexagons.push([x + 1, y - 2]);
        }
        if (x < board.size - 2 && y > 0) {
            surroundingHexagons.push([x + 2, y - 1]);
        }
        if (x > 0 && y > 0) {
            surroundingHexagons.push([x - 1, y - 1]);
        } 
        if (x < board.size - 1 && y < board.size - 1) {
            surroundingHexagons.push([x + 1, y + 1]);
        }
        if (x > 1 && y < board.size - 1) {
            surroundingHexagons.push([x - 2, y + 1]);
        }
        if (x > 0 && y < board.size - 2) {
            surroundingHexagons.push([x - 1, y + 2]);
        }
        //console.log(surroundingHexagons)
        return surroundingHexagons;
    }

    function checkIfHexagonsAreBridged(board, hex1, hex2, player) {
        let hexagonsToCheck = [hex1];
        let checkedHexagons = [];
        while (hexagonsToCheck.length > 0) {
            let hexagon = hexagonsToCheck.pop();
            //console.log(hexagonsToCheck)
            checkedHexagons.push(hexagon);
            let surroundingHexagons = board.getSurroundingHexagons(hexagon[0], hexagon[1]);
            let ownSurroundingHexagons = board.filterHexagons(surroundingHexagons, player);
    
            if (ownSurroundingHexagons.some(hex => hex[0] === hex2[0] && hex[1] === hex2[1])) {
                return true;
            }
            for (let ownHexagon of ownSurroundingHexagons) {
                if (!isCoordinateInArray(checkedHexagons, ownHexagon) && !isCoordinateInArray(hexagonsToCheck, ownHexagon)) {
                    hexagonsToCheck.push(ownHexagon);
                }
            }
            for (let innerHexagon of surroundingHexagons) {
                
                candidates = getOuterBridgeHexagons(hexagon, innerHexagon).filter(hexa => board.isInBounds(hexa)).filter(hexa => board.getHexagon(hexa[0], hexa[1])  === player);
                candidates = candidates.filter(hexa => getInnerBridgeHexagons(hexagon, hexa).every(hexaa => board.getHexagon(hexaa[0], hexaa[1])  === 0))
                for (candidate of candidates) {
                    if (!isCoordinateInArray(checkedHexagons, candidate) && !isCoordinateInArray(hexagonsToCheck, candidate)) {
                        hexagonsToCheck.push(candidate);
                    }
                }
            }
        }
        return false;
    }
    
    function getInnerBridgeHexagons(hex1, hex2) { 
        diffX = hex2[0] - hex1[0];
        diffY = hex2[1] - hex1[1];
        x = hex2[0];
        y = hex2[1];
        //console.log(x, y, hex2[0], hex2[1], diffX, diffY)
        if (diffX === 1 && diffY === 1) {
            return [[x - 1, y], [x, y - 1]];
        }
        if (diffX === -1 && diffY === 2) {
            return [[x, y - 1], [x + 1, y - 1]];
        }
        if (diffX === -2 && diffY === 1) {
            return [[x + 1, y - 1], [x + 1, y]];
        }
        if (diffX === -1 && diffY === -1) {
            return [[x + 1, y], [x, y + 1]];
        }
        if (diffX === 1 && diffY === -2) {
            return [[x, y + 1], [x - 1, y + 1]];
        }
        if (diffX === 2 && diffY === -1) {
            return [[x - 1, y + 1], [x - 1, y]];
        }
        
        console.warn("Invalid hexagons for inner bridge hexagons.");
    }

    function getBridgeHexagonsWithBorders(board, player, x, y) {
        let surroundingHexagons = [];
        if (player === 1) {
            if (x < board.size  && y > 1) {
                surroundingHexagons.push([x + 1, y - 2]);
            }
            if (x < board.size - 1 && y > 0) {
                surroundingHexagons.push([x + 2, y - 1]);
            }
            if (x > -1 && y > 0) {
                surroundingHexagons.push([x - 1, y - 1]);
            } 
            if (x < board.size  && y < board.size - 1) {
                surroundingHexagons.push([x + 1, y + 1]);
            }
            if (x > 0 && y < board.size - 1) {
                surroundingHexagons.push([x - 2, y + 1]);
            }
            if (x > -1 && y < board.size - 2) {
                surroundingHexagons.push([x - 1, y + 2]);
            }
        } else {
            if (x < board.size - 1 && y > 0) {
                surroundingHexagons.push([x + 1, y - 2]);
            }
            if (x < board.size - 2 && y > -1) {
                surroundingHexagons.push([x + 2, y - 1]);
            }
            if (x > 0 && y > -1) {
                surroundingHexagons.push([x - 1, y - 1]);
            } 
            if (x < board.size - 1 && y < board.size) {
                surroundingHexagons.push([x + 1, y + 1]);
            }
            if (x > 1 && y < board.size) {
                surroundingHexagons.push([x - 2, y + 1]);
            }
            if (x > 0 && y < board.size - 1) {
                surroundingHexagons.push([x - 1, y + 2]);
            }
        }
        //console.log(surroundingHexagons)
        return surroundingHexagons;
    }


    function getOuterBridgeHexagons(outer, inner) {
        diffX = outer[0] - inner[0]
        diffY = outer[1] - inner[1];
        x = outer[0];
        y = outer[1];
        if (diffX === 1 && diffY === 0) {
            return [[x - 2, y + 1], [x - 1, y - 1]];
        }
        if (diffX === 0 && diffY === 1) {
            return [[x - 1, y - 1], [x + 1, y - 2]];
        }
        if (diffX === -1 && diffY === 1) {
            return [[x + 1, y - 2], [x + 2, y - 1]];
        }
        if (diffX === -1 && diffY === 0) {
            return [[x + 2, y - 1], [x + 1, y + 1]];
        }
        if (diffX === 0 && diffY === -1) {
            return [[x + 1, y + 1], [x - 1, y + 2]];
        }
        if (diffX === 1 && diffY === -1) {
            return [[x - 1, y + 2], [x - 2, y + 1]];
        }
        console.warn("Invalid hexagons for outer bridge hexagons.", [outer, inner]);
    }

    function playMove(board, player) {
        // Identifier les coups nécessaires pour conserver un pont, attribuer un score à ce coupV
        //   - Identifier les hexagones de pont existants
        //   - Vérifier qu'ils ne sont pas déjà connectésV
        //   - Vérifier qu'ils sont menace d'être bloqués
        //   - Attribuer un score en fonction de la conservation du chemin
        // Vérifier s'il existe déjà un chemin de coût 0 (avec uniquement des ponts à compléter) - 
        //   - Si oui, compléter le chemin (attribuer 0.5 aux coups de ponts à compléter)
        // Identifier les coups de construction de pont possibles, attribuer un score à ce coup 
        //  - Identifier les hexagones de pont possibles V
        //  - Éliminer ceux qui sont en directe menace de blocage V
        //  - Attribuer un score en fonction de la création du pont (avec un +0.75)

        // Dans l'algorithme de score, attribuer 0 aux cases du joueur ou les cases vides faisant partie d'un pont
        //                             attribuer 1 aux cases vides classiques
        //                             attribuer 2 aux cases vides adjacentes à une case ennemie

        threatenedBridges = identifyThreatenedBridges(board, player);
        newBridges = identifyNewBridges(board, player);
        otherHexagons = identifyAllOtherHexagons(board, player);
        allHexagons = threatenedBridges.concat(newBridges);
        allHexagons = allHexagons.concat(otherHexagons);

        allHexagons = allHexagons.filter((hex) => board.isValidPlacementXY(hex[0][0], hex[0][1]));

        allHexagons.sort((a, b) => a[1] - b[1]);
    //    //console.log(allHexagons)
        if (allHexagons.length > 0) {
            return allHexagons[0][0];
           // currentGame.clickHexagon(document.getElementsByClassName(`${allHexagons[0][0][0]}-${allHexagons[0][0][1]}`)[0]);
        } else {
            let randomX = -1; 
            let randomY = -1;
            while (!board.isInBoundsXY(randomX, randomY) || !board.isValidPlacementXY(randomX, randomY)) {
                randomIndexX = Math.floor(Math.random() * 2);
                randomIndexY = Math.floor(Math.random() * 2);
                randomX = Math.floor(board.size / 2) - 1 + randomIndexX;
                randomY = Math.floor(board.size / 2) - 1 + randomIndexY;
                console.log(randomX, randomY, board.isInBoundsXY(randomX, randomY), board.isValidPlacementXY(randomX, randomY))
            }
            return [randomX, randomY];
            //currentGame.clickHexagon(document.getElementsByClassName(`${randomX}-${randomY}`)[0]);
        }

    }
    
    function identifyThreatenedBridges(board, player) {
        ownHexagons = getAllOwnHexagons(board, player);
        threatenedBridges = [];
        for (let hex of ownHexagons) {
            outerHexagons = getBridgeHexagonsWithBorders(board, player, hex[0], hex[1]);
            
            for (let outerHex of outerHexagons) {
    //            //console.log(outerHex, hex, board, board.grid[outerHex[1]])
                if (board.isInBounds(outerHex) && (board.getHexagon(outerHex[0], outerHex[1]) !== player || checkIfHexagonsAreBridged(board, hex, outerHex, player))) { continue;}
                innerHexagon = getInnerBridgeHexagons(hex, outerHex);
                if (board.isInBounds(innerHexagon[0]) && board.isInBounds(innerHexagon[1]) && board.getHexagon(innerHexagon[0][0], innerHexagon[0][1])  === 0 && board.getHexagon(innerHexagon[1][0], innerHexagon[1][1])  === 3 - player) {
                    threatenedBridges.push([innerHexagon[0], attributeScore(board, innerHexagon[0], player)]);
                    //console.log(innerHexagon[0], attributeScore(board, innerHexagon[0], player))
                } else if (board.isInBounds(innerHexagon[0]) && board.isInBounds(innerHexagon[1]) && board.getHexagon(innerHexagon[1][0], innerHexagon[1][1])  === 0 && board.getHexagon(innerHexagon[0][0], innerHexagon[0][1])  === 3 - player) {
                    threatenedBridges.push([innerHexagon[1], attributeScore(board, innerHexagon[1], player)]);
                    //console.log(innerHexagon[1], attributeScore(board, innerHexagon[1], player))
                } else {
                    if (board.isInBounds(innerHexagon[0])) {
                        score1 = attributeScore(board, innerHexagon[0], player);
                        score1 = score1 > 0.2 ? score1 + 0.85 : score1 + 0.2;
                        threatenedBridges.push([innerHexagon[0], score1]);
                    }
                    if (board.isInBounds(innerHexagon[1])) {
                        score2 = attributeScore(board, innerHexagon[1], player);
                        score2 = score2 > 0.2 ? score2 + 0.85 : score2 + 0.2;
                        threatenedBridges.push([innerHexagon[1], score2]);
                    }
                }
            }
        }
        return threatenedBridges;
    }

    function identifyNewBridges(board, player) {
        ownHexagons = getAllOwnHexagons(board, player);
        newBridges = [];
        for (let hex of ownHexagons) {
            outerHexagons = getBridgeHexagons(board, hex[0], hex[1]);
            for (let outerHex of outerHexagons) {
                if (board.getHexagon(outerHex[0], outerHex[1])  === player) { continue;}
                innerHexagon = getInnerBridgeHexagons(hex, outerHex);
    //            //console.log(innerHexagon)
                if (board.getHexagon(innerHexagon[0][0], innerHexagon[0][1])  === 0 && board.getHexagon(innerHexagon[1][0], innerHexagon[1][1])  === 0) {
                    newBridges.push([outerHex, attributeScore(board, outerHex, player) + 0.75]);
                    //console.log(outerHex, attributeScore(board, outerHex, player) + 0.75)
                }
            }
        }
        return newBridges;
    }

    function getAllOwnHexagons(board, player) {
        let hexagons = [];
        for (let i = 0; i < board.size; i++) {
            for (let j = 0; j < board.size; j++) {
                if (board.grid[j][i] === player) {
                    hexagons.push([i, j]);
                }
            }
        }
    //    //console.log(hexagons)
        return hexagons;
    }
    
    function identifyAllOtherHexagons(board, player) {
        let hexagons = [];
        let checkedHexagons = [];
        let ownHexagons = getAllOwnHexagons(board, player);
        for (ownHexagon of ownHexagons) {
            surroundingHexagons = board.getSurroundingHexagons(ownHexagon[0], ownHexagon[1]);
            for (surroundingHexagon of surroundingHexagons) {
                if (!isCoordinateInArray(checkedHexagons, surroundingHexagon) && board.getHexagon(surroundingHexagon[0], surroundingHexagon[1])  === 0) {
                    score = attributeScore(board, surroundingHexagon, player);
                    score = score === 0 ? score : score + 0.9;
                    hexagons.push([surroundingHexagon, score]);
                    checkedHexagons.push(surroundingHexagon);
                }
            }
        }
        return hexagons;
    }
    

    function attributeScore(board, hex, player) {
        let hexagonToCheck = [[hex, 0]];
        let checkedHexagons = [];
        let lowerBoundPath = undefined;
        let higherBoundPath = undefined;
        if (player == 1) {
            boundCheck = hex[0];
        } else {
            boundCheck = hex[1];
        }
        if (boundCheck === 0) {
            lowerBoundPath = 0;
        }
        if (boundCheck === board.size - 1) {
            higherBoundPath = 0;
        }
        

        while (hexagonToCheck.length > 0) {
        //    //console.log(hexagonToCheck)
            hexagonToCheck.sort((a, b) => b[1] - a[1]);
            let hexagon = hexagonToCheck.pop();
            checkedHexagons.push(hexagon[0]);
            let surroundingHexagons = board.getSurroundingHexagons(hexagon[0][0], hexagon[0][1]);
            let availableHexagons = board.filterAntiHexagons(surroundingHexagons, 3 - player);
        //    //console.log(availableHexagons)
            for (let innerHexagon of availableHexagons) {
                if (!isCoordinateInArray(checkedHexagons, innerHexagon)) {
                    let score;
                    if (player == 1) {
                        boundCheck = innerHexagon[0];
                    } else {
                        boundCheck = innerHexagon[1];
                    }
                    if (board.getHexagon(innerHexagon[0], innerHexagon[1])  === player) {
                        score = hexagon[1] + 0;
                 //       //console.log(score)
                    }
                    else if (board.getHexagon(hexagon[0][0], hexagon[0][1])  === player || (hexagon[0][0] === hex[0] && hexagon[0][1] === hex[1])) {
                        if (boundCheck === board.size - 1 || boundCheck === 0) {
                            score = hexagon[1] + 0.01;
                        } else {
                            candidates = getOuterBridgeHexagons(hexagon[0], innerHexagon).filter(hexa => board.isInBounds(hexa)).filter(hexa => board.getHexagon(hexa[0], hexa[1])  === player);
                            if (candidates.length > 0) {
                                candidates = candidates.filter(hexa => getInnerBridgeHexagons(hexagon[0], hexa).every(hexaa => board.getHexagon(hexaa[0], hexaa[1])  === 0))
                                if (candidates.length > 0) {
                                    score = hexagon[1] + 0.01;
                                    //console.log(candidates, score)
                                } else {
                                    score = hexagon[1] + 4;
                                    //console.log(score)
                                }
                            } else if (board.getSurroundingHexagons(innerHexagon[0], innerHexagon[1]).filter(hexa => board.getHexagon(hexa[0], hexa[1]) === 3 - player).length > 0) {
                                score = hexagon[1] + 2;
                            } else {
                                score = hexagon[1] + 1;
                       //         //console.log(score)
                            }
                        }
                    } else if (board.getSurroundingHexagons(innerHexagon[0], innerHexagon[1]).filter(hexa => board.getHexagon(hexa[0], hexa[1]) === 3 - player).length > 0) {
                        score = hexagon[1] + 2;
                    } else {
                        score = hexagon[1] + 1.25;
               //         //console.log(score)
                    }
                    
                    if (boundCheck === 0 && (lowerBoundPath === undefined || score < lowerBoundPath)) {
                        lowerBoundPath = score;
                //        //console.log(score)
                        if (lowerBoundPath !== undefined && higherBoundPath !== undefined) {
                            return lowerBoundPath + higherBoundPath;
                        }
                    }
                    else if (boundCheck === board.size - 1 && (higherBoundPath === undefined || score < higherBoundPath)) {
                        higherBoundPath = score;
                //        //console.log(score)
                        if (lowerBoundPath !== undefined && higherBoundPath !== undefined) {
                            return lowerBoundPath + higherBoundPath;
                        }
                    } else {
                        existingHexs = hexagonToCheck.filter(hex => hex[0][0] == innerHexagon[0] && hex[0][1] == innerHexagon[1])
                        if (existingHexs.length > 0) {
                        //    //console.log(existingHexs[0][1], score)
                            existingHexs[0][1] = existingHexs[0][1] > score ? score : existingHexs[0][1]
                        //    //console.log(existingHexs[0][1])
                        } else {
                  //      //console.log(innerHexagon, score)
                        hexagonToCheck.push([innerHexagon, score])
                        }
                    }
                }
            }
            
        }
    }
    
    return playMove(board, player);
}

function highlightBotMoveButton() {
    if (currentGame !== undefined) {
        highlightBotMove(currentGame.board, currentGame.turn);
    }
}

function highlightBotMove(board, player) {
    botmove = simpleBot(board, player);
    document.getElementsByClassName(`${botmove[0]}-${botmove[1]}`)[0].classList.add("bot_highlight");
    setTimeout(() => {document.getElementsByClassName(`${botmove[0]}-${botmove[1]}`)[0].classList.remove("bot_highlight")}, 1000);
}

class Game {
    constructor(size, timer) {
        this.board = new Board(size);
        this.previousBoards = [];
        this.turn = 1
        this.turns = 0;
        this.player1Color = "red";
        this.player2Color = "blue";
        generateGrid(size);
        let time = convertTimerToMs(timer);
        if (time > 0) {
            this.timed = true;
        }
        else {
            this.timed = false;
        }
        if (this.timed) {
            this.player1Timer = time;
            this.player2Timer = time;
            document.getElementById(`player1-timer`).innerText = convertMsToTimer(time);
            document.getElementById(`player2-timer`).innerText = convertMsToTimer(time);
            
            this.turnTime = Date.now()
            setTimeout(() => {this.updateTimer(game_UUID)}, 80);
        }
    }
    
    clickHexagon(hexagon) {
        let coords = hexagon.classList[1].split("-");
        let x = parseInt(coords[0]);
        let y = parseInt(coords[1]);
        if (this.board.isValidPlacementXY(x, y) && (this.turns > 0  || this.board.size % 2 === 0 || x  != Math.floor(this.board.size / 2) || y != Math.floor(this.board.size / 2))) {
            if (this.timed) {
                this.updateTimer(false)
            }
            this.previousBoards.push(this.board.copy());
            this.board.applyMoveXY(x, y, this.turn);
            this.updateVisualHexagon(hexagon, this.turn)
            let result = this.board.checkForWinnerXY(x, y);
            if (result.winner) {
                unsavedChanges = false;
                document.getElementById('victory_screen').style.display = "flex";
                document.getElementById('revert').style.display = "none";
                if (this.turn === 1) {
                    document.getElementById('victory_screen').getElementsByTagName('span')[0].innerText = j1_name;
                } else {
                    document.getElementById('victory_screen').getElementsByTagName('span')[0].innerText = j2_name;
                }
                applyTimerStatus(1, false);
                currentGame = undefined;
                return;
            }
            
         //   document.getElementById(`player${this.turn}_status`).classList.remove("current_player");
            applyTimerStatus(this.turn, false);
            this.turn = this.turn === 1 ? 2 : 1;
            this.turns++;
            applyTimerStatus(this.turn, true);


            if (this.turn === 2 && j2_type === 'bot') {

                botmove = simpleBot(this.board, this.turn);
                currentGame.clickHexagon(document.getElementsByClassName(`${botmove[0]}-${botmove[1]}`)[0]);
            } 
            
        }
    }

    bot_turn() {
        const availableMoves = this.board.getAvailableMoves();
        const randomIndex = Math.floor(Math.random() * availableMoves.length);
        const [randomX, randomY] = availableMoves[randomIndex];
        this.clickHexagon(document.getElementsByClassName(`${randomX}-${randomY}`)[0]);
        
    //   document.getElementById(`player${this.turn}_status`).classList.add("current_player");
    
    }

    updateTimer(cycle = false) {
        if (currentGame === undefined || (cycle != game_UUID && cycle != false)) {
            return;
        }
        let time = Date.now();
        let timeElapsed = time - this.turnTime;
        let playerTimer = this.turn === 1 ? this.player1Timer : this.player2Timer;
        playerTimer -= timeElapsed;
        this.turnTime = time;
        if (playerTimer <= 0) {
            unsavedChanges = false;
            document.getElementById('victory_screen').style.display = "flex";
            document.getElementById('revert').style.display = "none";
            document.getElementById('victory_screen').getElementsByTagName('span')[0].innerText = `Joueur ${this.turn === 1 ? 2 : 1}`;
            applyTimerStatus(1, false);
            currentGame = undefined;
            return;
        }
        if (this.turn === 1) {
            this.player1Timer = playerTimer;
        } else {
            this.player2Timer = playerTimer;
        }
        document.getElementById(`player${this.turn}-timer`).innerText = convertMsToTimer(playerTimer);
        if (cycle == game_UUID) {
            setTimeout(() => {this.updateTimer(cycle)}, 80);
        }
        
    
    }

    revertMove() {
        if (this.previousBoards.length > 0) {
            applyTimerStatus(this.turn, false);
            this.board = this.previousBoards.pop();
            this.updateAllVisualHexagons();
            this.turn = this.turn === 1 ? 2 : 1;
            applyTimerStatus(this.turn, true);
            this.turns--;
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

    updateAllVisualHexagons() {
        let hexagons = document.querySelectorAll(".hexagon");
        for (let hexagon of hexagons) {
            let coords = hexagon.classList[1].split("-");
            let x = parseInt(coords[0]);
            let y = parseInt(coords[1]);
            this.updateVisualHexagon(hexagon, this.board.grid[y][x]);
        }
    }
}

class Board {
    constructor(size) {
        this.size = size;
        this.grid = new Array(size).fill().map(() => Array(size).fill(0));
    }

    getHexagon(x, y) {
        if (this.isInBoundsXY(x, y)) {
            return this.grid[y][x];
        } else {
            console.error(`Hexagon ${x}, ${y} is out of bounds.`);
        }
    }

    getAvailableMoves() {
        const moves = [];
        for (let i = 0; i < this.size; i++) {
          for (let j = 0; j < this.size; j++) {
            if (this.isValidPlacementXY(i, j)) {
              moves.push([i, j]);
            }
          }
        }
        return moves;
      }
      
    isValidPlacementXY(x, y) {
        return this.grid[y][x] === 0;
    }
    isValidPlacement(hexagon) {
        return this.isValidPlacementXY(hexagon[0], hexagon[1]);
    }
    
    isInBoundsXY(x, y) {
        return x >= 0 && x < this.size && y >= 0 && y < this.size;
    }
    isInBounds(hexagon) {
        return this.isInBoundsXY(hexagon[0], hexagon[1]);
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
    filterAntiHexagons(hexagons, state) {
        let filteredHexagons = []
        for (let hexagon of hexagons) {
            if (this.grid[hexagon[1]][hexagon[0]] != state) {
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
function scaleHexagonGrid() {
    //const gridSize = currentGame.board.size 
    const hexagonGrid = $('#hexagon-grid');
    const hexagonParent = $('#hex_parent');
    const playerPanel = $('#players');
    const gameInterface = $('#game_interface');
    const playerPanelWidth = playerPanel.outerWidth();
    const outerWidth = hexagonGrid.outerWidth();
    const parentOuterWidth = hexagonParent.outerWidth();
    const outerHeight = hexagonGrid.outerHeight();
    const parentOuterHeight = hexagonParent.outerHeight();
    const gameInterfaceHeight = gameInterface.innerHeight();
    const screen_width = Math.min(screen.availWidth, window.innerWidth)
    const screen_height =  Math.min(screen.availHeight, window.innerHeight)
    if (outerWidth === 0) {
        setTimeout(scaleHexagonGrid, 100);
        return;
    }
    const width_ratio = Math.min((1/(outerWidth/parentOuterWidth)*0.94), 4)
    const height_ratio =  Math.min((1/(outerHeight/parentOuterHeight)*0.94), 4)
    hexagonGrid.css('transform', `scale(${Math.min(width_ratio, height_ratio)})`)
    if (screen_width >= screen_height) {
        hexagonParent.css('width', `0px`)
        hexagonParent.css('width', `${screen_width - playerPanelWidth}px`)
        hexagonParent.css('max-width', ``);
        hexagonParent.css('height', `${gameInterfaceHeight}px`)
        playerPanel.css('height', `${screen_height}px`)
       
    }  else {
        hexagonParent.css('max-width', `${screen_height}px`);
        hexagonParent.css('width', `100%`);
        hexagonParent.css('height', ``)
        playerPanel.css('height', `fit-content`)
        //hexagonGrid.css('margin', `0`)
    }
    ////console.log(screen_width, outerWidth);
}

function save() {
    localStorage.setItem('savedGame', JSON.stringify(currentGame))

    localStorage.setItem('grid_size', grid_size.toString());
    localStorage.setItem('j1_name', j1_name);
    localStorage.setItem('j2_name', j2_name);
    localStorage.setItem('j1_type', j1_type);
    localStorage.setItem('j2_type', j2_type);
    localStorage.setItem('timer', timer);

    let pDataStatus = document.getElementById('p_data_status');
    pDataStatus.innerText = "Partie sauvegardée";
    
}

function load() {
    loadedValues = JSON.parse(localStorage.getItem('savedGame'))
    
    grid_size = parseInt(localStorage.getItem('grid_size'));
    j1_name = localStorage.getItem('j1_name');
    j2_name = localStorage.getItem('j2_name');
    j1_type = localStorage.getItem('j1_type');
    j2_type = localStorage.getItem('j2_type');
    timer = localStorage.getItem('timer');

    clearGrid()
    startGame(grid_size, j1_name, j2_name, j1_type, j2_type, timer)

    currentGame.board.size = loadedValues.board.size
    currentGame.board.grid = loadedValues.board.grid

    currentGame.player1Color = loadedValues.player1Color
    currentGame.player2Color = loadedValues.player2Color
    currentGame.previousBoards = loadedValues.previousBoards
    currentGame.timed = loadedValues.timed
    currentGame.turn = loadedValues.turn
    currentGame.turns = loadedValues.turns
    if (currentGame.timed) {
        currentGame.player1Timer = loadedValues.player1Timer
        currentGame.player2Timer = loadedValues.player2Timer
        currentGame.turnTime = Date.now()
    }   
    currentGame.updateAllVisualHexagons()
    scaleHexagonGrid()

    let pDataStatus = document.getElementById('p_data_status');
    pDataStatus.innerText = "Partie chargée";
}

$(document).ready(function() {
    
    const resizeObserver = new ResizeObserver(entries => {
        scaleHexagonGrid();
    });
    resizeObserver.observe(document.getElementById('hex_parent'));
    window.addEventListener('resize', scaleHexagonGrid);
    screen.orientation.addEventListener('change', scaleHexagonGrid);
    scaleHexagonGrid();
});



$(document).ready(function() {
    var dataReceived = localStorage.getItem("data");

    if (dataReceived) {
        var parsedData = JSON.parse(dataReceived);

        for (var key in parsedData) {
            if (parsedData.hasOwnProperty(key)) {
                var value = parsedData[key];
                //console.log(key + ": " + value);

            }
        }
        
        grid_size = parseInt(parsedData.grid_size_in);
        j1_name = parsedData.j1_name;
        j2_name = parsedData.j2_name;
        j1_type = parsedData.j1_type;
        j2_type = parsedData.j2_type;
        timer = parsedData.timer;
        if (j1_type === 'bot' || j2_type === 'bot') {
            timer = "0:00";
        }
    } 
    startGame(grid_size, j1_name, j2_name, j1_type, j2_type, timer);

    localStorage.removeItem("data");

});


// Demande de confirmation avant de quitter la page si la partie n'est pas terminée
/*window.addEventListener('beforeunload', function (e) {
    if (unsavedChanges) {
        e.preventDefault();
    }
});*/

