/************************** WEBRTC INITIATOR **************************/
var peer;
/* Allow 'window' context to reference the function */
window.peer = peer;

// RTC Connections
var rtcConnections = [];

// Initiator Room ID
const iRID = { 'id' : '' };

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
        advStreams.myUserInfo.roles = data.roles;
    });

    socket.on('RTCUserList', (data) => {
        console.log('RTC User List Received');
        console.log(data);
        showRTCUserList(data);
    });

    // When connecting to a Receiver Peer
    socket.on('receiveReceiverAnswer', (data) => {
        console.log('Received Answer');
        console.log(data);
        peer.signal(data.data);
    });

    // When connecting to an Initiator Peer
    socket.on('receiveInitiatorOffer', (data) => {
        console.log('Received Offer');
        console.log(data);
        iRID.id = data.r_id;
        establishRTC(false, data.data);
    });
}

// SimplePeer User Connection Class
class rtcPeerConnection {
    #isInitiator;
    #rtcSimplePeer;
    #uListElem;

    constructor(init, uListElem) {
        this.#isInitiator = init;
        this.#uListElem = uListElem;

        this.#rtcSimplePeer = new SimplePeer({
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
            initiator: this.#isInitiator,
            trickle: false
        });

        this.#rtcSimplePeer.on('signal', (data) => {
            console.log(data);
            if (this.#isInitiator) {
                console.log('Initiator Signaling Started');
                socket.emit('sendOfferToUser', JSON.stringify({ 'r_id' : this.#uListElem.getAttribute('data-meta-rid'), 'data' : data}));
            } else {
                console.log('Receiver Signaling Started');
                socket.emit('sendAnswerToUser', JSON.stringify({ 'r_id' : iRID.id, 'data' : data}));
            }
        });
    
        this.#rtcSimplePeer.on('error', (err) => {
            console.log('error', err);
            let newRTCConnections = [];
            
            // Remove Peer from Array of Connections
            rtcConnections.forEach((con) => {
                if (con.rid != this.#uListElem.getAttribute('data-meta-rid')) {
                    newRTCConnections.push(con);
                }
            });
    
            rtcConnections = newRTCConnections;
        });
        
        this.#rtcSimplePeer.on('connect', () => {
            console.log('Initiator Connected');
            let userData = swcms.advStreams.myUserInfo;

            if (this.#uListElem.getAttribute('data-meta-uid') == 2) {
                userData.name = 'Agente Contact-Os';
                userData.photoURL = '/static/images/manifest/agent_f.svg';
            }

            this.#rtcSimplePeer.send(JSON.stringify({
                msgType: 'welcome',
                msgUserInfo: userData
            }));
        });
        
        this.#rtcSimplePeer.on('close', () => {
            console.log('Peer Disconnected');
            let newRTCConnections = [];
            
            // Remove Peer from Array of Connections
            rtcConnections.forEach((con) => {
                if (con.rid != this.#uListElem.getAttribute('data-meta-rid')) {
                    newRTCConnections.push(con);
                }
            });
    
            rtcConnections = newRTCConnections;
        });
        
        this.#rtcSimplePeer.on('data', (data) => {
            console.log('Initiator Data Received: ' + data);
            let utype = this.#uListElem.getAttribute('data-meta-utype');
            let uid = (utype != 'anon')? this.#uListElem.getAttribute('data-meta-uid') : this.#uListElem.getAttribute('data-meta-rid');
            let upic = this.#uListElem.querySelector('.mdc-list-item__graphic').src;
            let jMsg = JSON.parse(data);
            switch (jMsg.msgType) {
                case 'audio':
                case 'audiovideo':
                    if (!this.#uListElem.classList.contains('mdc-list-item--selected')) {
                        this.#uListElem.click();
                    }
                    if (jMsg.msg == 'accepted') {
                        swcms.managePeerStream('send');
                    } else if (jMsg.msg == 'ended') {
                        swcms.endAVCall(false);
                    }
                    swcms.displayCallUI(jMsg.msg, jMsg.msgType);
                    break;
        
                case 'msg':
                    let rtcUserList = document.querySelector('#active-rooms');
                    swcms.appendChatMessage(jMsg.msg, jMsg.msgDateTime, 'others', jMsg.msgUserName, uid, upic);
                    if (!this.#uListElem.classList.contains('mdc-list-item--selected')) {
                        this.#uListElem.querySelector('.mdc-list-item__meta').classList.remove('container--hidden');
                    }
                    rtcUserList.insertBefore(this.#uListElem, rtcUserList.firstChild);
                    break;
        
                case 'welcome':
                    hideRTCMessagesLoader(uid);
                    rtcConnections.forEach((con) => {
                        if (con.rid == this.#uListElem.getAttribute('data-meta-rid')) {
                            con.userInfo = jMsg.msgUserInfo;
                        }
                    });
                    swcms.advStreams.otherUserInfo = jMsg.msgUserInfo;
                    swcms.appendChatMessage(jMsg.msgUserInfo.name + ' Online.', null, 'auto', '', uid);
                    socket.emit('updateUsersStatus', JSON.stringify({
                        'e_id' : advStreams.myUserInfo.id,
                        's_type' : 'busy',
                        'u_id' : this.#uListElem.getAttribute('data-meta-rid'),
                        'u_type' : this.#uListElem.getAttribute('data-meta-utype') 
                    }));
                    break;
            }
        });
        
        this.#rtcSimplePeer.on('stream', (stream) => {
            console.log('Setting Remote Stream');
            swcms.setAVStream(stream);
        });
    }

    get peerConnection() {
        return this.#rtcSimplePeer;
    }
}

// Stablish WebRTC with Selected User
function establishRTC(init = true, receiverData = null) {
    console.log('Establish Initiator Peer');
    let uListElem;
    // Check if assigned to someone else - BUSY status
    
    // If peer is as initiator, Show Conversation UI
    // If peer is as receiver, create Peer only
    if (init) {
        uListElem = this;
        // Show Conversation UI
        showConversationUI(true, uListElem);
    } else {
        document.querySelectorAll('#active-rooms > li').forEach((elm) => {
            if (elm.getAttribute('data-meta-rid') == iRID.id)
                uListElem = elm;
        });
    }
    
    // Check if peer connection already exists
    let existsPeer = checkPeerExists(uListElem.getAttribute('data-meta-rid'));
    if (existsPeer) {
        // If Peer was started as Receiver we send a signal
        if (receiverData) {
            peer.signal(receiverData);
        }
        return;
    }

    // Create new RTC Simple Peer Connection
    let newPeer = new rtcPeerConnection(init, uListElem);
    
    // If Peer was started as Receiver we send a signal
    if (receiverData) {
        newPeer.peerConnection.signal(receiverData);
    }

    // Add Peer Connection to Array of Connections
    console.log('Adding Peer to Connections Array');
    rtcConnections.push({
        'peer': newPeer,
        'rid': uListElem.getAttribute('data-meta-rid'),
        'userInfo': ''
    });

    // Set Newly Created Peer as the Current Peer
    if (uListElem.classList.contains('mdc-list-item--selected')) {
        peer = newPeer.peerConnection;
    }
}


/************************** FUNCTIONS **************************/


// Side menu responsive UI
if (document.querySelector('.container-chat--sidemenu')) {
    let backButtonEl = document.querySelector('.container-chat--topbar-info-back');
    let chatBodyEl = document.querySelector('.container-chat--body');
    let chatFooterEl = document.querySelector('.container-chat--footer');
    let chatNoConver = document.querySelector('.container-chat--no-conversation');
    let chatTopBarEl = document.querySelector('.container-chat--topbar');
    let sideMenuEl = document.querySelector('.container-chat--sidemenu');

    const initCollapsibleSideMenu = () => {
        if (document.querySelector('.container-chat--body-messages-active')){
            chatNoConver.classList.add('container--hidden');
            chatBodyEl.classList.remove('container--hidden');
            chatFooterEl.classList.remove('container--hidden');
            chatTopBarEl.classList.remove('container--hidden');
            backButtonEl.classList.remove('container--hidden');
            sideMenuEl.classList.add('container--hidden');
        } else {
            chatBodyEl.classList.add('container--hidden');
            chatFooterEl.classList.add('container--hidden');
            chatNoConver.classList.add('container--hidden');
            chatTopBarEl.classList.add('container--hidden');
            backButtonEl.classList.remove('container--hidden');
            sideMenuEl.classList.remove('container--hidden');
        }
    }

    const initPermanentSideMenu = () => {
        if (document.querySelector('.container-chat--body-messages-active')){
            backButtonEl.classList.add('container--hidden');
            chatNoConver.classList.add('container--hidden');
            chatBodyEl.classList.remove('container--hidden');
            chatFooterEl.classList.remove('container--hidden');
            chatTopBarEl.classList.remove('container--hidden');
            sideMenuEl.classList.remove('container--hidden');
        } else {
            backButtonEl.classList.add('container--hidden');
            chatBodyEl.classList.add('container--hidden');
            chatFooterEl.classList.add('container--hidden');
            chatTopBarEl.classList.add('container--hidden');
            chatNoConver.classList.remove('container--hidden');
            sideMenuEl.classList.remove('container--hidden');
        }
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

// Add RTC User to User List
function appendRTCUser(room_id, user, uType) {
    let uid;
    let userContainer;
    // Anonymous containers ID are Room IDs, all others are IDs
    if (uType == 'anon') {
        uid = room_id;
    } else {
        uid = user.id;
    }
    userContainer = document.getElementById('l_' + uid);
    // If there is no container, user is a new one
    if (!userContainer) {
        userContainer = createRTCListUserContainer();
        createRTCMessagesUserContainer(room_id, user, uType);
    }
    setRTCUserContainer(userContainer, room_id, user, uType);
    updateRTCUserStatus(uid, user.userInfo.status);
}

// Check if Peer Exists and Assign it to Peer if available
function checkPeerExists(rid) {
    let val = false;

    rtcConnections.forEach((con) => {
        if (con.rid == rid && !con.peer.peerConnection.destroyed) {
            swcms.advStreams.otherUserInfo = con.userInfo;
            peer = con.peer.peerConnection;
            val = true;
        }
    });

    return val;
}

// Create RTC User List Element
function createRTCListUserContainer() {
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
    userStatus.classList.add('material-icons', 'mdc-list-item__graphic-status', 's-font-color-chat-online');
    textContainer.classList.add('mdc-list-item__text');
    userName.classList.add('mdc-list-item__primary-text');
    userInfo.classList.add('mdc-list-item__secondary-text', 'mdc-typography--caption');
    metaContainer.classList.add('mdc-list-item__meta', 'container--hidden');
    notification.classList.add('material-icons', 's-font-color-primary');

    userStatus.textContent = 'stop_circle';
    notification.textContent = 'notification_important';

    metaContainer.appendChild(notification);
    textContainer.appendChild(userName);
    textContainer.appendChild(userInfo);
    userContainer.appendChild(ripple);
    userContainer.appendChild(userPhoto);
    userContainer.appendChild(userStatus);
    userContainer.appendChild(textContainer);
    userContainer.appendChild(metaContainer);

    userContainer.addEventListener('click', establishRTC);

    document.querySelector('#active-rooms').appendChild(userContainer);

    return userContainer;
}

// Create RTC User Messages Element
function createRTCMessagesUserContainer(room_id, user, uType) {
    let userContainer = document.createElement('div');
    let loader = document.createElement('div');
    let bounce1 = document.createElement('div');
    let bounce2 = document.createElement('div');
    let bounce3 = document.createElement('div');

    userContainer.classList.add('container-chat--body-messages', 'container-chat--body-messages-hidden');
    loader.classList.add('s-loader');
    bounce1.classList.add('s-loader-bounce1');
    bounce2.classList.add('s-loader-bounce2');
    bounce3.classList.add('s-loader-bounce3');

    loader.appendChild(bounce1);
    loader.appendChild(bounce2);
    loader.appendChild(bounce3);
    userContainer.appendChild(loader);

    userContainer.id = (uType == 'anon')? 'm_' + room_id : 'm_' + user.id;

    document.querySelector('.container-chat--body').appendChild(userContainer);

    return userContainer;
}

// Hide RTC User Message Container Loader
function hideRTCMessagesLoader(uid) {
    let msgContainer = document.getElementById('m_' + uid);
    let loaderElem = msgContainer.querySelector('.s-loader');
    
    loaderElem.classList.add('container--hidden');
}

// Set RTC User List Container Data
function setRTCUserContainer(container, room_id, user, uType) {
    let userInfo = user.userInfo;
    let activityTime = returnFormatDate(new Date(userInfo.activity - (new Date().getTimezoneOffset()*60000)));
    let userName = (uType != 'anon')? userInfo.name : userInfo.name + ' - ' + userInfo.ip;
    let userPhoto = (userInfo.photoURL)? decodeURIComponent(userInfo.photoURL) : '/static/images/manifest/user_f.svg';

    container.id = (uType == 'anon')? 'l_' + room_id : 'l_' + user.id;
    container.setAttribute('data-meta-assigned', userInfo.assignedTo);
    container.setAttribute('data-meta-ip', userInfo.ip);
    container.setAttribute('data-meta-rid', room_id);
    container.setAttribute('data-meta-roles', userInfo.roles);
    container.setAttribute('data-meta-status', userInfo.status);
    container.setAttribute('data-meta-uid', user.id);
    container.setAttribute('data-meta-utime', activityTime);
    container.setAttribute('data-meta-utype', uType);
    container.querySelector('.mdc-list-item__graphic').src = userPhoto;
    container.querySelector('.mdc-list-item__primary-text').textContent = userName;
}

// Set User Status Icon Element Color
function setUserStatusIconColor(elm, usrStatus) {
    elm.classList.remove('s-font-color-chat-busy', 's-font-color-chat-offline');
    elm.classList.remove('s-font-color-chat-online', 's-font-color-chat-transferred');
    switch (usrStatus) {
        case 'Atendido':
        case 'Atendiendo':
            elm.classList.add('s-font-color-chat-busy');
            break;
        case 'Disponible':
            elm.classList.add('s-font-color-chat-online');
            break;
        case 'Offline':
            elm.classList.add('s-font-color-chat-offline');
            break;
        case 'Transferid@':
            elm.classList.add('s-font-color-chat-transferred');
            break;
    }
}

// Show Contacts List - Back Button
function showContactsList() {
    let chatBodyEl = document.querySelector('.container-chat--body');
    let chatFooterEl = document.querySelector('.container-chat--footer');
    let chatNoConver = document.querySelector('.container-chat--no-conversation');
    let chatTopBarEl = document.querySelector('.container-chat--topbar');
    let sideMenuEl = document.querySelector('.container-chat--sidemenu');

    chatBodyEl.classList.add('container--hidden');
    chatFooterEl.classList.add('container--hidden');
    chatNoConver.classList.add('container--hidden');
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
    let elemFocus = false;
    if (usrElem) {
        elemFocus = usrElem.classList.contains('mdc-list-item--selected');
    }
    
    // True: shows UI IF the element is not already displayed
    if (showOrHide && !elemFocus) {
        let uType = usrElem.getAttribute('data-meta-utype');
        let uid = (uType == 'anon')? usrElem.getAttribute('data-meta-rid') : usrElem.getAttribute('data-meta-uid');
        let chatMessagesEl = document.getElementById('m_' + uid);
        let currentElemFocus = document.querySelector('.container-chat--sidemenu-rooms').querySelector('.mdc-list-item--selected');

        chatBodyEl.classList.remove('container--hidden');
        chatFooterEl.classList.remove('container--hidden');
        chatTopBarEl.classList.remove('container--hidden');
        chatNoConver.classList.add('container--hidden');

        if (currentElemFocus) {
            currentElemFocus.classList.remove('mdc-list-item--selected');
        }
        usrElem.classList.add('mdc-list-item--selected');
        usrElem.querySelector('.mdc-list-item__meta').classList.add('container--hidden');
        
        // Mobile UI - Hide SideMenu
        if (window.matchMedia("(max-width: 37.49em)").matches) {
            sideMenuEl.classList.add('container--hidden');
        }
        
        // Show User's Messages Section
        let activeMsgEl = document.querySelector('.container-chat--body-messages-active');
        if (activeMsgEl) {
            activeMsgEl.classList.remove('container-chat--body-messages-active');
            activeMsgEl.classList.add('container-chat--body-messages-hidden');
        }
        chatMessagesEl.classList.remove('container-chat--body-messages-hidden');
        chatMessagesEl.classList.add('container-chat--body-messages-active');
        
        // Update User's Topbar info
        let usrName = usrElem.querySelector('.mdc-list-item__primary-text').textContent;
        let usrPhoto = usrElem.querySelector('.mdc-list-item__graphic').src;
        let usrStatus = usrElem.getAttribute('data-meta-status');
        document.querySelector('#chat-pic').src = usrPhoto;
        document.querySelector('.container-chat--topbar-info-data-name').textContent = usrName;
        updateRTCUserStatus(uid, usrStatus);

        // Update User's Call UI
        document.querySelector('#callerid-pic').src = usrPhoto;
        document.querySelector('#callerid-name').textContent = usrName;
    
    // False: shows No Conversation UI
    } else if (!showOrHide) {
        chatBodyEl.classList.add('container--hidden');
        chatFooterEl.classList.add('container--hidden');
        chatTopBarEl.classList.add('container--hidden');
        
        // Mobile UI - Show SideMenu
        if (window.matchMedia("(max-width: 37.49em)").matches) {
            chatNoConver.classList.add('container--hidden');
            sideMenuEl.classList.remove('container--hidden');
        } else {
            chatNoConver.classList.remove('container--hidden');
            sideMenuEl.classList.remove('container--hidden');
        }
    }
}

// Show RTC User List
function showRTCUserList(userlist) {
    let rtcULID = [];
    // Iterate through Anonymous users
    userlist.rtc_online_users.anon_users.forEach((user) => {
        appendRTCUser(user.r_id, user, 'anon');
        rtcULID.push('l_' + user.r_id);
    });
    // Iterate through Employees users
    userlist.rtc_online_users.emp_users.forEach((user) => {
        if (user.id != advStreams.myUserInfo.id) {
            appendRTCUser(user.r_id, user, 'emp');
            rtcULID.push('l_' + user.id);
        }
    });
    // Iterate through Registered users
    userlist.rtc_online_users.reg_users.forEach((user) => {
        appendRTCUser(user.r_id, user, 'reg');
        rtcULID.push('l_' + user.id);
    });
    // Remove users not Online unless focused
    document.querySelectorAll('#active-rooms > li').forEach((elm) => {
        if (!rtcULID.includes(elm.id)) {
            // Get User Type and ID
            let uType = elm.getAttribute('data-meta-utype');
            let id = (uType == 'anon')? elm.getAttribute('data-meta-rid') : elm.getAttribute('data-meta-uid');

            if (!elm.classList.contains('mdc-list-item--selected')){
                // Remove element if not in focus
                let m_elm = document.getElementById('m_' + id);
                elm.remove();
                m_elm.remove();
            } else {
                // Update element to offline if in focus
                updateRTCUserStatus(id, 'Offline');
            }
        }
    });
    // Show No Active Room if there are no users
    if (document.querySelectorAll('#active-rooms > li').length > 0) {
        document.querySelector('#no-active-room').classList.add('container--hidden');
    } else {
        document.querySelector('#no-active-room').classList.remove('container--hidden');
        showConversationUI(false, '');
    }
}

// Update RTC User Action Buttons elements
function updateRTCUserActionButtons(usrStatus) {
    switch (usrStatus) {
        case 'Atendido':
        case 'Atendiendo':
            document.querySelector('#audioCall').disabled = false;
            document.querySelector('#videoCall').disabled = false;
            break;
        case 'Disponible':
        case 'Offline':
            document.querySelector('#audioCall').disabled = true;
            document.querySelector('#videoCall').disabled = true;
            break;
    }
}

// Update RTC User Status elements
function updateRTCUserStatus(id, usrStatus) {
    let elem = document.getElementById('l_' + id);
    let elemFocus = elem.classList.contains('mdc-list-item--selected');
    let uActTime = (usrStatus != 'Offline')? elem.getAttribute('data-meta-utime') : returnFormatDate(Date.now());
    let uRoles = elem.getAttribute('data-meta-roles');
    let uType = elem.getAttribute('data-meta-utype');

    let statusText = (uType == 'emp')? '[' + uRoles + '] ' + usrStatus + ' - ' + uActTime : usrStatus + ' - ' + uActTime;
    elem.querySelector('.mdc-list-item__secondary-text').textContent = statusText;
    setUserStatusIconColor(elem.querySelector('.mdc-list-item__graphic-status'), usrStatus);
    

    if (elemFocus) {
        let ftTextAreaElem = document.querySelector('.mdc-text-field--textarea');
        let ftTextInputElem = document.querySelector('.mdc-text-field__input');
        let tbStatIconElem = document.querySelector('.container-chat--topbar-info-data-status-icon');
        let tbStatTextElem = document.querySelector('.container-chat--topbar-info-data-status-text');
        let wasOfflineNowOnline = tbStatTextElem.textContent.includes('Offline');

        switch (usrStatus) {
            case 'Disponible':
                ftTextAreaElem.classList.add('mdc-text-field--disabled');
                ftTextInputElem.disabled = true;
                break;
            case 'Offline':
                tbStatTextElem.classList.remove('s-font-color-primary');
                tbStatTextElem.classList.add('s-font-color-secondary');
                ftTextAreaElem.classList.add('mdc-text-field--disabled');
                ftTextInputElem.disabled = true;
                break;
            default:
                tbStatTextElem.classList.remove('s-font-color-secondary');
                tbStatTextElem.classList.add('s-font-color-primary');
                ftTextAreaElem.classList.remove('mdc-text-field--disabled');
                ftTextInputElem.disabled = false;
        }
        tbStatTextElem.textContent = statusText;
        setUserStatusIconColor(tbStatIconElem, usrStatus);
        updateRTCUserActionButtons(usrStatus);

        // If user was Offline and now Online, automatically reconnect
        if (wasOfflineNowOnline && usrStatus == 'Disponible') {
            console.log('Reconnecting to user...');
            console.log(id);
            elem.click();
        }
    }
}

