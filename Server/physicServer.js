const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

var count = 0;
/*var emitPositions = (data) => {

    io.sockets.emit('gameStep', data);

}

module.exports = {
    emitPositions
}

var physics = require('./gamePhysics.js');*/

var World = require('./world.js');

//port definition
const port = process.env.PORT || 3000;

var app = express();
var physicsServer = http.createServer(app);
var io = socketIO(physicsServer);

var wo;

//server listen
physicsServer.listen(port, () => {

    console.log(`Server is up on ${port}`);

    //console.log(physics.gameElements);

});

io.on('connection', (socket) => {
    console.log('new user connected');

    //physics.startEnv();

    if (count == 0) {
        var w = new World(wo, 10, 10, "anil");

        w.startEnv();

        count ++;
    }
    else {

        var w = new World(wo, 10, 10, "kübra");

        w.startEnv();
    }


    //io.sockets.emit('gameStep', physics.gameElements);

    /*io.sockets.emit('newMessage', 'hello');

    socket.on('reply', (data) => {

        console.log(`message    from client : ${data}`);

    });

    socket.on('disconnect', (socket) => {

        console.log('disconnected');

    });*/

});








