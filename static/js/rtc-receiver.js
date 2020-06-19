/************************** WEBRTC RECEIVER **************************/

const peer = new SimplePeer({
    initiator: false,
    trickle: false
});

peer.on('error', err => console.log('error', err));

peer.on('signal', (data) => {
    console.log(data);
    socket.emit('sendAnswerToUser', JSON.stringify(data));
});

socket.on('receiveInitiatorOffer', function(data) {
    peer.signal(data);
});

peer.on('connect', () => {
    console.log('CONNECTED');
    peer.send('Peer Receiver' + Math.random());
});

peer.on('data', (data) => {
    console.log('data: ' + data);
});
