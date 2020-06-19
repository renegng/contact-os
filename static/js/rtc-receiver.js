/************************** WEBRTC RECEIVER **************************/

const peer = new SimplePeer({
    initiator: false,
    trickle: false
});

peer.on('error', err => console.log('error', err));

socket.on('connectUserSocketID', function (data) {
    peer.signal(data);
});

peer.on('signal', (data) => {
    console.log(data);
    socket.emit('connectToUser', data);
});

peer.on('connect', () => {
    console.log('CONNECTED');
    peer.send('Peer Receiver' + Math.random());
});

peer.on('data', (data) => {
    console.log('data: ' + data);
});
