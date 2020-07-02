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
    console.log('Initiator Connected');
    peer.send(JSON.stringify({
        msgType: 'welcome',
        msgUserName: 'Agente 007'
    }));
});

peer.on('close', () => {
    console.log('Receiver Disconnected');
    let userName = document.querySelector('.container-chat--topbar-info-data-name').textContent;
    document.querySelector('.container-chat--topbar-info-data-status').textContent = 'Offline';
    document.querySelector('.container-chat--topbar-info-data-status').classList.remove('s-font-color-primary');
    document.querySelector('.container-chat--topbar-info-data-status').classList.add('s-font-color-secondary');
    swcms.appendChatMessage(userName + ' Offline.', null, 'auto');
});

peer.on('data', (data) => {
    console.log('Receiver Data Received: ' + data);
    jMsg = JSON.parse(data);
    if (jMsg.msgType == 'msg') {
        swcms.appendChatMessage(jMsg.msg, jMsg.msgDateTime, 'others', jMsg.msgUserName);
    } else if (jMsg.msgType == 'welcome') {
        document.querySelector('.container-chat--topbar-info-data-name').textContent = jMsg.msgUserName;
        document.querySelector('.container-chat--topbar-info-data-status').textContent = 'Online';
        document.querySelector('.container-chat--topbar-info-data-status').classList.remove('s-font-color-secondary');
        document.querySelector('.container-chat--topbar-info-data-status').classList.add('s-font-color-primary');
        document.getElementById('s-loader-chat').style.display = 'none';
        swcms.appendChatMessage(jMsg.msgUserName + ' Online!', null, 'auto');
    }
});
