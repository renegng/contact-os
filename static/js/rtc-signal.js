/************************** SOCKET-IO INIT **************************/

const socket = io();
socket.on('connect', function() {
    socket.emit('receiveSocketID', { data: socket.id });
    console.log('My Socket ID' + socket.id);
});

socket.on('disconnect', function() {
    socket.emit('disconnect', { data: socket.id });
});

socket.on('userIsConnected', function() {
    console.log('I am online');
});