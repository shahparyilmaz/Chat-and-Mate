const express = require('express')
const app = express()
const http = require('http')
const path = require('path')
const PORT = process.env.PORT || 3000
const server = http.createServer(app)
const socketio = require('socket.io')
const io = socketio(server)

app.use(express.static(path.join(__dirname, 'public')))


server.listen(PORT, () =>
    console.log(`Running on PORT: ${PORT}`))


const connections = [null, null];
var clientRooms = {}
io.on('connection', socket => {

    socket.on('newGame', handleNewGame);
    socket.on('joinGame', function (data) {
        handleJoinGame(data);
    });

    function handleNewGame() {
        let roomName = makeid(5);
        clientRooms[socket.id] = roomName;
        socket.emit('gameCode', roomName);
        socket.join(`${roomName}`);
        socket.number = 0;
        socket.emit('setPlayer', 0)
    }
    function handleJoinGame(roomName) {
        const room = io.sockets.adapter.rooms[roomName];

        let allUsers;
        if (room) {
            allUsers = room.sockets;
        }
        let numClients = 0;
        if (allUsers) {
            numClients = Object.keys(allUsers).length;
        }
        if (numClients == 0) {
            socket.emit('unknown code');
            return;
        }
        else if (numClients > 1) {
            socket.emit('roomFull');
            return;
        }
        clientRooms[socket.id] = roomName;
        socket.join(`${roomName}`);
        socket.number = 1;
        socket.emit('setPlayer', 1)

        io.sockets.in(roomName).emit('startGame')
    }
    /*
    let playerIndex = -1;
    for(const i in connections){
        if(connections[i]==null){
            connections[i]=socket
            playerIndex = i
            break
        }
    }
    if(playerIndex==-1){
        console.log('Room full')
        return
    }
    socket.emit('setPlayer',playerIndex)
    console.log(`Player ${playerIndex} is connected`)
    */
    socket.on('move', function (data) {
        io.sockets.emit('move', data);
    })
    socket.on('turn', data => {
        io.sockets.emit('turn', data);
    })
    socket.on('check', function (data) {
        io.sockets.emit('check', data);
    })
    socket.on('captured', function (data) {
        io.sockets.emit('check', data)
    })
    socket.on('chat', function (data) {
        io.sockets.emit('chat', data)
    })

    //new game join game

    /*
    socket.on('turn',function(data){
        io.sockets.emit('turn',changeTurn(data))
    })
    function changeTurn(turn){
        if (turn == 1) {
            turn = 0;
        }
        else {
            turn = 1;
        }   
        return turn
    }
    */
    /*
    socket.on('dot',function(data){
        socket.emit('dot',data)
    })
    */
});
function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}