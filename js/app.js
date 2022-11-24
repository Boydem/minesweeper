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
var gIsHintPressed
var gIsMegaPressed
var gIsGameOver
var gIsMegaFirstSaved
var gFirstCell
var gFirstClickEver
var gEmptySeen
const hbSound1 = new Audio('/audio/hb.wav')
const hbSound2 = new Audio('/audio/hb2.wav')
hbSound1.volume = 0.4
hbSound2.volume = 0.4


function initGame() {
    gFirstClickEver = false
    gIsGameOver = false
    gGame.isOn = false
    gIsHintPressed = false
    gIsMegaPressed = false
    gIsMegaFirstSaved = false
    gHintsCounter = 3
    gSafeCounter = 3
    gLivesCounter = 3
    gMinesLeftToMark = gLevel.MINES
    gPrevCellContent = []

    disableBtns()

    gBoard = buildBoard(gLevel.SIZE, gLevel.MINES)
    renderBoard(gBoard, '.board')

    document.querySelector('.bomb-counter').innerText = String(gLevel.MINES).padStart(3, '0')
    setBestScores()
}

function getMatchingFlag(saved, currI, currJ) {
    for (let i = 0; i < saved.length; i++) {
        const savedContent = saved[i];
        if (savedContent.i === currI && savedContent.j === currJ) {
            return savedContent.content
        }
    }
}

function cellMarked(elCell, i, j) {
    if (!gFirstClickEver) return
    if (!gGame.isOn) return
    if (!gBoard[i][j].isMarked && !gBoard[i][j].isShown) {
        if (gMinesLeftToMark === 0) return
        saveCellItem(gBoard[i][j], i, j, elCell.innerHTML)
        // gPrevCellContent = elCell.innerHTML
        elCell.innerHTML = `<img data-placed="cell-${i}-${j}" src="imgs/flag.png" alt="flag">`
        elCell.querySelector('*').classList.add('revealed')
        gBoard[i][j].isMarked = true
        gGame.markedCount++
        gMinesLeftToMark--
        document.querySelector('.bomb-counter').innerText = String(gMinesLeftToMark).padStart(3, '0')
        checkWin()
        return
    } else if (gBoard[i][j].isMarked && !gBoard[i][j].isShown) {
        elCell.innerHTML = getMatchingFlag(gPrevCellContent, i, j)
        if (elCell.querySelector('*') !== null) {
            elCell.querySelector('*').classList.remove('revealed')
        } else {
            elCell.classList.remove('revealed')
        }
        gMinesLeftToMark++
        gGame.markedCount--
        gBoard[i][j].isMarked = false
        document.querySelector('.bomb-counter').innerText = String(gMinesLeftToMark).padStart(3, '0')
        return
    }
    return
}

function saveCellItem(cell, i, j, content) {
    gPrevCellContent.push({
        cell,
        i,
        j,
        content
    })
}



function cellClicked(elCell, i, j, ev) {
    if (!gFirstClickEver) {
        enableBtns()
        var mines = getMinesCoords(gBoard, i, j)
        setMines(mines, gLevel.MINES)
        setMinesNegsCount(gBoard)
        renderBoard(gBoard, '.board')
        colorNumbers(gBoard)
        var elFirstCell = document.querySelector(`.cell-${i}-${j}`)
        elFirstCell.classList.add('selected')
        gFirstClickEver = true
        if (gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isMine) {
            expandShown(gBoard, elCell, i, j)
        } else if (gBoard[i][j].minesAroundCount > 0) {
            elFirstCell.querySelector('span').classList.add('revealed')
            gGame.shownCount++
            gBoard[i][j].isShown = true
        }
    }

    if (gIsMegaPressed && !gIsMegaFirstSaved) {
        gIsMegaFirstSaved = true
        elCell.classList.add('mega-mark')
        gFirstCell = {
            elCell,
            i,
            j
        }
        console.log('gFirstCell', gFirstCell)
        return
    } else if (gIsMegaPressed && gIsMegaFirstSaved) {
        gIsMegaPressed = false
        elCell.classList.add('mega-mark')
        var secondCell = {
            elCell,
            i,
            j
        }
        megaMark(gBoard, gFirstCell, secondCell)
        return
    }



    var leftClick = ev.button === 0
    var rightClick = ev.button === 2

    const elCellContent = elCell.querySelector('*')

    if (gIsHintPressed && gHintsCounter > 0) {
        expandForHint(gBoard, elCell, i, j)
        gHintsCounter--
        gIsHintPressed = false
        document.querySelector(`button[data-btn-type="hint"] span`).innerText = gHintsCounter
        return
    }


    if (rightClick && !gGame.isOn && !gIsGameOver) {
        gGame.isOn = true
        gTimerCounter = 1
        gTimerInterval = setInterval(startTimer, 1000)
        cellMarked(elCell, i, j)
        return
    } else if (rightClick && gGame.isOn && !gIsGameOver) {
        cellMarked(elCell, i, j)
        return
    }

    if (!gGame.isOn && !gIsGameOver) {
        gTimerCounter = 1
        gTimerInterval = setInterval(startTimer, 1000)
        gGame.isOn = true
    } else if (!gGame.isOn && !gIsGameOver) {
        return
    }



    if (gBoard[i][j].isMarked) return
    if (gBoard[i][j].isShown) return

    // check whats inside
    if (leftClick && gBoard[i][j].isMine) {
        if (!gBoard[i][j].isShown && gGame.isOn) {
            gLivesCounter--
            var hearts = document.querySelectorAll('.lives img')
            hearts[gLivesCounter].style.opacity = '0'
            if (gLivesCounter === 0) {
                elCellContent.classList.add('revealed')
                elCell.style.backgroundColor = 'red'
                gameOver()
                return
            }
            hbSound2.currentTime = 0
            hbSound2.play()
            gBoard[i][j].isShown = true
            elCellContent.classList.add('revealed')
            elCell.style.backgroundColor = 'red'
            gMinesLeftToMark--
            document.querySelector('.bomb-counter').innerText = String(gMinesLeftToMark).padStart(3, '0')
        } else {
            return
        }
    }
    if (elCellContent) {
        elCellContent.classList.add('revealed')
    }
    if (gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isMine) {
        expandShown(gBoard, elCell, i, j)
    } else if (!gBoard[i][j].isMine) {
        gGame.shownCount++
        gBoard[i][j].isShown = true
    }
    elCell.classList.add('selected')
    // 
    checkWin()

}


function expandShown(board, elCell,
    rowIdx, colIdx) {
    elCell.classList.add('selected')

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        // EXCLUDE OVERFLOW
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            // EXCLUDE OVERFLOW
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (currCell.isMarked) continue
            var cellSelector = '.cell-' + i + '-' + j
            var elCurrCell = document.querySelector(cellSelector)
            // MODEL
            if (currCell.isShown === false) {
                currCell.isShown = true
                gGame.shownCount++
            }
            // DOM
            elCurrCell.classList.add('selected')
            if (elCurrCell.querySelector('*')) {
                elCurrCell.querySelector('*').classList.add('revealed')
            }
            // if (currCell.minesAroundCount === 0) {
            //     expandShown(gBoard, elCurrCell, i, j)
            // }
        }
    }

}

function expandForHint(board, elCell,
    rowIdx, colIdx) {
    elCell.classList.add('selected')
    var revealed = []

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        // EXCLUDE OVERFLOW
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            // EXCLUDE OVERFLOW
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (currCell.isMarked) continue
            if (currCell.isShown) continue
            // DOM
            var cellSelector = '.cell-' + i + '-' + j
            var elCurrCell = document.querySelector(cellSelector)
            revealed.push(elCurrCell)
            elCurrCell.classList.add('selected')
            elCurrCell.classList.add('hint')
            if (elCurrCell.querySelector('*')) {
                elCurrCell.querySelector('*').classList.add('revealed')
            }
        }
    }
    setTimeout(() => {
        for (let i = 0; i < revealed.length; i++) {
            const elCurrCell = revealed[i];
            if (elCurrCell.querySelector('*')) {
                elCurrCell.querySelector('*').classList.remove('revealed')
            }
            elCurrCell.classList.remove('hint')
            elCurrCell.classList.remove('selected')
        }
    }, 2000)
}



function startTimer() {
    document.querySelector('.timer').innerText = String(gTimerCounter).padStart(3, '0')
    gTimerCounter++
}


function colorNumbers(board) {

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            const elCell = document.querySelector(`.cell-${i}-${j}`)
            switch (board[i][j].minesAroundCount) {
                case 0:
                    break
                case 1:
                    elCell.style.color = '#00A5E0'
                    break
                case 2:
                    elCell.style.color = '#3AB795'
                    break
                case 3:
                    elCell.style.color = '#ED254E'
                    break
                case 4:
                    elCell.style.color = '#C04CFD'
                    break
                case 5:
                    elCell.style.color = '#B3001B'
                    break
                case 6:
                    elCell.style.color = '#592E83'
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

function getMinesCoords(board, currI, currJ) {
    var mines = []
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            if (i === currI && j === currJ) continue
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



function resetGame() {
    resetHearts()
    gHintsCounter = 3
    document.querySelector(`button[data-btn-type="hint"] span`).innerText = gHintsCounter
    document.querySelector(`button[data-btn-type="mega"] span`).innerText = '1'
    document.querySelector(`button[data-btn-type="safe"] span`).innerText = gSafeCounter
    document.querySelector('.reset img').src = 'imgs/smiley-face.png'
    gGame.isOn = false
    gGame.markedCount = 0
    gGame.shownCount = 0
    clearInterval(gTimerInterval)
    gGame.secsPassed = 1
    document.querySelector('.timer').innerText = '000'
    // document.querySelectorAll('.revealed')
    initGame()
}

function checkWin() {
    if (gMinesLeftToMark === 0 && gGame.shownCount >= gLevel.SIZE ** 2 - gLevel.MINES) {
        document.querySelector('.reset img').src = 'imgs/winner.png'
        clearInterval(gTimerInterval)
        gGame.isOn = false
        gIsGameOver = true
        var gameOverSound = new Audio('audio/win.wav')
        gameOverSound.volume = 0.5
        gameOverSound.play()
        handleScore(gCurrLevel)
    }
}

function handleScore(level) {
    var currScore = gTimerCounter - 1
    switch (level) {
        case 1:
            var bestScore = localStorage.getItem(`bestScore1`)
            console.log('bestScore:', bestScore)
            var elScoreSpan = document.querySelector(`button[data-btn-score="beginner"] span`)
            if (currScore < bestScore) {
                localStorage.setItem('bestScore1', currScore)
                elScoreSpan.innerText = `BEST:${currScore}SECS`
            } else if (!bestScore) {
                localStorage.setItem('bestScore1', currScore)
                elScoreSpan.innerText = `BEST:${currScore}SECS`
            }
            break
        case 2:
            var bestScore = localStorage.getItem(`bestScore2`)
            console.log('bestScore:', bestScore)
            var elScoreSpan = document.querySelector(`button[data-btn-score="medium"] span`)
            if (currScore < bestScore) {
                localStorage.setItem('bestScore2', currScore)
                elScoreSpan.innerText = `BEST:${currScore}SECS`
            } else if (!bestScore) {
                localStorage.setItem('bestScore2', currScore)
                elScoreSpan.innerText = `BEST:${currScore}SECS`
            }
            break
        case 3:
            var bestScore = localStorage.getItem(`bestScore3`)
            console.log('bestScore:', bestScore)
            var elScoreSpan = document.querySelector(`button[data-btn-score="expert"] span`)
            if (currScore < bestScore) {
                localStorage.setItem('bestScore3', currScore)
                elScoreSpan.innerText = `BEST:${currScore}SECS`
            } else if (!bestScore) {
                localStorage.setItem('bestScore3', currScore)
                elScoreSpan.innerText = `BEST:${currScore}SECS`
            }
            break
    }
}



function gameOver() {

    clearInterval(gTimerInterval)
    var gameOverSound = new Audio('audio/gameover.wav')
    gameOverSound.volume = 0.5
    gameOverSound.play()
    gGame.isOn = false
    document.querySelector('.reset img').src = 'imgs/dead-face.png'
    const elHeart = document.querySelectorAll('.heart')[1]
    elHeart.src = 'imgs/dead.png'
    elHeart.style.opacity = '1'
    var elCells = document.querySelectorAll('tbody tr td')
    for (let i = 0; i < elCells.length; i++) {
        const elCell = elCells[i];
        var content = elCell.querySelector('*')
        if (content) {
            content.classList.add('revealed')
        }
        elCell.classList.add('selected')
    }
    gIsGameOver = true
}


function resetHearts() {
    document.querySelector('.lives').innerHTML = `
    <img src="imgs/heart.png" alt="heart" class="heart">
    <img src="imgs/heart.png" alt="heart" class="heart">
    <img src="imgs/heart.png" alt="heart" class="heart">
    `
}

function setBestScores() {
    const levels = [`beginner`, `medium`, `expert`]
    for (let i = 1; i <= levels.length; i++) {
        var currBest = localStorage.getItem(`bestScore${i}`)
        var elScoreSpan = document.querySelector(`button[data-btn-score="${levels[i-1]}"] span`)
        elScoreSpan.innerText = (currBest === null) ? `BEST:UNSET` : `Best Score: ${currBest} Secs`
    }
}

function megaMark(board, fromCoord, toCoord) {
    var revealed = []
    for (let i = fromCoord.i; i <= toCoord.i; i++) {
        for (let j = fromCoord.j; j <= toCoord.j; j++) {
            // const cell = board[i][j];
            if (board[fromCoord.i][fromCoord.j]) fromCoord.elCell.classList.remove('mega-mark')
            if (board[toCoord.i][toCoord.j]) toCoord.elCell.classList.remove('mega-mark')
            var currCell = board[i][j]
            if (currCell.isMarked) continue
            if (currCell.isShown) continue
            // DOM
            var cellSelector = '.cell-' + i + '-' + j
            var elCurrCell = document.querySelector(cellSelector)
            revealed.push(elCurrCell)
            elCurrCell.classList.add('selected')
            elCurrCell.classList.add('hint')
            if (elCurrCell.querySelector('*')) {
                elCurrCell.querySelector('*').classList.add('revealed')
            }
        }
    }
    setTimeout(() => {
        for (let i = 0; i < revealed.length; i++) {
            const elCurrCell = revealed[i];
            if (elCurrCell.querySelector('*')) {
                elCurrCell.querySelector('*').classList.remove('revealed')
            }
            elCurrCell.classList.remove('hint')
            elCurrCell.classList.remove('selected')
            document.querySelector(`button[data-btn-type="mega"] span`).innerText = '0'
        }
    }, 2000)



    // coords.push({
    //     i,
    //     j
    // })



}
// function enableBtns(){
//     var helpers = document.querySelectorAll('.helper')
//     helpers.forEach(helper => {
//         helper.disabled = helper.disabled
//     });
// }