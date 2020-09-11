/************************** WEBRTC INITIATOR **************************/
var peer;
/* Allow 'window' context to reference the function */
window.peer = peer;

function initializeRTC () {
    console.log('Initializing SocketIO/SimplePeer');

    const socket = io({
        query: 'photoURL=' + encodeURIComponent(advStreams.myUserInfo.photoURL)
    });
    /* Allow 'window' context to reference the function */
    window.socket = socket;
    
    socket.on('connect', function() {
        console.log('Connected - My Socket ID: ' + socket.id);
    });
    
    socket.on('disconnect', function() {
        console.log('Disconnected - My Socket ID: ' + socket.id);
    });
    
    socket.on('userIsConnected', (data) => {
        console.log('I am online: ' + data.id);
        advStreams.myUserInfo.id = data.id;
    });

    socket.on('RTCUserList', (data) => {
        console.log(data);
        showRTCUserList(data);
    });

    socket.on('receiveReceiverAnswer', (data) => {
        console.log('Received Answer');
        console.log(data);
        peer.signal(data.data);
    });
}

// Side menu responsive UI
if (document.querySelector('.container-chat--sidemenu')) {
    let backButtonEl = document.querySelector('.container-chat--topbar-info-back');
    let chatBodyEl = document.querySelector('.container-chat--body');
    let chatFooterEl = document.querySelector('.container-chat--footer');
    let chatNoConver = document.querySelector('.container-chat--no-conversation');
    let chatTopBarEl = document.querySelector('.container-chat--topbar');
    let sideMenuEl = document.querySelector('.container-chat--sidemenu');

    const initCollapsibleSideMenu = () => {
        backButtonEl.classList.remove('container--hidden');
        chatBodyEl.classList.add('container--hidden');
        chatFooterEl.classList.add('container--hidden');
        chatNoConver.classList.add('container--hidden');
        chatTopBarEl.classList.add('container--hidden');
        sideMenuEl.classList.remove('container--hidden');
    }

    const initPermanentSideMenu = () => {
        backButtonEl.classList.add('container--hidden');
        chatBodyEl.classList.add('container--hidden');
        chatFooterEl.classList.add('container--hidden');
        chatNoConver.classList.remove('container--hidden');
        chatTopBarEl.classList.add('container--hidden');
        sideMenuEl.classList.remove('container--hidden');
    }

    let sideMenu = window.matchMedia("(max-width: 37.49em)").matches ? initCollapsibleSideMenu() : initPermanentSideMenu();

    // Toggle between permanent sidemenu and collapsible sidemenu at breakpoint 37.5em
    const resizeSideMenuHandler = () => {
        if (window.matchMedia("(max-width: 37.49em)").matches) {
            sideMenu = initCollapsibleSideMenu();
        } else if (window.matchMedia("(min-width: 37.5em)").matches) {
            sideMenu = initPermanentSideMenu();
        }
    }

    window.addEventListener('resize', resizeSideMenuHandler);
}

// Show Contacts List
function showContactsList() {
    let chatBodyEl = document.querySelector('.container-chat--body');
    let chatFooterEl = document.querySelector('.container-chat--footer');
    let chatTopBarEl = document.querySelector('.container-chat--topbar');
    let sideMenuEl = document.querySelector('.container-chat--sidemenu');

    chatBodyEl.classList.add('container--hidden');
    chatFooterEl.classList.add('container--hidden');
    chatTopBarEl.classList.add('container--hidden');
    sideMenuEl.classList.remove('container--hidden');
}

// Show Conversation UI
function showConversationUI(showOrHide, usrElem) {
    let chatBodyEl = document.querySelector('.container-chat--body');
    let chatFooterEl = document.querySelector('.container-chat--footer');
    let chatNoConver = document.querySelector('.container-chat--no-conversation');
    let chatTopBarEl = document.querySelector('.container-chat--topbar');
    let sideMenuEl = document.querySelector('.container-chat--sidemenu');

    if (showOrHide) {
        chatNoConver.classList.add('container--hidden');
        chatBodyEl.classList.remove('container--hidden');
        chatFooterEl.classList.remove('container--hidden');
        chatTopBarEl.classList.remove('container--hidden');
        sideMenuEl.classList.remove('container--hidden');
    } else {
        chatNoConver.classList.remove('container--hidden');
        chatBodyEl.classList.add('container--hidden');
        chatFooterEl.classList.add('container--hidden');
        chatTopBarEl.classList.add('container--hidden');
        sideMenuEl.classList.remove('container--hidden');
    }
}

// Show RTC User List
function appendRTCUser(room_id, user, isEmp = false) {
    let userListContainer = document.querySelector('#active-rooms');
    let userContainer = document.getElementById(room_id);
    if (!userContainer) {
        userContainer = createRTCUserContainer();
        userListContainer.appendChild(userContainer);
    }
    updateRTCUserContainer(userContainer, room_id, user, isEmp);
}

function createRTCUserContainer() {
    let userContainer = document.createElement('li');
    let ripple = document.createElement('span');
    let userPhoto = document.createElement('img');
    let userStatus = document.createElement('i');
    let textContainer = document.createElement('span');
    let userName = document.createElement('span');
    let userInfo = document.createElement('span');
    let metaContainer = document.createElement('span');
    let notification = document.createElement('i');

    userContainer.classList.add('mdc-list-item');
    ripple.classList.add('mdc-list-item__ripple');
    userPhoto.classList.add('mdc-list-item__graphic');
    userStatus.classList.add('material-icons', 'mdc-list-item__graphic-status');
    textContainer.classList.add('mdc-list-item__text');
    userName.classList.add('mdc-list-item__primary-text');
    userInfo.classList.add('mdc-list-item__secondary-text', 'mdc-typography--caption');
    metaContainer.classList.add('mdc-list-item__meta', 'container--hidden');
    notification.classList.add('material-icons', 's-font-color-primary');

    userStatus.textContent = 'stop_circle';
    notification.textContent = 'notification_active';

    metaContainer.appendChild(notification);
    textContainer.appendChild(userName);
    textContainer.appendChild(userInfo);
    userContainer.appendChild(ripple);
    userContainer.appendChild(userPhoto);
    userContainer.appendChild(userStatus);
    userContainer.appendChild(textContainer);
    userContainer.appendChild(metaContainer);

    userContainer.addEventListener('click', stablishRTC);

    return userContainer;
}

function showRTCUserList(userlist) {
    let rtcULID = [];
    // Iterate through Anonymous users
    userlist.rtc_online_users.anon_users.forEach((user) => {
        appendRTCUser(user.r_id, user);
        rtcULID.push(user.r_id);
    });
    // Iterate through Employees users
    userlist.rtc_online_users.emp_users.forEach((user) => {
        if (user.id != advStreams.myUserInfo.id) {
            appendRTCUser(user.r_id, user, true);
            rtcULID.push(r_id);
        }
    });
    // Iterate through Registered users
    userlist.rtc_online_users.reg_users.forEach((user) => {
        appendRTCUser(user.r_id, user);
        rtcULID.push(user.r_id);
    });
    // Remove users not Online unless focused
    document.querySelectorAll('#active-rooms > li').forEach((elm) => {
        if (!rtcULID.includes(elm.id)) {
            elm.remove();
        }
    });
    // Show No Active Room if there are no users
    if (document.querySelectorAll('#active-rooms > li').length > 0) {
        document.querySelector('#no-active-room').classList.add('container--hidden');
    } else {
        document.querySelector('#no-active-room').classList.remove('container--hidden');
    }
}

function updateRTCUserContainer(container, room_id, user, isEmp) {
    let userInfo = user.userInfo;
    let activeTime = returnFormatDate(new Date(userInfo.activity - (new Date().getTimezoneOffset()*60000)));
    let userName = (user.id != 2)? userInfo.name : userInfo.name + ' - ' + userInfo.ip;
    let userPhoto = (userInfo.photoURL)? decodeURIComponent(userInfo.photoURL) : '/static/images/manifest/user_f.svg';
    let userStatus = (isEmp)? '[' + userInfo.roles + '] ' + userInfo.status + ' - ' + activeTime : userInfo.status + ' - ' + activeTime;

    container.id = room_id;
    container.querySelector('.mdc-list-item__graphic').src = userPhoto;
    container.querySelector('.mdc-list-item__primary-text').textContent = userName;
    container.querySelector('.mdc-list-item__secondary-text').textContent = userStatus;

    switch (userInfo.status) {
        case 'Online':
            container.querySelector('.mdc-list-item__graphic-status').classList.add('s-font-color-chat-online');
            break;
    }
}

// Stablish WebRTC with Selected User
function stablishRTC() {
    showConversationUI(true, this);

    peer = new SimplePeer({
        config: {
            iceServers: [
                {
                    urls: [
                        'stun:stun.l.google.com:19302',
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
        initiator: true,
        trickle: false
    });

    peer.on('signal', (data) => {
        console.log('Initiator Signaling Started');
        console.log(data);
        socket.emit('sendOfferToUser', JSON.stringify({ 'r_id' : this.id, 'data' : data}));
    });

    peer.on('error', err => console.log('error', err));
    
    peer.on('connect', () => {
        console.log('Initiator Connected');
    });
    
    function sentWelcomeData(anon = '') {
        let userData = swcms.advStreams.myUserInfo;
        
        if (anon == 'anonAgent') {
            userData.name = 'Agente Contact-Os';
            userData.photoURL = '/static/images/manifest/agent_f.svg';
        }
    
        peer.send(JSON.stringify({
            msgType: 'welcome',
            msgUserInfo: userData
        }));
    }
    
    peer.on('close', () => {
        console.log('Receiver Disconnected');
        let userName = document.querySelector('.container-chat--topbar-info-data-name').textContent;
        document.querySelector('.container-chat--topbar-info-data-status-icon').classList.remove('s-font-color-chat-online');
        document.querySelector('.container-chat--topbar-info-data-status-icon').classList.add('s-font-color-chat-offline');
        document.querySelector('.container-chat--topbar-info-data-status-text').textContent = 'Offline';
        document.querySelector('.container-chat--topbar-info-data-status-text').classList.remove('s-font-color-primary');
        document.querySelector('.container-chat--topbar-info-data-status-text').classList.add('s-font-color-secondary');
        document.querySelector('.mdc-text-field--textarea').classList.add('mdc-text-field--disabled');
        document.querySelector('.mdc-text-field__input').disabled = true;
        document.querySelector('#audioCall').disabled = true;
        document.querySelector('#moreOptionsButton').disabled = true;
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
                document.querySelector('.container-chat--topbar-info-data-status-icon').classList.remove('s-font-color-chat-offline');
                document.querySelector('.container-chat--topbar-info-data-status-icon').classList.add('s-font-color-chat-online');
                document.querySelector('.container-chat--topbar-info-data-status-text').textContent = 'Online';
                document.querySelector('.container-chat--topbar-info-data-status-text').classList.remove('s-font-color-secondary');
                document.querySelector('.container-chat--topbar-info-data-status-text').classList.add('s-font-color-primary');
                document.getElementById('s-loader-chat').style.display = 'none';
                document.querySelector('.mdc-text-field--textarea').classList.remove('mdc-text-field--disabled');
                document.querySelector('.mdc-text-field__input').disabled = false;
                document.querySelector('#audioCall').disabled = false;
                document.querySelector('#moreOptionsButton').disabled = false;
                document.querySelector('#videoCall').disabled = false;
                swcms.appendChatMessage(jMsg.msgUserInfo.name + ' Online.', null, 'auto');
                break;
        }
    });
    
    peer.on('stream', (stream) => {
        swcms.setAVStream(stream);
    });
}
