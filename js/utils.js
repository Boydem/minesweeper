'use strict'

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
                strHTML += `<td class="${className}" oncontextmenu="cellMarked(this,${i},${j},event)" onclick="cellClicked(this,${i},${j},event)"><img class="mine-img" src="imgs/mine.png" alt="mine"/></td>`
            } else if (cell.minesAroundCount !== 0) {
                strHTML += `<td class="${className}" oncontextmenu="cellMarked(this,${i},${j},event)" onclick="cellClicked(this,${i},${j},event)"><span>${cell.minesAroundCount}</span></td>`
            } else {
                strHTML += `<td class="${className}" oncontextmenu="cellMarked(this,${i},${j},event)" onclick="cellClicked(this,${i},${j},event)"></td>`
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


function startTimer() {
    document.querySelector('.timer').innerText = String(gTimerCounter).padStart(3, '0')
    gTimerCounter++
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

///////////////////////////////////////////////////////////////////////////////////////////////

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