'use strict'

// globals

const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}
const gLevel = {
    SIZE: 8,
    MINES: 14
}
var gBoard
var gTimerInterval
var gMinesLeftToMark
var gPrevCellContent
var gLivesCounter
var gTimerCounter




function initGame() {
    gLivesCounter = 3
    gMinesLeftToMark = gLevel.MINES
    // TODO: set initial values here that come before creating model
    gBoard = buildBoard(gLevel.SIZE, gLevel.MINES)
    var mines = getMinesCoords(gBoard)
    setMines(mines, gLevel.MINES)
    setMinesNegsCount(gBoard)
    renderBoard(gBoard, '.board')
    colorNumbers(gBoard)
    // TODO: set more initializing values that come after rendering
    document.querySelector('.bomb-counter').innerText = String(gLevel.MINES).padStart(3, '0')
}



function cellClicked(elCell, i, j, ev) {


    const elCellContent = elCell.querySelector('*')
    // if(elCellContent = elCell.querySelector('*')){
    //     expandShown(gBoard,elCell,i, j)
    // }
    console.log('gGame.isOn:', gGame.isOn)
    if (gGame.isOn === false) {
        gTimerCounter = 1
        gTimerInterval = setInterval(startTimer, 1000)
        gGame.isOn = true
    }
    if (ev.button === 0 && gBoard[i][j].isMarked) return
    if (ev.button === 0 && gBoard[i][j].isShown) return
    if (ev.button === 2 && !gBoard[i][j].isMarked && !gBoard[i][j].isShown) {
        gPrevCellContent = elCell.innerHTML
        elCell.innerHTML = `<img src="imgs/flag.png" alt="flag">`
        elCell.querySelector('*').classList.toggle('revealed')
        gBoard[i][j].isMarked = true
        gGame.markedCount++
        gMinesLeftToMark--
        document.querySelector('.bomb-counter').innerText = String(gMinesLeftToMark).padStart(3, '0')
        checkWin()
        return
    } else if (ev.button === 2 && gBoard[i][j].isMarked && !gBoard[i][j].isShown) {
        elCell.innerHTML = gPrevCellContent
        elCell.querySelector('*').classList.remove('revealed')
        gMinesLeftToMark++
        gGame.markedCount--
        gBoard[i][j].isMarked = false
        document.querySelector('.bomb-counter').innerText = String(gMinesLeftToMark).padStart(3, '0')
        return
    }
    // check whats inside
    if (gBoard[i][j].isMine) {
        if (!gBoard[i][j].isShown) {
            gBoard[i][j].isShown = true
            elCellContent.classList.add('revealed')
            elCell.style.backgroundColor = 'red'
            gLivesCounter--
            gMinesLeftToMark--
            document.querySelector('.bomb-counter').innerText = String(gMinesLeftToMark).padStart(3, '0')
            var diff = document.querySelector('.lives span').innerText.slice(0, -1)
            document.querySelector('.lives span').innerText = diff
            if (gLivesCounter === 0) gameOver()
        } else {
            return
        }
    }
    if (gBoard[i][j].minesAroundCount) {
        elCellContent.classList.add('revealed')
    }
    gGame.shownCount++
    gBoard[i][j].isShown = true
    elCell.classList.add('selected')
    // 
    checkWin()

}

function startTimer() {
    document.querySelector('.timer').innerText = String(gTimerCounter).padStart(3, '0')
    gTimerCounter++
    console.log('gTimerCounter:', gTimerCounter)
}


function colorNumbers(board) {

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            const elCell = document.querySelector(`.cell-${i}-${j}`)
            switch (board[i][j].minesAroundCount) {
                case 0:
                    break
                case 1:
                    elCell.style.color = 'blue'
                    break
                case 2:
                    elCell.style.color = 'green'
                    break
                case 3:
                    elCell.style.color = 'red'
                    break
                case 4:
                    elCell.style.color = '#202081'
                    break
                case 5:
                    elCell.style.color = '#690400'
                    break
                case 6:
                    elCell.style.color = '#199'
                    break
            }

        }
    }

}


function buildBoard(size) {

    // TODO: Builds the board 
    const board = []
    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size; j++) {
            board[i][j] = createCell()
        }
    }
    return board
}

function getMinesCoords(board) {
    var mines = []
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            var coord = {
                i,
                j
            }
            mines.push(coord)
        }
    }
    return shuffle(mines)
}

function setMines(mines, minesCount) {
    for (let i = 0; i < minesCount; i++) {
        const mine = mines[i];
        gBoard[mine.i][mine.j].isMine = true
    }
}

function createCell() {
    return {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
    }
}


function setMinesNegsCount(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            // DONE: Count mines around each cell 
            countAround(board, i, j)
        }
    }
}

function countAround(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        // EXCLUDE OVERFLOW
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            // EXCLUDE CENTER OF AREA
            if (i === rowIdx && j === colIdx) continue
            // EXCLUDE OVERFLOW
            if (j < 0 || j >= board[0].length) continue
            // currCell = current neighbor
            var currCell = board[i][j]
            // CHOOSE HOW TO PROCEED FROM HERE ACCORDINGLY
            if (currCell.isMine) {
                // DONE : count each mine u find
                gBoard[rowIdx][colIdx].minesAroundCount++
            }
        }
    }
}


// function expandShown(board, elCell,
//     i, j) {
//         for (let i = 0; i < board.length; i++) {
//             for (let j = 0; j < board.length; j++) {
//                 const cell = board[j];

//             }
//         }
// }

function resetGame() {
    document.querySelector('.lives span').innerText = '❤❤❤'
    document.querySelector('.reset img').src = 'imgs/smiley-face.png'
    gGame.isOn = false
    gGame.markedCount = 0
    clearInterval(gTimerInterval)
    gGame.secsPassed = 1
    document.querySelector('.timer').innerText = '000'
    // document.querySelectorAll('.revealed')
    initGame()
}

function checkWin() {
    if (gLevel.MINES === gGame.markedCount) {
        document.querySelector('.reset img').src = 'imgs/winner.png'
    }
    clearInterval(gTimerInterval)
    gGame.isOn = false
    // if (gLevel.MINES === gGame.markedCount && gGame.shownCount >= gLevel.SIZE**2-gLevel.MINES) {
    //     console.log('he:')
    // }
}


function gameOver() {
    clearInterval(gTimerInterval)
    gGame.isOn = false
    document.querySelector('.reset img').src = 'imgs/dead-face.png'
    // var elCellsContent = document.querySelectorAll('tbody tr td *')
    var elCells = document.querySelectorAll('tbody tr td')
    for (let i = 0; i < elCells.length; i++) {
        const elCell = elCells[i];
        // elCellsContent.style.display = 'inline-block'
        var content = elCell.querySelector('*')
        if (content) {
            content.classList.add('revealed')
        }
        elCell.classList.add('selected')
    }
    // smiley changes
}

function changeLevel(elBtn) {
    switch (elBtn.innerText) {
        case 'BEGINNER':
            gLevel.SIZE = 4
            gLevel.MINES = 2
            resetGame()
            break
        case 'MEDIUM':
            gLevel.SIZE = 8
            gLevel.MINES = 14
            resetGame()
            break
        case 'EXPERT':
            gLevel.SIZE = 12
            gLevel.MINES = 32
            resetGame()
            break
    }

}
