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
var gPrevCellsContent
var gMinesCounter
var gLivesCounter
var gTimerCounter
var gIsHintPressed
var gIsMegaPressed
var gIsGameOver
var gIsMegaFirstSaved
var gFirstCell
var gFirstClickEver
var gEmptySeen
var gIsBoardLocked
var gIsUserOnManual
var gManualyChosenMines
var is7ModeOn
const bombSound = new Audio('audio/hb2.wav')
bombSound.volume = 0.4


function initValues() {
    is7ModeOn = false
    gIsGameOver = false
    gIsHintPressed = false
    gIsMegaPressed = false
    gIsMegaFirstSaved = false
    gIsExterminatorPressed = false
    gMinesCounter = 0
    gHintsCounter = 3
    gSafeCounter = 3
    gLivesCounter = 3
    gMinesLeftToMark = gLevel.MINES
    gPrevCellsContent = []
}

function initGame() {
    gIsUserOnManual = false
    gFirstClickEver = false
    gIsBoardLocked = false
    gGame.isOn = false
    initValues()
    disableBtns()
    gBoard = buildBoard(gLevel.SIZE, gLevel.MINES)
    renderBoard(gBoard, '.board')
    document.querySelector('.bomb-counter').innerText = String(gLevel.MINES).padStart(3, '0')
    setBestScores()
}

function getMatchingFlagContent(saved, currI, currJ) {
    for (let i = 0; i < saved.length; i++) {
        const savedContent = saved[i];
        if (savedContent.i === currI && savedContent.j === currJ) {
            return savedContent.content
        }
    }
}

function getMatchingFlagIdx(currI, currJ) {
    for (let i = 0; i < gPrevCellsContent.length; i++) {
        const savedContent = gPrevCellsContent[i];
        if (savedContent.i === currI && savedContent.j === currJ) {
            return i
        }
    }
}

function cellMarked(elCell, i, j) {
    if (gIsBoardLocked) return
    if (!gFirstClickEver) return
    if (!gGame.isOn) return
    if (!gBoard[i][j].isMarked && !gBoard[i][j].isShown) {
        if (gMinesLeftToMark === 0) return
        saveCellItem(gBoard[i][j], i, j, elCell.innerHTML)
        // gPrevCellContent = elCell.innerHTML
        elCell.innerHTML = `<img data-placed="cell-${i}-${j}" src="imgs/flag.png" alt="flag">`
        elCell.querySelector('*').classList.add('revealed')
        gBoard[i][j].isMarked = true
        console.log('gBoard[i][j]:', gBoard[i][j])
        gGame.markedCount++
        gMinesLeftToMark--
        document.querySelector('.bomb-counter').innerText = String(gMinesLeftToMark).padStart(3, '0')
        checkWin()
    } else if (gBoard[i][j].isMarked && !gBoard[i][j].isShown) {
        elCell.innerHTML = getMatchingFlagContent(gPrevCellsContent, i, j)
        if (elCell.querySelector('*') !== null) {
            elCell.querySelector('*').classList.remove('revealed')
        } else {
            elCell.classList.remove('revealed')
        }
        gMinesLeftToMark++
        gGame.markedCount--
        gBoard[i][j].isMarked = false
        document.querySelector('.bomb-counter').innerText = String(gMinesLeftToMark).padStart(3, '0')
    }
}

function saveCellItem(elCell, i, j, content) {
    gPrevCellsContent.push({
        elCell,
        i,
        j,
        content
    })
}



function cellClicked(elCell, i, j, ev) {
    if (gIsUserOnManual) {
        if (gBoard[i][j].isMine) return
        gBoard[i][j].isMine = true
        elCell.innerHTML = `<img class="mine-img revealed" src="imgs/bomba.png" alt="mine"/>`
        elCell.classList.add('mega-mark')
        gManualyChosenMines.push({
            elCell,
            i,
            j
        })
        var elBtn = document.querySelector('button[data-game-mode="manual"]')
        elBtn.innerText = gManualyChosenMines.length
        if (gManualyChosenMines.length === gLevel.MINES) {
            initValues()
            gIsUserOnManual = false
            gFirstClickEver = true
            setMinesNegsCount(gBoard)
            setTimeout(() => {
                elBtn.innerText = 'OK'
                renderBoard(gBoard, '.board')
                colorNumbers(gBoard)
                gIsBoardLocked = false
            }, 2000);
            console.log(gManualyChosenMines);
        }
        return
    }
    if (gIsBoardLocked) return
    if (!gFirstClickEver) {
        enableBtns()
        var mines = getRandomCoords(gBoard, i, j)
        setMines(mines, gLevel.MINES)
        setMinesNegsCount(gBoard)
        renderBoard(gBoard, '.board')
        colorNumbers(gBoard)
        document.querySelector('.bomb-counter').innerText = String(gLevel.MINES).padStart(3, '0')
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
            bombSound.currentTime = 0
            bombSound.play()
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
        checkWin()
        return
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
            var cellSelector = '.cell-' + i + '-' + j
            var elCurrCell = document.querySelector(cellSelector)
            if (i === rowIdx && j === colIdx) continue
            if (currCell.isMarked || currCell.isShown) continue

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
            if (currCell.minesAroundCount === 0 || !currCell.isShown) {
                expandShown(gBoard, elCurrCell, i, j)
            }
        }
    }

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

function getRandomCoords(board, currI, currJ) {
    var coords = []
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            if (i === currI && j === currJ) continue
            var coord = {
                i,
                j
            }
            coords.push(coord)
        }
    }
    return shuffle(coords)
}

function getShuffledMinesCoords(board) {
    const coords = []
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            if (gBoard[i][j].isMarked) continue
            if (gBoard[i][j].isShown) continue
            if (gBoard[i][j].isMine) {
                coords.push({
                    i,
                    j
                })
                gMinesCounter++
            }
        }
    }
    return shuffle(coords)
}

function setMines(mines, minesCount) {
    for (let i = 0; i < minesCount; i++) {
        const mine = mines[i];
        gBoard[mine.i][mine.j].isMine = true
    }
}

function unsetMines(mines, minesCount) {
    gMinesCounter -= minesCount
    for (let i = 0; i < minesCount; i++) {
        const mine = mines[i];
        // update model
        gBoard[mine.i][mine.j].isMine = false
        // update DOM
        var selector = '.cell-' + mine.i + '-' + mine.j
        var cell = document.querySelector(selector)
        cell.classList.add('safe')
        setTimeout(() => {
            cell.classList.remove('safe')
        }, 1000);
    }
}

function createCell(mine = false) {
    return {
        minesAroundCount: 0,
        isShown: false,
        isMine: mine,
        isMarked: false
    }
}


function setMinesNegsCount(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            const cell = gBoard[i][j]
            cell.minesAroundCount = 0
            // DONE: Count mines around each cell 
            countAround(board, i, j)
            if (cell.isMarked && !cell.isMine) {
                var idx = getMatchingFlagIdx(i, j)
                gPrevCellsContent[idx].content = `<td class=".cell .cell-${i}-${j}" oncontextmenu="cellMarked(this,${i},${j},event)" onclick="cellClicked(this,${i},${j},event)"><span>${cell.minesAroundCount}</span></td>`
            }
        }
    }
}

function resetDomEls() {
    document.querySelector(`button[data-btn-type="hint"] span`).innerText = '3'
    document.querySelector(`button[data-btn-type="mega"] span`).innerText = '1'
    document.querySelector(`button[data-btn-type="safe"] span`).innerText = '3'
    document.querySelector(`button[data-game-mode="manual"]`).innerText = 'M'
    document.querySelector(`button[data-game-mode="manual"]`).classList.remove('active')
    document.querySelector(`button[data-game-mode="7boom"]`).classList.remove('active')
    document.querySelector(`button[data-btn-type="exterminator"] span`).innerText = '1'
    document.querySelector('.reset img').src = 'imgs/smiley-face.png'
}


function resetGame() {
    resetHearts()
    gHintsCounter = 3
    resetDomEls()
    gGame.isOn = false
    gGame.markedCount = 0
    gGame.shownCount = 0
    clearInterval(gTimerInterval)
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
                elScoreSpan.innerText = `NEW:${currScore} Secs`
            } else if (!bestScore) {
                localStorage.setItem('bestScore1', currScore)
                elScoreSpan.innerText = `BEST:${currScore} Secs`
            }
            break
        case 2:
            var bestScore = localStorage.getItem(`bestScore2`)
            console.log('bestScore:', bestScore)
            var elScoreSpan = document.querySelector(`button[data-btn-score="medium"] span`)
            if (currScore < bestScore) {
                localStorage.setItem('bestScore2', currScore)
                elScoreSpan.innerText = `NEW:${currScore} Secs`
            } else if (!bestScore) {
                localStorage.setItem('bestScore2', currScore)
                elScoreSpan.innerText = `BEST:${currScore} Secs`
            }
            break
        case 3:
            var bestScore = localStorage.getItem(`bestScore3`)
            console.log('bestScore:', bestScore)
            var elScoreSpan = document.querySelector(`button[data-btn-score="expert"] span`)
            if (currScore < bestScore) {
                localStorage.setItem('bestScore3', currScore)
                elScoreSpan.innerText = `NEW:${currScore} Secs`
            } else if (!bestScore) {
                localStorage.setItem('bestScore3', currScore)
                elScoreSpan.innerText = `BEST:${currScore} Secs`
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



function setBestScores() {
    const levels = [`beginner`, `medium`, `expert`]
    for (let i = 1; i <= levels.length; i++) {
        var currBest = localStorage.getItem(`bestScore${i}`)
        var elScoreSpan = document.querySelector(`button[data-btn-score="${levels[i-1]}"] span`)
        elScoreSpan.innerText = (currBest === null) ? `BEST:UNSET` : `BEST: ${currBest} Secs`
    }
}
