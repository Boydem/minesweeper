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


// EXTERMINATOR