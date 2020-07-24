/************************** WEBRTC INITIATOR **************************/
const peer = new SimplePeer({
    initiator: true,
    trickle: false
});

function initializePeer () {
    console.log('Initializing Peer');

    peer.on('error', err => console.log('error', err));
    
    peer.on('signal', (data) => {
        console.log('Initiator Signaling Started');
        console.log(data);
        socket.emit('sendOfferToUser', JSON.stringify(data));
    });
    
    socket.on('receiveReceiverAnswer', (data) => {
        peer.signal(data);
    });
    
    peer.on('connect', () => {
        console.log('Initiator Connected');
        /***
         * 
         * - Welcome signal is sent after receiving the Receiver's Welcome Signal,
         * - this is done in order to validate if the user is anonymous or not
         * - so that we send the appropriate info to the user.
         * 
        ***/
    });
    
    function sentWelcomeData(anon = '') {
        let userData = swcms.advStreams.myUserInfo;
        
        if (anon == 'anonAgent') {
            userData.name = 'Agente Contact-Os';
            userData.photoURL = '/static/images/manifest/agent-f.svg';
        }
    
        peer.send(JSON.stringify({
            msgType: 'welcome',
            msgUserInfo: userData
        }));
    }
    
    peer.on('close', () => {
        console.log('Receiver Disconnected');
        let userName = document.querySelector('.container-chat--topbar-info-data-name').textContent;
        document.querySelector('.container-chat--topbar-info-data-status-icon').classList.remove('s-font-color-green-confirm');
        document.querySelector('.container-chat--topbar-info-data-status-icon').classList.add('s-font-color-secondary');
        document.querySelector('.container-chat--topbar-info-data-status-text').textContent = 'Offline';
        document.querySelector('.container-chat--topbar-info-data-status-text').classList.remove('s-font-color-primary');
        document.querySelector('.container-chat--topbar-info-data-status-text').classList.add('s-font-color-secondary');
        document.querySelector('.mdc-text-field--textarea').classList.add('mdc-text-field--disabled');
        document.querySelector('.mdc-text-field__input').disabled = true;
        document.querySelector('#audioCall').disabled = true;
        document.querySelector('#videoCall').disabled = true;
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
                if (jMsg.msgUserInfo.name == 'Anonim@') {
                    sentWelcomeData('anonAgent');
                } else {
                    sentWelcomeData();
                }
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
                document.querySelector('#audioCall').disabled = false;
                document.querySelector('#videoCall').disabled = false;
                swcms.appendChatMessage(jMsg.msgUserInfo.name + ' Online.', null, 'auto');
                break;
        }
    });
    
    peer.on('stream', (stream) => {
        swcms.setAVStream(stream);
    });
}
