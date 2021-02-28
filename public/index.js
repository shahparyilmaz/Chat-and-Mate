const socket = io();
const blackColor = document.getElementsByClassName('black')[0].style.backgroundColor.value;
const whiteColor = document.getElementsByClassName('white')[0].style.backgroundColor.value;

const boardColors = {
    'red':{dark:'rgb(211, 12, 51)',light:'rgb(255, 213, 219'},
    'blue':{dark:'rgb(32, 74, 165)',light:'rgb(210, 231, 255)'},
    'brown':{dark:'rgb(150, 62, 3)',light:'rgba(255, 217, 168, 0.932)'}
}
const move_sound = document.getElementById('movesound')

function chooseColor(choice){
    var color = choice.id;
    console.log(color)
    var dark = boardColors[color].dark;
    var light = boardColors[color].light;

    document.querySelectorAll('.black').forEach(black=>{
        black.style['backgroundColor']=dark
    })
    document.querySelectorAll('.white').forEach(white=>{
        white.style['backgroundColor']=light
    })
}


colorCode = {
    0: 'white',
    1: 'black'
}

var playerNum;
var turn = 0;

const squares = document.getElementsByClassName('square')
const playerColor = {
    0: 'white',
    1: 'black'
}

const coordinates = {
    white: ['a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8', 'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7', 'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6', 'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5', 'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4', 'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3', 'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2', 'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'],
    black: ['h1', 'g1', 'f1', 'e1', 'd1', 'c1', 'b1', 'a1', 'h2', 'g2', 'f2', 'e2', 'd2', 'c2', 'b2', 'a2', 'h3', 'g3', 'f3', 'e3', 'd3', 'c3', 'b3', 'a3', 'h4', 'g4', 'f4', 'e4', 'd4', 'c4', 'b4', 'a4', 'h5', 'g5', 'f5', 'e5', 'd5', 'c5', 'b5', 'a5', 'h6', 'g6', 'f6', 'e6', 'd6', 'c6', 'b6', 'a6', 'h7', 'g7', 'f7', 'e7', 'd7', 'c7', 'b7', 'a7', 'h8', 'g8', 'f8', 'e8', 'd8', 'c8', 'b8', 'a8']
}
var piecediv = document.createElement('div')
piecediv.classList.add('piecediv')

var piece = document.createElement('img')
piece.src = "images/blackbishop.png";
piece.classList.add('pieceimg')
piecediv.appendChild(piece)


const newGameBtn = document.getElementById('newGame');
const joinGameBtn = document.getElementById('joinGame');
var gameCode = document.getElementById('join-game');

newGameBtn.addEventListener('click',newGame);
joinGameBtn.addEventListener('click',joinGame);

function newGame(){
    socket.emit('newGame');
}
function joinGame(){
    const code= gameCode.value;
    socket.emit('joinGame',code);
}
socket.on('gameCode',data=>{
    document.getElementById('displayGameCode').innerText=data
})
socket.on('unknown code',()=>{
    alert('Room unavailable')
})
socket.on('roomFull',()=>{
    alert('Room is full')
})

socket.on('setPlayer', num => {

    if (num == 0) {
        playerNum = 0;
        var a = 0;
        for (var i = 0; i < squares.length; i++) {
            squares[i].setAttribute('id', `${coordinates.white[a]}`)
            a++;
        }
    }
    else if (num == 1) {
        playerNum = 1;
        var a = 0;
        for (var i = 0; i < squares.length; i++) {
            squares[i].setAttribute('id', `${coordinates.black[a]}`)
            a++;
        }
    }
    else { return }
    setVerticalsAndHorizontals(num)
    setpieces();
    displayCoordinates(num)
})

socket.on('startGame',()=>{
    document.getElementById('WelcomeScreen').style['display']="none";
    document.getElementById('game').style['display']="flex";
})

/*
var a = 0;
for (var h = 8; h > 0; h--) {
    for (var v = 1; v < 9; v++) {
        squares[a].setAttribute('horizontal', h);
        squares[a].setAttribute('vertical', v);
        squares[a].setAttribute('index', a + 1)
        a++;
    }
}
*/
const pieces = {
    'pawn': pawn,
    'rook': rook,
    'knight': knight,
    'bishop': bishop,
    'queen': queen,
    'king': king
};
var piece_selected = 0;
var for_dot = 0;
var move_to;
var move_from;
var fromSquare;
var previous_color;
var clickNum = 0;



socket.on('move', data => {
    var pieceToMove = document.getElementById(data);
    movefun(pieceToMove)
})
socket.on('dot', data => {
    var dotsquare = document.getElementById(data)
    dotfun(dotsquare)
})
socket.on('turn', data => {
    turn = data;
})
socket.on('check', data => {
    if (playerNum != data) {
        displayCheck()
    }
})
socket.on('captured', data => {
    console.log('displaying captured')
    displayCapturedPiece(data.piece,data.player)
})
document.getElementById('sendchat').addEventListener('click',()=>{
    var chat = document.getElementById('chat').value;
    socket.emit('chat',{message:chat,sender:playerNum})
})
socket.on('chat',data=>{
    var sender;
    if(playerNum==data.sender){
        sender = 'You';
    }
    else{
        sender = 'Opponent';
    }
    document.getElementById('message').innerHTML += '<p><strong>'+sender+':</strong>'+' '+data.message+'</p>';
})


function clickfun(square) {
    if (playerNum == turn) {
        if (clickNum == 0) {
            if (square.children[0].attributes.color.value == playerColor[playerNum]) {
                socket.emit('move', square.id)
                colorfun(square)
                clickNum += 1;
            }
        }
        else {
            socket.emit('move', square.id)
            colorfun(square)
        }
    }
    //socket.emit('dot',square.id)
}

function movefun(square) {
    if (piece_selected == 0) {
        if (square.innerHTML != "") {
            move_from = square;
            //previous_color = square.style.backgroundColor;
            //square.style.backgroundColor = "rgb(0, 171, 250, 0.6)";
            piece_selected += 1;
        }
    }
    else if (piece_selected == 1) {

        move_from.classList.remove('setToMove')
        if (square == move_from) {
            //colorBack(move_from, previous_color)
            clickNum = 0;

            piece_selected -= 1;
        }
        else {
            var piece = move_from.children[0].id;
            let legalFunction = pieces[piece];
            let legal_moves = legalFunction(move_from, squares);
            if (legal_moves.includes(square)) {
                if (temporary_move(move_from, square) != true) { //if next move escapes check
                    move(square);
                    removeCheck()
                    if (checkForChecks(turn)) {
                        socket.emit('check', turn)
                    }
                    clickNum = 0;
                    turn = updateTurn(turn)
                    socket.emit('turn', turn)
                }
                else {
                    clickNum = 0;
                    piece_selected = 0;
                }
            }
            else {
                piece_selected -= 1;
                clickNum -= 1;
            }

        }
    }
    else {
        console.log("nothing happened")
    }
}

function colorfun(colorSquare) {
    if (for_dot == 0) {
        if (colorSquare.innerHTML != "") {
            fromSquare = colorSquare;
            if (fromSquare.classList[1] == 'black') {
                previous_color = blackColor;
            }
            else {
                previous_color = whiteColor;
            }
            //fromSquare.style['backgroundColor'] = "green";
            fromSquare.classList.add('setToMove');
            var piecetomove = fromSquare.children[0].id;
            let legalFunction_fordot = pieces[piecetomove];
            let legal_moves_fordot = legalFunction_fordot(fromSquare, squares);
            colorLegalMoves(legal_moves_fordot)
            for_dot += 1;
        }
    }
    else if (for_dot == 1) {

        fromSquare.style.backgroundColor = previous_color;
        //colorBack(fromSquare,previous_color)
        deleteColorLegalMoves()
        for_dot -= 1;
    }
    else {
    }
}

function move(to_square) {
    deleteMovedColors()
    move_to = to_square;
    //colorBack(move_from, previous_color)
    var movingPiece = move_from.children[0]
    movingPiece.attributes.moveCount.value = parseInt(movingPiece.attributes.moveCount.value) + 1;
    if (movingPiece.id == 'pawn') {
        updatePawnTwoMoves(movingPiece);
    }
    if(movingPiece.id=='king'){
        castle(move_from,to_square)
    }
    move_to.appendChild(move_from.children[0]);
    if (move_to.children.length > 1) {
        //socket.emit('captured',{piece:move_to.children[0],player:turn})
        displayCapturedPiece(move_to.children[0],turn)
        move_to.children[0].remove();   
    }
    move_sound.play()
    move_to.classList.add('movedTo');
    if (document.querySelector('.setToMove')) {
        document.querySelector('.setToMove').classList.remove('setToMove')
    }
    move_from.classList.add('movedFrom')
    piece_selected -= 1;
}

function temporary_move(move_from, move_to) {
    move_to.appendChild(move_from.children[0]);
    if (move_to.children.length > 1) {
        var captured = move_to.children[0];
        move_to.children[0].remove();
    }
    if (areYouUnderCheck(turn)) {
        move_from.appendChild(move_to.children[0])
        if (captured) {
            move_to.appendChild(captured)
        }
        return true
    }
    else {
        move_from.appendChild(move_to.children[0])
        if (captured) {
            move_to.appendChild(captured)
        }
        return false
    }
}

function displayCapturedPiece(piece,player){
    var piece_url = piece.children[0].src;
    var pieceImg = document.createElement('img')
    pieceImg.src = piece_url
    if(player==playerNum){
        document.getElementById('you').appendChild(pieceImg)
    }
    else{
        document.getElementById('opponent').appendChild(pieceImg)
    }
}


function giveCheck(num, moveTo, movingPiece) {
    //moving piece is moving piece's id
    let future_legal_moves = allLegalMoves(moveTo, movingPiece);
    var opponentNum;
    if (num == 0) {
        opponentNum = 1;
    }
    else { opponentNum = 0; }
    var opponent_color = playerColor[opponentNum];
    var kings = document.querySelectorAll('#king')
    var opponent_king;
    kings.forEach(king => {
        if (king.attributes.color.value == opponent_color) {
            opponent_king = king;
        }
    })
    var opponent_king_square = opponent_king.parentElement;
    if (future_legal_moves.includes(opponent_king_square)) {
        return true
    }
    else {
        return false
    }

}
function checkForChecks(num) {
    var checkGiven = false;
    //can also look for discovery check unlike giveCheck function
    var your_color = playerColor[num];
    your_pieces = document.querySelectorAll(`div[color='${your_color}']`)
    for (var i = 0; i < your_pieces.length; i++) {
        if (giveCheck(num, your_pieces[i].parentElement, your_pieces[i].id)) {
            checkGiven = true
            break
        }
    }
    return checkGiven
}
function areYouUnderCheck(num) {
    var opponent_num = 1 - num;
    if (checkForChecks(opponent_num)) {
        return true
    }
    else {
        return false
    }
}

function isTheSquareCovered(square){
    var o_pieces = document.querySelectorAll(`div[color='${playerColor[1-turn]}']`);
    for(var i=0;i<o_pieces.length;i++){
        let opponent_moves = allLegalMoves(o_pieces[i].parentElement,o_pieces[i].id)
        if(opponent_moves.includes(square)){
            return true
        }
    }
}


function displayCheck() {
    your_color = playerColor[playerNum];
    var your_king;
    var kings = document.querySelectorAll('#king');
    kings.forEach(king => {
        if (king.attributes.color.value == your_color) {
            your_king = king;
        }
    })
    your_king_square = your_king.parentElement;
    your_king_square.classList.add('check')
}
function removeCheck() {
    if (document.querySelector('.check')) {
        document.querySelector('.check').classList.remove('check')
    }
}



function deleteMovedColors() {
    if (document.querySelector('.movedTo')) {
        document.querySelector('.movedTo').classList.remove('movedTo')
    }
    if (document.querySelector('.movedFrom')) {
        document.querySelector('.movedFrom').classList.remove('movedFrom')
    }
}

function allLegalMoves(moveFrom, piece) {
    //piece is piece's id
    let legalFunction = pieces[piece];
    let legal_moves = legalFunction(moveFrom, squares);
    return legal_moves
}

function colorLegalMoves(legal_moves) {
    for (var i = 0; i < legal_moves.length; i++) {
        legal_moves[i].classList.add('legalMoveColor')
    }
}

function deleteColorLegalMoves() {
    if (document.querySelector('.legalMoveColor')) {
        document.querySelectorAll('.legalMoveColor').forEach(segment => {
            segment.classList.remove('legalMoveColor')
        })
    }
}
function setVerticalsAndHorizontals(n) {
    if (n == 0) {
        var a = 0;
        for (var h = 8; h > 0; h--) {
            for (var v = 1; v < 9; v++) {
                squares[a].setAttribute('horizontal', h);
                squares[a].setAttribute('vertical', v);
                squares[a].setAttribute('index', a + 1)
                a++;
            }
        }
    }
    else if (n == 1) {
        var a = 0;
        for (var h = 1; h < 9; h++) {
            for (var v = 8; v > 0; v--) {
                squares[a].setAttribute('horizontal', h);
                squares[a].setAttribute('vertical', v);
                squares[a].setAttribute('index', a + 1)
                a++;
            }
        }
    }
}

function updateTurn(turn) {
    if (turn == 0) {
        turn = 1;
    }
    else {
        turn = 0;
    }
    return turn
}




const piecesInitialPosition = {
    white1: ['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'],
    white2: ['a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2'],
    black1: ['a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7'],
    black2: ['a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8']
}

const whitepiecesURL = {
    white_pawn: "images/whitepawn.png",
    white_rook: "images/whiterook.png",
    white_knight: "images/whiteknight.png",
    white_bishop: "images/whitebishop.png",
    white_queen: "images/whitequeen.png",
    white_king: "images/whiteking.png",
}
const blackpiecesURL = {
    black_pawn: "images/blackpawn.png",
    black_rook: "images/blackrook.png",
    black_knight: "images/blackknight.png",
    black_bishop: "images/blackbishop.png",
    black_queen: "images/blackqueen.png",
    black_king: "images/blackking.png",
}

const firstRankPieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']

function setpieces() {
    //white pawn line
    for (var i = 0; i < piecesInitialPosition.white2.length; i++) {
        var piecediv = document.createElement('div')
        piecediv.classList.add('piecediv')
        piecediv.setAttribute('id', 'pawn')
        piecediv.setAttribute('color', 'white')
        piecediv.setAttribute('firstMove', 0)
        piecediv.setAttribute('moveCount', 0)
        var piece = document.createElement('img')
        piece.src = `${whitepiecesURL.white_pawn}`
        piece.classList.add('pieceimg')
        piece.classList.add('w')
        piecediv.appendChild(piece)
        document.getElementById(`${piecesInitialPosition.white2[i]}`).appendChild(piecediv)
    }
    //white piece line
    for (var i = 0; i < piecesInitialPosition.white1.length; i++) {
        var piecediv = document.createElement('div')
        piecediv.classList.add('piecediv')
        piecediv.setAttribute('id', `${firstRankPieces[i]}`)
        piecediv.setAttribute('color', 'white')
        piecediv.setAttribute('moveCount', 0)
        var piece = document.createElement('img')
        piece_name = `white_${firstRankPieces[i]}`;
        piece.src = `${whitepiecesURL[piece_name]}`;
        piece.classList.add('pieceimg')
        piece.classList.add('w')
        piecediv.appendChild(piece)
        document.getElementById(`${piecesInitialPosition.white1[i]}`).appendChild(piecediv)
    }
    //black pawn line
    for (var i = 0; i < piecesInitialPosition.black1.length; i++) {
        var piecediv = document.createElement('div')
        piecediv.classList.add('piecediv')
        piecediv.setAttribute('id', 'pawn')
        piecediv.setAttribute('color', 'black')
        piecediv.setAttribute('firstMove', 0)
        piecediv.setAttribute('moveCount', 0)
        var piece = document.createElement('img')
        piece.src = `${blackpiecesURL.black_pawn}`
        piece.classList.add('pieceimg')
        piece.classList.add('b')
        piecediv.appendChild(piece)
        document.getElementById(`${piecesInitialPosition.black1[i]}`).appendChild(piecediv)
    }
    //black piece line
    for (var i = 0; i < piecesInitialPosition.black2.length; i++) {
        var piecediv = document.createElement('div')
        piecediv.classList.add('piecediv')
        piecediv.setAttribute('color', 'black')
        piecediv.setAttribute('moveCount', 0)
        piecediv.setAttribute('id', `${firstRankPieces[i]}`)
        var piece = document.createElement('img')
        piece_name = `black_${firstRankPieces[i]}`;
        piece.src = `${blackpiecesURL[piece_name]}`;
        piece.classList.add('pieceimg')
        piece.classList.add('b')
        piecediv.appendChild(piece)
        document.getElementById(`${piecesInitialPosition.black2[i]}`).appendChild(piecediv)
    }
    /*
    console.log(document.getElementsByClassName('piecediv')[0])
    const pieces = document.querySelectorAll('.piecediv')
    pieces.forEach(piece => {
        piece.addEventListener('dragstart', ()=>{
            console.log('dragging')
            piece.classList.add('dragging')
        })
    })
    */
}


const white_file=['a','b','c','d','e','f','g','h','a','b','c','d','e','f','g','h',]
const white_rank=[8,8,7,7,6,6,5,5,4,4,3,3,2,2,1,1]
const black_file=['h','g','f','e','d','c','b','a','h','g','f','e','d','c','b','a',]
const black_rank=[1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8]

function displayCoordinates(num){
    if(num==0){
        var i = 0;
        var j = 0;
        document.querySelectorAll('.file').forEach(file=>{
            file.innerText=white_file[i]
            i++
        })
        document.querySelectorAll('.rank').forEach(rank=>{
            rank.innerHTML=white_rank[j]
            j++
        })
    }
    else{
        var i = 0;
        var j = 0;
        document.querySelectorAll('.file').forEach(file=>{
            file.innerText=black_file[i]
            i++
        })
        document.querySelectorAll('.rank').forEach(rank=>{
            rank.innerHTML=black_rank[j]
            j++
        })
    }
}



//legal moves logic


function dot(legal_moves) {
    for (var i = 0; i < legal_moves.length; i++) {
        var dot = document.createElement('div')
        dot.style.backgroundImage = "radial-gradient(rgb(255, 104, 255, 0.7),rgb(187, 0, 187, 0.7))";
        //dot.style['border'] = "1.5px solid black";
        dot.style.width = "5vmin";
        dot.style.height = "5vmin";
        dot.style['borderRadius'] = "50%";
        dot.style['zIndex'] = "1";
        dot.style['position'] = "absolute";
        dot.classList.add('dot')
        legal_moves[i].appendChild(dot)
    }
}

function deleteDot() {
    document.querySelectorAll('.dot').forEach(part => { part.remove() })
}


function capture(from, to) {
    var from_color = from.children[0].attributes.color.value;
    var to_color = to.children[0].attributes.color.value;
    if (from_color != to_color) {
        return true;
    }
}




function colorBack(prev_square, prev_color) {
    prev_square.style.backgroundColor = prev_color;
}

function canMoveTwoSquares(pawn) {
    if (parseInt(pawn.attributes.firstMove.value) == 0) {
        return true
    }
    else {
        return false
    }
}
function updatePawnTwoMoves(pawn) {
    if (parseInt(pawn.attributes.firstMove.value) == 0) {
        pawn.attributes.firstMove.value = 1;
    }
}



function pawn(from, squares) {

    legalMoves = []
    f_h = parseInt(from.attributes.horizontal.value)
    f_v = parseInt(from.attributes.vertical.value)
    const pawnVertical = document.querySelectorAll(`div[vertical='${f_v}']`)
    const pawnHorizontal = document.querySelectorAll(`div[horizontal='${f_h}']`)
    const thisPawn = from.children[0]
    if (thisPawn.attributes.color.value == 'white') {
        if (canMoveTwoSquares(thisPawn)) {
            try {
                for (var i = f_h + 1; i < f_h + 3; i++) {
                    var element = getHorizontal(pawnVertical, i);
                    if (element.children.length == 0) {
                        legalMoves.push(element)
                    }
                    else {
                        break
                    }
                }
            }
            catch { }
        }
        else {
            try {
                var element = getHorizontal(pawnVertical, f_h + 1);
                if (element.children.length == 0) {
                    legalMoves.push(element)
                }
            }
            catch { }
        }
        try {
            var element = getsquare(f_h + 1, f_v + 1)
            if (element.children.length != 0) {
                if (capture(from, element)) {
                    legalMoves.push(element)
                }
            }
            var element = getsquare(f_h + 1, f_v - 1)
            if (element.children.length != 0) {
                if (capture(from, element)) {
                    legalMoves.push(element)
                }
            }
        }
        catch { }
    }
    else if (thisPawn.attributes.color.value == 'black') {
        if (canMoveTwoSquares(thisPawn)) {
            try {
                for (var i = f_h - 1; i > f_h - 3; i--) {
                    var element = getHorizontal(pawnVertical, i);
                    if (element.children.length == 0) {
                        legalMoves.push(element)
                    }
                    else {
                        break
                    }
                }
            }
            catch { }
        }
        else {
            try {
                var element = getHorizontal(pawnVertical, f_h - 1);
                if (element.children.length == 0) {
                    legalMoves.push(element)
                }
            }
            catch { }
        }
        try {
            var element = getsquare(f_h - 1, f_v + 1)
            if (element.children.length != 0) {
                if (capture(from, element)) {
                    legalMoves.push(element)
                }
            }
            var element = getsquare(f_h - 1, f_v - 1)
            if (element.children.length != 0) {
                if (capture(from, element)) {
                    legalMoves.push(element)
                }
            }
        }
        catch { }
    }
    else { return }

    return legalMoves
}


function rook(from, squares) {
    legalMoves = []
    f_h = parseInt(from.attributes.horizontal.value)
    f_v = parseInt(from.attributes.vertical.value)
    f_i = parseInt(from.attributes.index.value)
    const rookHorizontal = document.querySelectorAll(`div[horizontal='${f_h}']`)
    const rookVertical = document.querySelectorAll(`div[vertical='${f_v}']`)
    //right-straight
    for (var i = f_v + 1; i < 9; i++) {
        var element = getVertical(rookHorizontal, i);
        if (element.children.length == 0) {
            legalMoves.push(element)
        }
        else {
            if (capture(from, element)) {
                legalMoves.push(element)
            }
            break
        }
    }
    /*
    //right-straight-2
    for(var i=1;i<9;i++){
        try{
            var element = document.querySelector(`div[index=${f_i+i}]`);
            if(element.children.length == 0){
                legalMoves.push(element)
            }
            else{
                if(capture(from,element)){
                    legalMoves.push(element)
                }
            }
        }
        catch{}
    }
    */
    //left-straight
    for (var i = f_v - 1; i > 0; i--) {
        var element = getVertical(rookHorizontal, i);
        if (element.children.length == 0) {
            legalMoves.push(element)
        }
        else {
            if (capture(from, element)) {
                legalMoves.push(element)
            }
            break
        }
    }

    
    //up-straight
    for (var i = f_h + 1; i < 9; i++) {
        var element = getHorizontal(rookVertical, i);
        if (element.children.length == 0) {
            legalMoves.push(element)
        }
        else {
            if (capture(from, element)) {
                legalMoves.push(element)
            }
            break
        }
    }
    //down-straight
    for (var i = f_h - 1; i > 0; i--) {
        var element = getHorizontal(rookVertical, i);
        if (element.children.length == 0) {
            legalMoves.push(element)
        }
        else {
            if (capture(from, element)) {
                legalMoves.push(element)
            }
            break
        }
    }
    return legalMoves
}

function bishop(from, squares) {
    var legalMoves = [];
    f_v = parseInt(from.attributes.vertical.value);
    f_h = parseInt(from.attributes.horizontal.value);

    //up-right
    if (f_h < 8 && f_v < 8) {
        for (var i = f_h + 1, j = f_v + 1; i < 9, j < 9; i++, j++) {
            var horizontal = document.querySelectorAll(`div[horizontal='${i}']`)
            var element = getVertical(horizontal, j);
            try {
                if (element.children.length == 0) {
                    legalMoves.push(element)
                }
                else {
                    if (capture(from, element)) {
                        legalMoves.push(element)
                    }
                    break
                }
            }
            catch { break }
        }
    }
    //up-left
    if (f_h < 8 && f_v > 1) {
        for (var i = f_h + 1, j = f_v - 1; i < 9, j > 0; i++, j--) {
            var horizontal = document.querySelectorAll(`div[horizontal='${i}']`)
            var element = getVertical(horizontal, j);
            try {
                if (element.children.length == 0) {
                    legalMoves.push(element)
                }
                else {
                    if (capture(from, element)) {
                        legalMoves.push(element)
                    }
                    break
                }
            }
            catch { break }
        }
    }
    //down-right
    if (f_h > 1 && f_v < 8) {
        for (var i = f_h - 1, j = f_v + 1; i > 0, j < 9; i--, j++) {
            var horizontal = document.querySelectorAll(`div[horizontal='${i}']`)
            let element = getVertical(horizontal, j);
            try {
                if (element.children.length == 0) {
                    legalMoves.push(element)
                }
                else {
                    if (capture(from, element)) {
                        legalMoves.push(element)
                    }
                    break
                }
            }
            catch { break }
        }
    }
    //down-left

    if (f_h > 1 && f_v > 1) {
        for (var i = f_h - 1, j = f_v - 1; i > 0, j > 0; i--, j--) {
            var horizontal = document.querySelectorAll(`div[horizontal='${i}']`)
            let element = getVertical(horizontal, j);
            try {
                if (element.children.length == 0) {
                    legalMoves.push(element)
                }
                else {
                    if (capture(from, element)) {
                        legalMoves.push(element)
                    }
                    break
                }
            }
            catch { break }
        }
    }
    return legalMoves
}


function queen(from, squares) {
    var legalMoves = [];
    f_v = parseInt(from.attributes.vertical.value);
    f_h = parseInt(from.attributes.horizontal.value);
    var rookpart = rook(from, squares);
    var bishoppart = bishop(from, squares);
    legalMoves = rookpart.concat(bishoppart);
    return legalMoves
}


function king(from, squares) {
    var legalMoves = [];
    f_v = parseInt(from.attributes.vertical.value);
    f_h = parseInt(from.attributes.horizontal.value);
    const king_moves = [{ h: f_h, v: f_v + 1 }, { h: f_h, v: f_v - 1 }, { h: f_h + 1, v: f_v }, { h: f_h - 1, v: f_v }, { h: f_h + 1, v: f_v + 1 }, { h: f_h + 1, v: f_v - 1 }, { h: f_h - 1, v: f_v + 1 }, { h: f_h - 1, v: f_v - 1 },]
    for (var i = 0; i < king_moves.length; i++) {
        try {
            var element = getsquare(king_moves[i].h, king_moves[i].v)
            if (element.children.length == 0) {
                legalMoves.push(element)
            }
            else {
                if (capture(from, element)) {
                    legalMoves.push(element)
                }
            }
        }
        catch { }
    }
    //castle
    
    var king = from.children[0]
    //if(isThePieceUnderThreat(king,playerNum)!=true){
        if (parseInt(king.attributes.moveCount.value) == 0) {
            //console.log('calculating castling')
            if (king.attributes.color.value == 'white') {
                //console.log('white king')
                //white king on e1(h=1,v=5)
                var king_rook_square = document.getElementById('h1') //initial square of the rook
                var queen_rook_square = document.getElementById('a1') //initial square of the rook
                try{
                    if (king_rook_square.children[0].id == 'rook' && parseInt(king_rook_square.children[0].attributes.moveCount.value) == 0) {
                        if (document.getElementById('f1').children.length == 0 && document.getElementById('g1').children.length == 0) {
                            //if(isTheSquareCovered(document.getElementById('f1'))!=true){
                                legalMoves.push(document.getElementById('g1'))
                            //}
                        }
                        else{
                            //console.log('king side castle not available')
                        }
                    }
                }
                catch{}
                try{
                    if (queen_rook_square.children[0].id == 'rook' && parseInt(queen_rook_square.children[0].attributes.moveCount.value) == 0) {
                        if (document.getElementById('d1').children.length == 0 && document.getElementById('c1').children.length == 0 && document.getElementById('b1').children.length == 0) {
                            //if(isTheSquareCovered(document.getElementById('d1'))!=true){
                                legalMoves.push(document.getElementById('c1'))
                            //}
                        }
                        else{
                            //console.log('queen side castle not avaiable')
                        }
                    }
                }
                catch{}
    
            }
            else {
                //console.log('black king')
                //black king on e8(h=1,v=5)
                var king_rook_square = document.getElementById('h8') //   ,,
                var queen_rook_square = document.getElementById('a8') //   ,,
    
                try{
                    if (king_rook_square.children[0].id == 'rook' && parseInt(king_rook_square.children[0].attributes.moveCount.value) == 0) {
                        if (document.getElementById('f8').children.length == 0 && document.getElementById('g8').children.length == 0) {
                            //if(isTheSquareCovered(document.getElementById('f8'))!=true && isTheSquareCovered(document.getElementById('g8'))!=true){
                                legalMoves.push(document.getElementById('g8'))
                            //}
                            
                        }
                        else{
                            //console.log('king side castle not available')
                        }
                    }
                }
                catch{}
                try{
                    if (queen_rook_square.children[0].id == 'rook' && parseInt(queen_rook_square.children[0].attributes.moveCount.value) == 0) {
                        if (document.getElementById('d8').children.length == 0 && document.getElementById('c8').children.length == 0 && document.getElementById('b8').children.length == 0) {
                            //if(isTheSquareCovered(document.getElementById('d8'))!=true && isTheSquareCovered(document.getElementById('c8'))!=true){
                                legalMoves.push(document.getElementById('c8'))
                            //}
                        }
                        else{
                            //console.log('queen side castle not available')
                        }
                    }
                }
                catch{}
            }
        }
    
    //}

    return legalMoves
}


function isThePieceUnderThreat(piece,num){
    opponentNum = 1-num;
    opponent_pieces = document.querySelectorAll(`div[color=${playerColor[opponentNum]}]`)
    for(var i=0;i<opponent_pieces.length;i++){
        if(allLegalMoves(opponent_pieces[i].parentElement,opponent_pieces[i].id).includes(piece.parentElement)){
            return true
        }
    }
    return false
}
/*
function allLegalMoves(moveFrom, piece) {
    //piece is piece's id
    let legalFunction = pieces[piece];
    let legal_moves = legalFunction(moveFrom, squares);
    return legal_moves
}
*/

function castle(from, to) {//from and to squares of king
    //from is king's current square
    f_v = parseInt(from.attributes.vertical.value);
    f_h = parseInt(from.attributes.horizontal.value);
    t_v = parseInt(to.attributes.vertical.value);
    t_h = parseInt(to.attributes.horizontal.value);
    horizontal_pieces = document.querySelectorAll(`div[horizontal='${f_h}']`)
    if(t_v-f_v==2){ //king side
        var rook = getVertical(horizontal_pieces,8).children[0]
        var move_rook_to = getVertical(horizontal_pieces,6);
        move_rook_to.appendChild(rook)
        rook.attributes.moveCount.value = parseInt(rook.attributes.moveCount.value)+1;
    }
    else if(t_v-f_v==-2){
        var rook = getVertical(horizontal_pieces,1).children[0]
        var move_rook_to = getVertical(horizontal_pieces,4)
        move_rook_to.appendChild(rook)
        rook.attributes.moveCount.value = parseInt(rook.attributes.moveCount.value)+1;
    }
    else{
        return
    }
}

function areYouCastling(from,to){
    f_v = parseInt(from.attributes.vertical.value);
    t_v = parseInt(to.attributes.vertical.value);
    if(f_v-t_v>1||f_v-t_v<-1){
        return true
    }
}


function knight(from, squares) {
    var legalMoves = [];
    from_v = parseInt(from.attributes.vertical.value);
    from_h = parseInt(from.attributes.horizontal.value);
    for (var i = 0; i < squares.length; i++) {
        s_v = parseInt(squares[i].attributes.vertical.value);
        s_h = parseInt(squares[i].attributes.horizontal.value);
        if (((s_v == from_v + 2 || s_v == from_v - 2) && (s_h == from_h + 1 || s_h == from_h - 1)) || (s_h == from_h + 2 || s_h == from_h - 2) && (s_v == from_v + 1 || s_v == from_v - 1)) {
            if (squares[i].children.length == 0) {
                legalMoves.push(squares[i])
            }
            else {
                if (capture(from, squares[i])) {
                    legalMoves.push(squares[i])
                }
            }

        }
    }
    return legalMoves;
}


function getHorizontal(vertical, horizontal) {
    for (var i = 0; i < vertical.length; i++) {
        if (vertical[i].getAttribute("horizontal") == horizontal) {
            return vertical[i]
        }
    }
}
function getVertical(horizontal, vertical) {
    for (var i = 0; i < horizontal.length; i++) {
        if (horizontal[i].getAttribute("vertical") == vertical) {
            return horizontal[i]
        }
    }
}
function getsquare(horizontal, vertical) {
    var horizontalsquare = document.querySelectorAll(`div[horizontal='${horizontal}']`)
    return getVertical(horizontalsquare, vertical)
}



/*
function king(from, squares) {
    var legalMoves = [];
    f_v = parseInt(from.attributes.vertical.value);
    f_h = parseInt(from.attributes.horizontal.value);
    try {
        var right = getsquare(f_h, f_v + 1)
        if (right.children.length == 0) {
            legalMoves.push(right)
        }
        else {
            if(capture(from,right)){
                legalMoves.push(right)
            }
        }
    }
    catch { }
    try {
        var left = getsquare(f_h, f_v - 1)
        if (left.children.length == 0) {
            legalMoves.push(left)
        }
        else {
            if(capture(from,left)){
                legalMoves.push(left)
            }
        }
    }
    catch { }
    try {
        var up = getsquare(f_h + 1, f_v)
        if (up.children.length == 0) {
            legalMoves.push(up)
        }
        else {
            if(capture(from,up)){
                legalMoves.push(up)
            }
        }
    }
    catch { }
    try {
        var down = getsquare(f_h - 1, f_v)
        if (down.children.length == 0) {
            legalMoves.push(down)
        }
        else {
            if(capture(from,down)){
                legalMoves.push(down)
            }
        }
    }
    catch { }
    try {
        var upright = getsquare(f_h + 1, f_v + 1)
        if (upright.children.length == 0) {
            legalMoves.push(upright)
        }
        else {
            if(capture(from,upright)){
                legalMoves.push(upright)
            }
        }
    }
    catch { }
    try {
        var upleft = getsquare(f_h + 1, f_v - 1)
        if (upleft.children.length == 0) {
            legalMoves.push(upleft)
        }
        else {
            if(capture(from,upleft)){
                legalMoves.push(upleft)
            }
        }
    }
    catch { }
    try {
        var downright = getsquare(f_h - 1, f_v + 1)
        if (downright.children.length == 0) {
            legalMoves.push(downright)
        }
        else {
            if(capture(from,downright)){
                legalMoves.push(downright)
            }
        }
    }
    catch { }
    try {
        var downleft = getsquare(f_h - 1, f_v - 1)
        if (downleft.children.length == 0) {
            legalMoves.push(downleft)
        }
        else {
            if(capture(from,downleft)){
                legalMoves.push(downleft)
            }
        }
    }
    catch { }
    return legalMoves
}
*/