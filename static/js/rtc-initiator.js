/************************** WEBRTC INITIATOR **************************/

const peer = new SimplePeer({
    initiator: true,
    trickle: false
});

peer.on('error', err => console.log('error', err));

peer.on('signal', (data) => {
    console.log(data);
    socket.emit('sendOfferToUser', JSON.stringify(data));
});

socket.on('receiveReceiverAnswer', function(data) {
    peer.signal(data);
});

peer.on('connect', () => {
    console.log('CONNECTED');
    peer.send('Peer Initiator' + Math.random());
});

peer.on('data', (data) => {
    console.log('data: ' + data);
});
