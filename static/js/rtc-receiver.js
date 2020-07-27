/************************** WEBRTC RECEIVER **************************/
function initializePeer () {
    console.log('Initializing Peer');
    const peer = new SimplePeer({
        config: {
            iceServers: [
                {
                    urls: [
                        'stun:stun.l.google.com:19302',
                        'stun:stun1.l.google.com:19302',
                        'stun:stun2.l.google.com:19302',
                        'stun:stun3.l.google.com:19302',
                        'stun:stun4.l.google.com:19302',
                        'stun:global.stun.twilio.com:3478'
                    ]
                },{
                    urls: [
                        'turn:relay.backups.cz',
                        'turn:relay.backups.cz?transport=tcp'
                    ],
                    credential: 'webrtc',
                    username: 'webrtc'
                }
            ]
        },
        initiator: false,
        trickle: false
    });
    /* Allow 'window' context to reference the function */
    window.peer = peer;

    peer.on('error', err => console.log('error', err));
    
    peer.on('signal', (data) => {
        console.log('Receiver Signaling Started');
        console.log(data);
        socket.emit('sendAnswerToUser', JSON.stringify(data));
    });
    
    socket.on('receiveInitiatorOffer', (data) => {
        peer.signal(data);
    });
    
    peer.on('connect', () => {
        console.log('Receiver Connected');
        sentWelcomeData();
    });
    
    function sentWelcomeData(anon = '') {
        let userData = swcms.advStreams.myUserInfo;
    
        peer.send(JSON.stringify({
            msgType: 'welcome',
            msgUserInfo: userData
        }));
    }
    
    peer.on('close', () => {
        console.log('Initiator Disconnected');
        let userName = document.querySelector('.container-chat--topbar-info-data-name').textContent;
        document.querySelector('.container-chat--topbar-info-data-status-icon').classList.remove('s-font-color-green-confirm');
        document.querySelector('.container-chat--topbar-info-data-status-icon').classList.add('s-font-color-secondary');
        document.querySelector('.container-chat--topbar-info-data-status-text').textContent = 'Offline';
        document.querySelector('.container-chat--topbar-info-data-status-text').classList.remove('s-font-color-primary');
        document.querySelector('.container-chat--topbar-info-data-status-text').classList.add('s-font-color-secondary');
        document.querySelector('.mdc-text-field--textarea').classList.add('mdc-text-field--disabled');
        document.querySelector('.mdc-text-field__input').disabled = true;
        swcms.appendChatMessage(userName + ' Offline.', null, 'auto');
    });
    
    peer.on('data', (data) => {
        console.log('Initiator Data Received: ' + data);
        jMsg = JSON.parse(data);
        switch (jMsg.msgType) {
            case 'audio':
            case 'audiovideo':
                if (jMsg.msg == 'accepted') {
                    swcms.managePeerStream('send');
                } else if (jMsg.msg == 'ended') {
                    swcms.endAVCall(false);
                }
                swcms.displayCallUI(jMsg.msg, jMsg.msgType);
                break;
    
            case 'msg':
                swcms.appendChatMessage(jMsg.msg, jMsg.msgDateTime, 'others', jMsg.msgUserName);
                break;
    
            case 'welcome':
                swcms.advStreams.otherUserInfo = jMsg.msgUserInfo;
                document.querySelector('#chat-pic').src = jMsg.msgUserInfo.photoURL;
                document.querySelector('#callerid-pic').src = jMsg.msgUserInfo.photoURL;
                document.querySelector('#callerid-name').textContent = jMsg.msgUserInfo.name;
                document.querySelector('.container-chat--topbar-info-data-name').textContent = jMsg.msgUserInfo.name;
                document.querySelector('.container-chat--topbar-info-data-status-icon').classList.remove('s-font-color-secondary');
                document.querySelector('.container-chat--topbar-info-data-status-icon').classList.add('s-font-color-green-confirm');
                document.querySelector('.container-chat--topbar-info-data-status-text').textContent = 'Online';
                document.querySelector('.container-chat--topbar-info-data-status-text').classList.remove('s-font-color-secondary');
                document.querySelector('.container-chat--topbar-info-data-status-text').classList.add('s-font-color-primary');
                document.getElementById('s-loader-chat').style.display = 'none';
                document.querySelector('.mdc-text-field--textarea').classList.remove('mdc-text-field--disabled');
                document.querySelector('.mdc-text-field__input').disabled = false;
                swcms.appendChatMessage(jMsg.msgUserInfo.name + ' Online.', null, 'auto');
                break;
        }
    });
    
    peer.on('stream', (stream) => {
        swcms.setAVStream(stream);
    });
    
}
