'use strict'

// UTILS - RENDERING FUNCTIONS:
// ORDER : renderBoard() , renderCell()

// CREATING & MANIPULATING MATS:
// createBoard() , copyMat() , countAround()

// CREATING & MANIPULATING CELLS:
// getCellCoord() , getSelector() , isEmptyCell()

// MANIPULATING DOM-ELEMENTS:
// hideElement() , showElement()

// GENERIC:
// getRandomInt() , getRandomColor() , shuffle()

// SOME MORE AT THE END:
// resetNums() , drawNum() , markCells() , cleanBoard()

/////////////////////////////////////////////////////////////////////////////////////////////// RENDERING

function renderBoard(board, selector) {
    var strHTML = ` <table class="board">
    <thead>
        <tr>
            <td colspan="${gLevel.SIZE+1}">
                <div class="status-bar">
                    <div class="bomb-counter">000</div>
                    <div class="reset" onclick="resetGame()"><img src="imgs/smiley-face.png" alt="smily"></div>
                    <div class="timer">000</div>
                </div>
            </td>
        </tr>
    </thead>
    <tbody>`

    for (let i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (let j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            const className = `cell cell-${i}-${j}`
            if (cell.isMine) {
                strHTML += `<td class="${className}" oncontextmenu="cellClicked(this,${i},${j},event)" onclick="cellClicked(this,${i},${j},event)"><img class="mine-img" src="imgs/mine.png" alt="mine"/></td>`
            } else if (cell.minesAroundCount !== 0) {
                strHTML += `<td class="${className}" oncontextmenu="cellClicked(this,${i},${j},event)" onclick="cellClicked(this,${i},${j},event)"><span>${cell.minesAroundCount}</span></td>`
            } else {
                strHTML += `<td class="${className}" oncontextmenu="cellClicked(this,${i},${j},event)" onclick="cellClicked(this,${i},${j},event)"></td>`
            }

        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

// location is an object like this - {i:4,j:3}
function renderCell(location, value) {
    // select the elCell and set the value
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}

/////////////////////////////////////////////////////////////////////////////////////////////// MATS

//* CREATES BOARD ACCORDING TO GLOBAL SIZE VAR 
// function buildBoard(size) {
//     const board = []
//     for (var i = 0; i < size; i++) {
//         board[i] = []
//         for (var j = 0; j < size; j++) {
//             board[i][j] = ''
//         }
//     }
//     return board
// }

/////////////////////////////////////////////////////////////////////////////////////////////// MATS (NEIGHBORS)

//* NEIGHBORS LOOP
// function countAround(board, rowIdx, colIdx) {

//     for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
//         if (i < 0 || i >= board.length) continue
//         for (var j = colIdx - 1; j <= colIdx + 1; j++) {
//             // EXCLUDE CENTER OF AREA
//             if (i === rowIdx && j === colIdx) continue
//             // EXCLUDE OVERFLOW
//             if (j < 0 || j >= board[0].length) continue
//             // currCell = current neighbor
//             var currCell = board[i][j]
//             // CHOOSE HOW TO PROCEED FROM HERE ACCORDINGLY
//         }
//     }
// }

/////////////////////////////////////////////////////////////////////////////////////////////// MATS

//* INCASE WE NEED TO WORK/RENDER ON NEW MATRIX
function copyMat(mat) {
    var newMat = []
    for (var i = 0; i < mat.length; i++) {
        newMat[i] = []
        for (var j = 0; j < mat[0].length; j++) {
            newMat[i][j] = mat[i][j]
        }
    }
    return newMat
}

/////////////////////////////////////////////////////////////////////////////////////////////// CELLS

// Recive a string such as: 'cell-2-7' and returns {i:2, j:7}
function getCellCoord(strCellId) {
    var parts = strCellId.split('-')
    var coord = {
        i: +parts[1],
        j: +parts[2]
    }
    return coord
}

/////////////////////////////////////////////////////////////////////////////////////////////// CELLS

// Recive an object such as: {i:2, j:7} and returns '.cell-2-7'
function getSelector(coord) {
    return '.cell-' + coord.i + '-' + coord.j // NOTE : the selector prefix may change accordingly
}

/////////////////////////////////////////////////////////////////////////////////////////////// CELL (BOLEAN)

//* 
function isEmptyCell(coord) {
    return gBoard[coord.i][coord.j] === ''
}
///////////////////////////////////////////////////////////////////////////////////////////////
//* GET ANY CELL TO AN ARRAY
function getEmptyCells(board) {
    const emptyCells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var currCell = board[i][j]
            if (currCell.isMine === false) {
                emptyCells.push({
                    i: i,
                    j: j
                })
            }
        }
    }
    console.log('emptyCells:', emptyCells)
    //* CHOOSE A RANDOM INDEX FROM THAT ARRAY AND RETURN THE CELL ON THAT INDEX

    return emptyCells
}

/////////////////////////////////////////////////////////////////////////////////////////////// DOM_ELEMENT

//* SHOW / HIDE ELEMENT
function hideElement(selector) {
    const el = document.querySelector(selector)
    el.classList.add('hidden')
}

function showElement(selector) {
    const el = document.querySelector(selector)
    el.classList.remove('hidden')
}

/////////////////////////////////////////////////////////////////////////////////////////////// GENERIC

//* GET RANDOM INT INCLUSIVE / EXLUCIVE
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

//!/

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

/////////////////////////////////////////////////////////////////////////////////////////////// GENERIC

//* GET RANDOM COLOR
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

/////////////////////////////////////////////////////////////////////////////////////////////// GENERIC

function shuffle(items) {
    var randIdx, keep, i;
    for (i = items.length - 1; i > 0; i--) {
        randIdx = getRandomInt(0, items.length - 1);

        keep = items[i];
        items[i] = items[randIdx];
        items[randIdx] = keep;
    }
    return items;
}

///////////////////////////////////////////////////////////////////////////////////////////////

//* GETS AN EMPTY GLOBAL VAR OF GNUMS AND BUILDS IT ACCORDING TO THE GNUMSRANGE LENGTH
function resetNums() {
    gNums = [] // make sure to have that gNums or change this line accordingly
    for (var i = 0; i < gNumsRange; i++) { // make sure to have that gNumsRange or change this line accordingly
        gNums.push(i + 1)
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////

//* DRAWS A RANDOM NUMBER FROM GNUMS ARRAY AND SPLICES THAT NUM SO IT WONT REPEAT ITSELF
function drawNum() {
    var randIdx = getRandomInt(0, gNums.length) // NOTE TO HAVE gNums in your project OR change this gNums.length to the array.length of nums
    var num = gNums[randIdx] // NOTE TO HAVE gNums in your project OR change this gNums[randIdx] to the array[randIdx] of nums
    gNums.splice(randIdx, 1) // NOTE TO HAVE gNums in your project OR change this gNums to array.splice(randIdx, 1) ---(you can also save it in a var to track this result)
    return num // return random num from the array of nums and shorten it too
}

///////////////////////////////////////////////////////////////////////////////////////////////

//* RECIVE ARRAY OF OBJECTS LIKE THIS : [{i:3,j:4},{i:2,j:6}] looping through it and adding mark class to them
function markCells(coords) {
    for (var i = 0; i < coords.length; i++) {
        var coord = coords[i]
        var elCell = document.querySelector(`#cell-${coord.i}-${coord.j}`) // note the selector prefix is #
        elCell.classList.add('mark') // note to have these classes in your html/css ready
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////

//* CLEANING MARKS ADDED AT PREV FUNCTION
function cleanBoard() {
    var elTds = document.querySelectorAll('.mark, .selected') // note to have these classes in your html/css ready
    for (var i = 0; i < elTds.length; i++) {
        elTds[i].classList.remove('mark', 'selected')
    }
}




























// WORKING CELLCLICKED

// function cellClicked(elCell, i, j, ev) {
//     console.log('gGame.shownCount:', gGame.shownCount)

//     const elCellContent = elCell.querySelector('*')

//     if (gIsHint && gHintsCounter > 0) {
//         expandForHint(gBoard, elCell, i, j)
//         gHintsCounter--
//         gIsHint = false
//         document.querySelector(`button[data-btn-type="hint"] span`).innerText = gHintsCounter
//         return
//     }

//     var leftClick = ev.button === 0
//     var rightClick = ev.button === 2
//     console.log('elCell:', elCell)
//     console.log('elCell:', elCell)

//     // if(elCellContent = elCell.querySelector('*')){
//     //     expandShown(gBoard,elCell,i, j)
//     // }
//     if (!gGame.isOn) {
//         gTimerCounter = 1
//         gTimerInterval = setInterval(startTimer, 1000)
//         gGame.isOn = true
//     }
//     if (leftClick && gBoard[i][j].isMarked) return
//     if (leftClick && gBoard[i][j].isShown) return
//     if (rightClick && !gBoard[i][j].isMarked && !gBoard[i][j].isShown) {
//         if (gMinesLeftToMark === 0) return
//         gPrevCellContent = elCell.innerHTML
//         elCell.innerHTML = `<img src="imgs/flag.png" alt="flag">`
//         elCell.querySelector('*').classList.add('revealed')
//         gBoard[i][j].isMarked = true
//         gGame.markedCount++
//         gMinesLeftToMark--
//         document.querySelector('.bomb-counter').innerText = String(gMinesLeftToMark).padStart(3, '0')
//         checkWin()
//         return
//     } else if (rightClick && gBoard[i][j].isMarked && !gBoard[i][j].isShown) {
//         elCell.innerHTML = gPrevCellContent
//         if (elCell.querySelector('*') !== null) {
//             elCell.querySelector('*').classList.remove('revealed')
//         } else {
//             elCell.classList.remove('revealed')
//         }
//         gMinesLeftToMark++
//         gGame.markedCount--
//         gBoard[i][j].isMarked = false
//         document.querySelector('.bomb-counter').innerText = String(gMinesLeftToMark).padStart(3, '0')
//         return
//     }
//     // check whats inside
//     if (leftClick && gBoard[i][j].isMine) {
//         if (!gBoard[i][j].isShown) {
//             gBoard[i][j].isShown = true
//             elCellContent.classList.add('revealed')
//             elCell.style.backgroundColor = 'red'
//             gLivesCounter--
//             gMinesLeftToMark--
//             document.querySelector('.bomb-counter').innerText = String(gMinesLeftToMark).padStart(3, '0')
//             var hearts = document.querySelectorAll('.lives img')
//             hearts[gLivesCounter].style.opacity = '0'
//             if (gLivesCounter === 0) gameOver()
//         } else {
//             return
//         }
//     }
//     if (leftClick && elCellContent) {
//         elCellContent.classList.add('revealed')
//     }
//     if (leftClick && gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isMine) {
//         expandShown(gBoard, elCell, i, j)
//     } else if (!gBoard[i][j].isMine) {
//         gGame.shownCount++
//         gBoard[i][j].isShown = true
//     }
//     elCell.classList.add('selected')
//     // 
//     checkWin()
//     console.log('gGame.shownCount:', gGame.shownCount)

// }