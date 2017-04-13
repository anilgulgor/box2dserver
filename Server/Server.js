const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const World = require('./World.js');

var usernames = [];
var roomToJoin;

//port
const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

//server listen
server.listen(port , () => {

    console.log(`Server is on port ${port}`);

});

io.on('connection', function (socket) {

    //event fired when we get a new connection
    console.log('user connected');

    socket.emit('connected', `connected to the server`);

    //wait for addMe command with username parameter
    socket.on('addMe', function (username) {

        //Starting procedure of joining room
        console.log(`${username} started addMe procedure to join room`);

        //socket username is binded with client username
        socket.username = username;
        //socket room name is statically given.
        socket.room = 'room1';
        //add username to the global username list
        usernames.push(username);



        if (roomToJoin != null) {

            if (roomToJoin.length < 2) {

                //room is available to join

                //client join static room
                socket.join(socket.room, (err) => {

                    if (!err) {

                        roomToJoin = io.sockets.adapter.rooms[socket.room];

                        roomToJoin.name = socket.room;

                        //console.log(roomToJoin.length + " clients in room");

                        //join room sucessfully
                        socket.emit('connectedToRoom', `connected to the room name : ${socket.room}`);

                        //broadcast to another users in the room to warn that some user has connected
                        socket.broadcast.to(socket.room).emit('userConnectedToRoom', 'GameServer', `${username} has connected to the ${socket.room}`);

                        //room capacity is full right now
                        //we can start and emit world object positions to the clients

                        //startEmittingObjectPositionsToClients(roomToJoin);

                    }
                    else {

                        socket.emit('canNotConnectRoom', 'can not connect to the room');

                    }

                });

            }

        }
        else {

            //there is no room name socket.room

            socket.join(socket.room, (err) => {

                if (!err) {

                    roomToJoin = io.sockets.adapter.rooms[socket.room];

                    roomToJoin.name = socket.room;

                    //console.log(roomToJoin.length + " clients in room");

                    //world definition
                    var world;
                    var w = new World(world, 0.001, 10, `${socket.room} world`, roomToJoin);
                    // assign creator world to the roomToJoin.world
                    roomToJoin.world = w;

                    //join room sucessfully
                    socket.emit('connectedToRoom', `connected to the room name : ${socket.room}`);

                    //broadcast to another users in the room to warn that some user has connected
                    socket.broadcast.to(socket.room).emit('userConnectedToRoom', 'GameServer', `${username} has connected to the ${socket.room}`);

                    startEmittingObjectPositionsToClients(roomToJoin);

                }
                else {

                    socket.emit('canNotConnectRoom', 'can not connect to the room');

                }

            });

        }

    });

    socket.on('move', function(moveData) {

        var room = io.sockets.adapter.rooms[socket.room];

        //console.log(room);

        room.world.applyForce(socket.username, moveData);

        //console.log(socket.username + " socket adı");

    });

    socket.on('kick', function() {

        var room = io.sockets.adapter.rooms[socket.room];

        room.world.kickBall(socket.username);

    });

});



function startEmittingObjectPositionsToClients(room) {

    room.world.startEnv();

}

function emitObjectsToClients(roomName, gameElements) {

    //console.log(roomName);

    io.sockets.in(roomName).emit('worldStep', gameElements);

    //console.log('gönderdiiiiiiiiiiiim');

}

module.exports.emitObjectsToClients = emitObjectsToClients;