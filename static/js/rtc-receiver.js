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
    console.log('Receiver Connected');
    peer.send(JSON.stringify({
        msgType: 'welcome',
        msgUserName: 'Cliente XYZ'
    }));
});

peer.on('close', () => {
    console.log('Initiator Disconnected');
    let userName = document.querySelector('.container-chat--topbar-info-data-name').textContent;
    document.querySelector('.container-chat--topbar-info-data-status').textContent = 'Offline';
    document.querySelector('.container-chat--topbar-info-data-status').classList.remove('s-font-color-primary');
    document.querySelector('.container-chat--topbar-info-data-status').classList.add('s-font-color-secondary');
    swcms.appendChatMessage(userName + ' Offline.', null, 'auto');
});

peer.on('data', (data) => {
    console.log('Initiator Data Received: ' + data);
    jMsg = JSON.parse(data);
    switch (jMsg.msgType) {
        case 'msg':
            swcms.appendChatMessage(jMsg.msg, jMsg.msgDateTime, 'others', jMsg.msgUserName);
            break;
        case 'welcome':
            document.querySelector('.container-chat--topbar-info-data-name').textContent = jMsg.msgUserName;
            document.querySelector('.container-chat--topbar-info-data-status').textContent = 'Online';
            document.querySelector('.container-chat--topbar-info-data-status').classList.remove('s-font-color-secondary');
            document.querySelector('.container-chat--topbar-info-data-status').classList.add('s-font-color-primary');
            document.getElementById('s-loader-chat').style.display = 'none';
            document.querySelector('.mdc-text-field--textarea').classList.remove('mdc-text-field--disabled');
            document.querySelector('.mdc-text-field__input').disabled = false;
            swcms.appendChatMessage(jMsg.msgUserName + ' Online!', null, 'auto');
            break;
        case 'audio':
        case 'audiovideo':
            swcms.displayCallUI(jMsg.msg, jMsg.msgType);
            if (jMsg.msg == 'accepted') {
                swcms.managePeerStream('send');
            }
            break;
    }
});

peer.on('stream', (stream) => {
    swcms.setAVStream(stream);
});
