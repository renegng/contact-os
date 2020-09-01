/************************** SOCKET-IO INIT **************************/

const socket = io();

socket.on('connect', function() {
    console.log('Connect My Socket ID: ' + socket.id);
});

socket.on('disconnect', function() {
    // Try to reconnect if the connection stoped for some reason
    socket.socket.reconnect();
    console.log('Disconnect My Socket ID: ' + socket.id);
});

socket.on('userIsConnected', function() {
    console.log('I am online');
});