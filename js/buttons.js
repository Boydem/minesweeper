'use strict'

// Helpers
var gHintsCounter
var gSafeCounter
var gMegaCounter
var gExterminatorCounter
var gCurrLevel = 2

function enableBtns() {
    var helpers = document.querySelectorAll('.helper')
    helpers.forEach(helper => {
        // helper.enabled = true
        helper.disabled = false
    });
}

function disableBtns() {
    var helpers = document.querySelectorAll('.helper')
    helpers.forEach(helper => {
        helper.disabled = true
    });
}

function onHelperMouseEnter(elBtn) {
    const elBtnName = document.querySelector('.helper-span')
    switch (elBtn.dataset.btnType) {
        case 'hint':
            elBtnName.innerText = 'HINT'
            break

        case 'safe':
            elBtnName.innerText = 'SAFE MOVE'

            break

        case 'mega':
            elBtnName.innerText = 'MEGA HINT'

            break

        case 'exterminator':
            elBtnName.innerText = 'EXTERMINATOR'

            break

    }

    elBtnName.style.opacity = '1'
    // elBtnName.style.marginBottom = '10px'
}

function onHelperMouseLeave(elBtn) {
    const elBtnName = document.querySelector('.helper-span')
    elBtnName.style.opacity = '0'
    // elBtnName.style.marginBottom = '0px'
}

function onHelperBtn(elBtn) {
    switch (elBtn.dataset.btnType) {
        case 'hint':
            gIsHintPressed = true
            break
        case 'safe':
            onSafeBtn(gBoard)
            break
        case 'mega':
            if (gIsMegaFirstSaved) {
                gIsMegaPressed = false
                break
            } else {
                gIsMegaPressed = true
            }
            break
        case 'exterminator':
            onExterminatorBtn()
            break
    }
}

function onSafeBtn(board) {


    if (gSafeCounter > 0) {
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
        var randomSafe = document.querySelector(selector)
        randomSafe.classList.add('safe')
        setTimeout(() => {
            randomSafe.classList.remove('safe')
            gSafeCounter--
            document.querySelector(`button[data-btn-type="safe"] span`).innerText = gSafeCounter


        }, 2000);
    } else {
        return
    }

}

function onExterminatorBtn() {
    console.log('ext')

}


// Score

function changeLevel(elBtn) {
    switch (elBtn.dataset.btnScore) {
        case 'beginner':
            console.log('1');
            gLevel.SIZE = 4
            gLevel.MINES = 2
            gCurrLevel = 1
            resetGame()
            return;
        case 'medium':
            console.log('2');
            gLevel.SIZE = 8
            gLevel.MINES = 14
            gCurrLevel = 2
            resetGame()
            return;
        case 'expert':
            console.log('3');
            gLevel.SIZE = 12
            gLevel.MINES = 32
            gCurrLevel = 3
            resetGame()
            return;
    }

}

function onLevelMouseEnter(elBtn) {
    const elScore = elBtn.querySelector('.best-score')
    switch (elBtn.dataset.btnScore) {
        case 'beginner':
            break
        case 'medium':
            break
        case 'expert':
            break

    }
    elScore.style.bottom = '-30px'
    elScore.style.opacity = '1'
}

function onLevelMouseLeave(elBtn) {
    const elScore = elBtn.querySelector('.best-score')
    elScore.style.opacity = '0'
    elScore.style.bottom = '-10px'
}