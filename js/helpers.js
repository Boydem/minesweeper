'use strict'

// HINT

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
    gIsBoardLocked = true
    setTimeout(() => {
        for (let i = 0; i < revealed.length; i++) {
            const elCurrCell = revealed[i];
            if (elCurrCell.querySelector('*')) {
                elCurrCell.querySelector('*').classList.remove('revealed')
            }
            elCurrCell.classList.remove('hint')
            elCurrCell.classList.remove('selected')
        }
        gIsBoardLocked = false
    }, 2000)
}


// MEGA HINT

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
    gIsBoardLocked = true
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
        gIsBoardLocked = false
    }, 2000)
}

// SAFE CLICK

function onSafeBtn(board) {

    if (gSafeCounter > 0) {
        gSafeCounter--
        console.log('safe')
        var safeCells = []
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board.length; j++) {
                if (!board[i][j].isMine && !board[i][j].isShown && !board[i][j].isMarked) {
                    var coord = {
                        i,
                        j
                    }
                    safeCells.push(coord)
                }
            }
        }
        shuffle(safeCells)
        // update DOM
        var selector = '.cell-' + safeCells[0].i + '-' + safeCells[0].j
        var cell = document.querySelector(selector)
        cell.classList.add('safe')
        setTimeout(() => {
            cell.classList.remove('safe')
            document.querySelector(`button[data-btn-type="safe"] span`).innerText = gSafeCounter
        }, 2000);
    } else {
        return
    }

}


// EXTERMINATOR

function onExterminatorBtn() {
    document.querySelector(`button[data-btn-type="exterminator"] span`).innerText = '0'
    var mines = getShuffledMinesCoords(gBoard)
    console.log('mines', mines);
    unsetMines(mines, 3)
    setMinesNegsCount(gBoard)
    setTimeout(() => {
        renderForExterminator(gBoard, '.board tbody')
        colorNumbers(gBoard)
    }, 2000);
    gMinesLeftToMark -= 3
    document.querySelector('.bomb-counter').innerText = String(gMinesLeftToMark).padStart(3, '0')
    document.querySelector('.bomb-counter').innerText = String(gMinesLeftToMark).padStart(3, '0')
}

function renderForExterminator(board, selector) {
    var strHTML = `<tbody>`

    for (let i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (let j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            const className = `cell cell-${i}-${j}`
            if (cell.isMarked) {
                if (cell.minesAroundCount !== 0 && !cell.isMine) {
                    var idx = getMatchingFlagIdx(gPrevCellsContent, i, j)
                    gPrevCellsContent[idx].content = `<span class="revealed">${cell.minesAroundCount}</span>`
                    strHTML += `<td class="${className}" oncontextmenu="cellClicked(this,${i},${j},event)" onclick="cellClicked(this,${i},${j},event)"><img data-placed="cell-${i}-${j}" src="imgs/flag.png" alt="flag"></td>`
                } else if (cell.isMine) {
                    strHTML += `<td style="background-color:red;" class="${className}" oncontextmenu="cellClicked(this,${i},${j},event)" onclick="cellClicked(this,${i},${j},event)"><img data-placed="cell-${i}-${j}" src="imgs/flag.png" alt="flag"></td>`
                } else {
                    var idx = getMatchingFlagIdx(gPrevCellsContent, i, j)
                    gPrevCellsContent[idx].content = ``
                    strHTML += `<td class="${className}" oncontextmenu="cellClicked(this,${i},${j},event)" onclick="cellClicked(this,${i},${j},event)"><img data-placed="cell-${i}-${j}" src="imgs/flag.png" alt="flag"></td>`
                }
            }
            if (cell.isShown) {
                if (cell.minesAroundCount !== 0 && !cell.isMine) {
                    strHTML += `<td class="${className} selected" oncontextmenu="cellClicked(this,${i},${j},event)" onclick="cellClicked(this,${i},${j},event)"><span class="revealed">${cell.minesAroundCount}</span></td>`
                } else if (cell.isMine) {
                    strHTML += `<td style="background-color:red;" class="${className} selected" oncontextmenu="cellClicked(this,${i},${j},event)" onclick="cellClicked(this,${i},${j},event)"><img class="mine-img revealed" src="imgs/mine.png" alt="mine"/></td>`
                } else {
                    strHTML += `<td class="${className} selected" oncontextmenu="cellClicked(this,${i},${j},event)" onclick="cellClicked(this,${i},${j},event)"></td>`
                }
            } else if (cell.isMine) {
                strHTML += `<td class="${className}" oncontextmenu="cellClicked(this,${i},${j},event)" onclick="cellClicked(this,${i},${j},event)"><img class="mine-img" src="imgs/mine.png" alt="mine"/></td>`
            } else if (cell.minesAroundCount !== 0) {
                strHTML += `<td class="${className}" oncontextmenu="cellClicked(this,${i},${j},event)" onclick="cellClicked(this,${i},${j},event)"><span>${cell.minesAroundCount}</span></td>`
            } else {
                strHTML += `<td class="${className}" oncontextmenu="cellClicked(this,${i},${j},event)" onclick="cellClicked(this,${i},${j},event)"></td>`
            }

        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}