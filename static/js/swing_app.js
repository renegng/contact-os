/************************** IMPORTS **************************/

// import AOS from 'aos';
import anchorme from 'anchorme';
import 'core-js';
import 'regenerator-runtime/runtime';
import { accountRedirect } from './swing_firebase';
import { MDCDrawer } from "@material/drawer";
import { MDCFloatingLabel } from '@material/floating-label';
import { MDCIconButtonToggle } from '@material/icon-button';
import { MDCLineRipple } from '@material/line-ripple';
import { MDCList } from "@material/list";
import { MDCMenu, Corner } from '@material/menu';
import { MDCNotchedOutline } from '@material/notched-outline';
import { MDCRipple } from '@material/ripple';
import { MDCSelect } from '@material/select';
import { MDCSnackbar } from '@material/snackbar';
import { MDCTabBar } from '@material/tab-bar';
import { MDCTextField } from '@material/textfield';
import { MDCTextFieldHelperText } from '@material/textfield/helper-text';
import { MDCTextFieldIcon } from '@material/textfield/icon';
import { MDCTopAppBar } from '@material/top-app-bar';
import { Workbox } from 'workbox-window/Workbox.mjs';
import { isNull } from 'util';


/************************** FUNCTIONS **************************/

// Date Format
export function returnFormatDate(dateTime, type = '') {
    var dt = new Date(dateTime);
    var year = dt.getFullYear();
    var month = dt.getMonth();
    var day = dt.getDate();
    var hours = dt.getHours();
    var min = dt.getMinutes();
    var sec = dt.getSeconds();

    var ampm = (hours >= 12) ? 'pm' : 'am';
    var hoursampm = ((hours + 11) % 12 + 1);

    if (month.toString().length == 1) {
        month = '0' + month;
    }
    if (day.toString().length == 1) {
        day = '0' + day;
    }
    if (hours.toString().length == 1) {
        hours = '0' + hours;
    }
    if (min.toString().length == 1) {
        min = '0' + min;
    }
    if (sec.toString().length == 1) {
        sec = '0' + sec;
    }

    var returnDateTime = '';
    var formatDate = day + '/' + month + '/' + year + ' - ';
    var formatTime = hoursampm + ':' + min + ' ' + ampm;
    if (type == 'full') {
        returnDateTime += formatDate;
    }
    returnDateTime += formatTime;

    return returnDateTime;
}


// Fetch API
export function getFetch(url) {
    fetch(url)
        .then((response) => {
            if (response.status >= 200 && response.status < 300) {
                return Promise.resolve(response)
            } else {
                return Promise.reject(new Error(response.statusText))
            }
        })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            console.log('Request succeeded with JSON response: ', data);
        })
        .catch(function (error) {
            console.log('Request failed: ', error);
        });
}

export function postFetch(url, postData) {
    fetch(url, {
        method: 'POST',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify(postData)
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            console.log('Request succeeded with JSON response: ', data);
            if (data.cmd == 'redirectURL') {
                window.location.assign(data.action);
            }
        })
        .catch(function (error) {
            console.log('Request failed: ', error);
        });
}


// Play/Stop Audio File
Audio.prototype.stop = function() {
    this.pause();
    this.currentTime = 0;
};

export function playAudio(audioEl, play) {
    if (play) {
        audioEl.play();
    } else {
        audioEl.stop();
    }
}


// Send Chat Message
export function createChatMessageContainer(txt, dateTime, user, userName = '') {
    let msgContainer = document.createElement('p');
    let msgContainerMsg = document.createElement('span');
    let msgContainerTime = document.createElement('span');

    msgContainer.classList.add('animate__animated', 'animate__headShake');
    msgContainerMsg.classList.add('container-chat--body-message-message', 'mdc-typography--subtitle1', 'container-elevation-s');
    msgContainerTime.classList.add('container-chat--body-message-message-time', 'mdc-typography--caption', 's-font-color-on-surface');

    if (user == 'me') {
        msgContainer.classList.add('container-chat--body-message-me');
        msgContainerMsg.classList.add('s-font-color-on-primary');
    } else if (user == 'others') {
        let msgContainerUser = document.createElement('span');

        msgContainer.classList.add('container-chat--body-message-others');
        msgContainerMsg.classList.add('s-font-color-on-secondary');
        msgContainerUser.classList.add('container-chat--body-message-message-user', 'mdc-typography--caption', 's-font-color-secondary');

        msgContainerUser.textContent = userName;
        msgContainer.appendChild(msgContainerUser);
    } else if (user == 'auto') {
        msgContainer.classList.add('container-chat--body-message-auto', 's-font-align-center');
        msgContainerMsg = document.createElement('span');
        msgContainerMsg.classList.add('mdc-typography--caption', 's-font-color-secondary');
    }

    // Anchorme detects and replaces text with proper link tags
    let amtxt = anchorme({
        input: txt,
        options: {
            attributes: {
                target: "_blank"
            }
        }
    });
    msgContainerMsg.innerHTML = amtxt;
    msgContainer.appendChild(msgContainerMsg);
    
    if (user != 'auto') {
        msgContainerTime.textContent = returnFormatDate(dateTime);
        msgContainer.appendChild(msgContainerTime);
    }

    return msgContainer;
}

var lastMsgUser = '';
export function appendChatMessage(txt, dateTime, user, userName = '') {
    let chatContainer = document.querySelector('.container-chat--body-messages');
    let msgContainer = createChatMessageContainer(txt, dateTime, user, userName);

    if (lastMsgUser != userName && user != 'auto') {
        let msgContainerUserHeader = document.createElement('p');
        let msgContainerUserHeaderPic = document.createElement('img');
        let msgContainerUserHeaderName = document.createElement('span');

        msgContainerUserHeaderName.classList.add('mdc-typography--overline');

        switch (user) {
            case 'me':
                msgContainerUserHeader.classList.add('container-chat--body-header-me');
                msgContainerUserHeaderPic.src = advStreams.myUserInfo.photoURL;
                msgContainerUserHeaderName.textContent = userName;
                break;
            case 'others':
                msgContainerUserHeader.classList.add('container-chat--body-header-others');
                msgContainerUserHeaderPic.src = advStreams.otherUserInfo.photoURL;
                msgContainerUserHeaderName.textContent = userName;
                break;
        }

        msgContainerUserHeader.appendChild(msgContainerUserHeaderPic);
        msgContainerUserHeader.appendChild(msgContainerUserHeaderName);

        chatContainer.appendChild(msgContainerUserHeader);

        lastMsgUser = userName;
    }
    
    chatContainer.appendChild(msgContainer);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

export function sendChatMessage() {
    let dateTime = Date.now();
    let textElement = document.getElementById('chat-textarea-input');
    let textMessage = textElement.value;
    if (textMessage && textMessage.trim() != "") {
        sendPeerChatMessage(
            'msg',
            textMessage,
            dateTime,
            advStreams.myUserInfo.name
        );
        appendChatMessage(textMessage, dateTime, 'me', advStreams.myUserInfo.name);
        textElement.value = '';
        textElement.focus();
    }
}
/* Allow 'window' context to reference the function */
window.sendChatMessage = sendChatMessage;
/* Enable the Enter Key for the Chat Text Area */
if (!isNull(document.querySelector('#chat-textarea-input'))) {
    document.querySelector('#chat-textarea-input').addEventListener('keyup', (evt) => {
        if (evt.keyCode === 13) {
            evt.preventDefault();
            document.querySelector('#chat-textarea-button').click();
        }
    });
}

export function sendPeerChatMessage(type, text, dateTime, userName) {
    if (peer) {
        peer.send(JSON.stringify({
            msgType: type,
            msg: text,
            msgDateTime: dateTime,
            msgUserName: userName
        }));
    }
}
/* Allow 'window' context to reference the function */
window.sendPeerChatMessage = sendPeerChatMessage;

/* Scroll Conversation to bottom on window resize */
const chatResizeObserver = new ResizeObserver(entries => {
    let chatContainer = document.querySelector('.container-chat--body-messages');
    if (chatContainer){
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
});
chatResizeObserver.observe(document.body);


// Audio/Video Call Functions
export const advStreams = {
    myStream: null,
    myStreamSended: false,
    myUserInfo: {name: '', photoURL: ''},
    otherUserInfo: null,
    otherUserStream: null
};
/* Allow 'window' context to reference the function */
window.advStreams = advStreams;

function startUserMedia(av, state) {
    let constraints = null;

    if (av == 'audio') {
        // Only Audio is being requested
        constraints = {
            audio: {
                volume: 1
            },
            video: false
        };
    } else if (av == 'audiovideo') {
        // Audio & Video are being requested
        constraints = {
            audio: {
                volume: 1
            },
            video: {
                facingMode: 'user',
                height: { ideal: 720, max: 1080 },
                width: { ideal: 1280, max: 1920 }
            }
        };
    }

    // Request User Devices
    navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
        managePeerStream('save', stream);
        displayCallUI(state, av);
        sendPeerChatMessage(
            av,
            (state == 'init') ? 'accept' : state,
            Date.now(),
            advStreams.myUserInfo.name
        );
        if (state == 'accepted') {
            managePeerStream('send');
        }
    })
    .catch((err) => {
        console.log(err);
        displayCallUI('ended');
        if (err.name == 'NotAllowedError') {
            initSnackbar(snackbar, failedGetUserMediaSBDataObj);
            snackbar.open();
        } else {
            let errMsgSBDataObj = failedGetUserMediaSBDataObj;
            errMsgSBDataObj.message = err.name;
            initSnackbar(snackbar, errMsgSBDataObj);
            snackbar.open();
        }
        if (state != 'init') {
            sendPeerChatMessage(
                'audiovideo',
                'ended',
                Date.now(),
                advStreams.myUserInfo.name
            );
        }
    });
}

// Snackbar Data for Failed Get User Media Devices
var failedGetUserMediaSBDataObj = {
    message: 'Por favor habilite el acceso a la cámara y/o micrófono.',
    actionText: 'OK',
    timeout: 20000,
    actionHandler: () => {
        console.log('GetUserMedia Devices Failed...');
    }
};

export function displayCallUI(state, av = '') {
    switch (state) {
        case 'accept':
            /************************************************************
             *
             * - Call interface displayed
             * - Accept Call button displayed
             * - Hang Up button displayed
             * - Sound FX Calling Loop
             * 
            *************************************************************/
            document.querySelector('.mdc-fab--hangup').classList.remove('container--hidden');
            if (av == 'audio') {
                document.querySelector('#answer-call').classList.remove('container--hidden');
            } else if (av == 'audiovideo') {
                document.querySelector('#answer-videocall').classList.remove('container--hidden');
            }
            document.querySelector('.container-avcalls').classList.remove('container--hidden');
            document.querySelector('.container-avcalls').classList.add('animate__animated', 'animate__faster', 'animate__fadeIn');
            document.querySelector('.container-chat').classList.add('container--hidden');
            playAudio(document.querySelector('#sound-fx-calling'), true);
            break;

        case 'accepted':
            /************************************************************
             *
             * - Call interface displayed
             * - Hang Up button displayed
             * - Sound FX Connected Once
             * - Sound FX Calling Loop Stop
             * - Show Video UI if Video
             * - Show Mute Button
             * 
            *************************************************************/
            document.querySelector('.mdc-fab--hangup').classList.remove('container--hidden');
            if (av == 'audio') {
                document.querySelector('#answer-call').classList.add('container--hidden');
            } else if (av == 'audiovideo') {
                document.querySelector('#answer-videocall').classList.add('container--hidden');
                document.querySelector('#toggle-video-call').classList.remove('container--hidden');
                document.querySelector('.container-avcalls--callerid').classList.add('container--hidden');
                document.querySelector('.container-avcalls--video-main').classList.remove('container--hidden');
                document.querySelector('.container-avcalls--videos').classList.remove('container--hidden');
                document.querySelector('.container-avcalls--video-small').classList.remove('container--hidden');
            }
            document.querySelector('#mute-mic').classList.remove('container--hidden');
            document.querySelector('.container-avcalls').classList.remove('container--hidden');
            document.querySelector('.container-avcalls').classList.add('animate__animated', 'animate__faster', 'animate__fadeIn');
            document.querySelector('.container-chat').classList.add('container--hidden');
            playAudio(document.querySelector('#sound-fx-calling'), false);
            playAudio(document.querySelector('#sound-fx-connected'), true);
            break;

        case 'ended':
            /************************************************************
             *
             * - Call interface hidden
             * - Hang Up button displayed
             * - Sound FX Ended Once
             * - Sound FX Calling Loop Stop
             * 
            *************************************************************/
            document.querySelector('.mdc-fab--hangup').classList.remove('container--hidden');
            document.querySelector('.mdc-fab--answer').classList.add('container--hidden');
            document.querySelector('.container-avcalls--callerid').classList.remove('container--hidden');
            document.querySelector('.container-avcalls--video-main').classList.add('container--hidden');
            document.querySelector('.container-avcalls--videos').classList.add('container--hidden');
            document.querySelector('.container-avcalls--video-small').classList.add('container--hidden');
            document.querySelector('.container-avcalls').classList.add('container--hidden');
            document.querySelector('.container-avcalls').classList.remove('animate__animated', 'animate__faster', 'animate__fadeIn');
            document.querySelector('.container-chat').classList.remove('container--hidden');
            document.querySelector('#toggle-video-call').classList.add('mdc-fab--active');
            document.querySelector('#toggle-video-call').classList.add('container--hidden');
            document.querySelector('#mute-mic').classList.remove('mdc-fab--active');
            document.querySelector('#mute-mic').classList.add('container--hidden');
            playAudio(document.querySelector('#sound-fx-calling'), false);
            playAudio(document.querySelector('#sound-fx-ended'), true);
            break;

        case 'init':
            /************************************************************
             *
             * - Call interface displayed
             * - Hang Up button displayed
             * - Sound FX Calling Loop
             * 
            *************************************************************/
            document.querySelector('.mdc-fab--hangup').classList.remove('container--hidden');
            document.querySelector('.mdc-fab--answer').classList.add('container--hidden');
            document.querySelector('.container-avcalls').classList.remove('container--hidden');
            document.querySelector('.container-avcalls').classList.add('animate__animated', 'animate__faster', 'animate__fadeIn');
            document.querySelector('.container-chat').classList.add('container--hidden');
            playAudio(document.querySelector('#sound-fx-calling'), true);
            break;
    }
}
/* Allow 'window' context to reference the function */
window.displayCallUI = displayCallUI;

export function initAudioCall() {
    document.getElementById('chat-textarea-input').value = '- Inicio de Audio llamada';
    document.querySelector('#chat-textarea-button').click();
    startUserMedia('audio', 'init');
}
/* Allow 'window' context to reference the function */
window.initAudioCall = initAudioCall;

export function acceptAudioCall() {
    startUserMedia('audio', 'accepted');
}
/* Allow 'window' context to reference the function */
window.acceptAudioCall = acceptAudioCall;

export function initVideoCall() {
    document.getElementById('chat-textarea-input').value = '- Inicio de Video llamada';
    document.querySelector('#chat-textarea-button').click();
    startUserMedia('audiovideo', 'init');
}
/* Allow 'window' context to reference the function */
window.initVideoCall = initVideoCall;

export function acceptVideoCall() {
    startUserMedia('audiovideo', 'accepted');
}
/* Allow 'window' context to reference the function */
window.acceptVideoCall = acceptVideoCall;

export function endAVCall(sendMsg = true) {
    displayCallUI('ended');
    if (sendMsg) {
        sendPeerChatMessage(
            'audiovideo',
            'ended',
            Date.now(),
            advStreams.myUserInfo.name
        );
        document.getElementById('chat-textarea-input').value = '- Fin de llamada';
        document.querySelector('#chat-textarea-button').click();
    }
    managePeerStream('end');
}
/* Allow 'window' context to reference the function */
window.endAVCall = endAVCall;

export function managePeerStream(action, stream = null) {
    if (peer) {
        switch (action) {
            case 'end':
                /* Finalize my Stream and any other Stream */
                if (advStreams.myStream) {
                    advStreams.myStream.getTracks().forEach((track) => {
                        track.stop();
                    });
                }
                if (advStreams.myStreamSended) {
                    peer.removeStream(advStreams.myStream);
                }
                advStreams.myStream = null;
                advStreams.myStreamSended = false;
                advStreams.otherUserStream = null;
                break;
            
            case 'save':
                /* Adds My Stream to advStreams */
                advStreams.myStream = stream;
                break;

            case 'saveRemote':
                /* Adds Remote Stream to advStreams */
                advStreams.otherUserStream = stream;
                break;

            case 'send':
                /* Sends My Stream to Remote */
                if (!isNull(advStreams.myStream)) {
                    peer.addStream(advStreams.myStream);
                    advStreams.myStreamSended = true;
                } else {
                    console.log('SWCMS: No local stream to send.');
                }
                break;
        }
    }
}
/* Allow 'window' context to reference the function */
window.managePeerStream = managePeerStream;

export function setAVStream(otherStream) {
    let videoTracks = otherStream.getVideoTracks();
    if (videoTracks.length > 0) {
        /* The stream is a video stream */
        document.querySelector('.container-avcalls--video-small').srcObject = advStreams.myStream;
        document.querySelector('.container-avcalls--video-small').muted = true;
        document.querySelector('.container-avcalls--video-small').play();
        document.querySelector('.container-avcalls--video-main').srcObject = otherStream;
        document.querySelector('.container-avcalls--video-main').play();
    } else {
        /* The stream is an audio stream */
        document.querySelector('.container-avcalls--audio').srcObject = otherStream;
        document.querySelector('.container-avcalls--audio').play();
    }
    managePeerStream('saveRemote', otherStream);
}
/* Allow 'window' context to reference the function */
window.setAVStream = setAVStream;

export function muteAudio() {
    advStreams.myStream.getAudioTracks().forEach((track) => {
        if (track.enabled) {
            track.enabled = false;
            document.querySelector('#mute-mic').classList.add('mdc-fab--active');
        } else {
            track.enabled = true;
            document.querySelector('#mute-mic').classList.remove('mdc-fab--active');
        }
    });
}
/* Allow 'window' context to reference the function */
window.muteAudio = muteAudio;

export function stopVideo() {
    advStreams.myStream.getVideoTracks().forEach((track) => {
        if (track.enabled) {
            track.enabled = false;
            document.querySelector('#toggle-video-call').classList.remove('mdc-fab--active');
        } else {
            track.enabled = true;
            document.querySelector('#toggle-video-call').classList.add('mdc-fab--active');
        }
    });
}
/* Allow 'window' context to reference the function */
window.stopVideo = stopVideo;


// Show Tabs Content
export function showTabContent(e) {
    var tabId = e.target.id;
    var tabIndex = e.detail.index;
    var tabsContentId = tabId + "-content";
    var tabsContentEl = document.getElementById(tabsContentId);
    Array.from(tabsContentEl.getElementsByClassName('s-article__text')).forEach((elem) => {
        if (elem.tabIndex == tabIndex) {
            elem.classList.remove('s-article__text--hidden');
            elem.classList.add('s-article__text--show');
        } else {
            elem.classList.add('s-article__text--hidden');
            elem.classList.remove('s-article__text--show');
        }
    });
}


// Snackbar init function
export function initSnackbar(sb, initObject) {
    sb.labelText = initObject.message;
    sb.actionButtonText = initObject.actionText;
    sb.setTimeoutMs = initObject.timeout;
    sb.listen('MDCSnackbar:closed', (evt) => {
        if (evt.detail.reason == 'action') {
            initObject.actionHandler();
        }
    });
}


// Social Media Share Redirect
// Applications URLs
const emailShareUrl = "mailto:?body=";
const facebookShareUrl = "https://www.facebook.com/sharer/sharer.php?u=";
const googlePlusShareURL = "https://plus.google.com/share?url=";
const linkedInShareURL = "https://www.linkedin.com/shareArticle?mini=true&url=";
const twitterShareURL = "https://twitter.com/share?ref_src=twsrc%5Etfw&text=";
const whatsAppShareURL = "https://wa.me/?text=";
export function shareRedirect(e) {
    // Default text of the share message
    var shareText = "¡Mira lo que encontré!";
    shareText = encodeURIComponent(shareText);

    // Share parameters
    var shareMyURL = location.href;
    shareMyURL = encodeURIComponent(shareMyURL);

    var shareTitle = document.title;
    shareTitle = encodeURIComponent(shareTitle);

    // Open a new window to share the content
    var shareAppName = e.detail.item.getElementsByClassName('mdc-list-item__text')[0].textContent;
    shareAppName = shareAppName.toLowerCase().trim();

    switch (shareAppName) {
        case 'email':
            window.open(emailShareUrl + shareTitle + " - " + shareMyURL + "&subject=" + shareText + " - " + shareTitle);
            break;
        case 'facebook':
            window.open(facebookShareUrl + shareMyURL);
            break;
        case 'google+':
            window.open(googlePlusShareURL + shareMyURL);
            break;
        case 'linkedin':
            window.open(linkedInShareURL + shareMyURL + "&title=" + shareTitle);
            break;
        case 'twitter':
            window.open(twitterShareURL + shareText + " - " + shareTitle + ": " + shareMyURL);
            break;
        case 'whatsapp':
            window.open(whatsAppShareURL + shareText + " - " + shareTitle + ": " + shareMyURL);
            break;
        default:
            console.log("No implementation for SHARING to app named: " + shareAppName);
    }
}


/************************** LIBRARIES INIT **************************/

// Initialize AOS
// AOS.init();


/************************** MATERIAL DESIGN COMPONENTS INIT **************************/

// Material Drawer & Top App Bar
const drawerEl = document.querySelector('.mdc-drawer');
const topAppBarEl = document.querySelector('.mdc-top-app-bar');
const topAppBarNavEl = document.querySelector('.mdc-top-app-bar__navigation-icon');
if (!isNull(drawerEl) && !isNull(topAppBarEl)) {
    const mainContentEl = document.querySelector('.s-main-content');
    const drawerItemsEl = document.querySelector('.mdc-drawer__content .mdc-list');

    const topAppBar = MDCTopAppBar.attachTo(topAppBarEl);
    topAppBar.setScrollTarget(mainContentEl);

    const initModalDrawer = () => {
        drawerEl.classList.add("mdc-drawer--modal");
        topAppBarNavEl.classList.remove("mdc-top-app-bar__navigation-icon--hidden");

        const drawer = MDCDrawer.attachTo(drawerEl);
        drawer.open = false;

        topAppBar.listen('MDCTopAppBar:nav', () => {
            drawer.open = !drawer.open;
        });

        drawerItemsEl.addEventListener('click', (event) => {
            drawer.open = false;
        });

        return drawer;
    }

    const initPermanentDrawer = () => {
        drawerEl.classList.remove("mdc-drawer--modal");
        topAppBarNavEl.classList.add("mdc-top-app-bar__navigation-icon--hidden");

        const permDrawerList = new MDCList(drawerItemsEl);
        permDrawerList.wrapFocus = true;
        return permDrawerList;
    }

    let drawer = window.matchMedia("(max-width: 52.49em)").matches ?
        initModalDrawer() : initPermanentDrawer();

    // Toggle between permanent drawer and modal drawer at breakpoint 52.49em
    const resizeHandler = () => {
        if (window.matchMedia("(max-width: 52.49em)").matches && drawer instanceof MDCList) {
            drawer.destroy();
            drawer = initModalDrawer();
        } else if (window.matchMedia("(min-width: 52.5em)").matches && drawer instanceof MDCDrawer) {
            drawer.destroy();
            drawer = initPermanentDrawer();
        }
    }

    window.addEventListener('resize', resizeHandler);

    const myURL = location.pathname;

    Array.from(drawerItemsEl.children).forEach((child, index) => {
        let menuURL = child.getAttribute('href');
        if (menuURL != null && menuURL == myURL) {
            child.classList.add("mdc-list-item--activated");
        }
    });
} else if (!isNull(topAppBarEl)) {
    const topAppBar = MDCTopAppBar.attachTo(topAppBarEl);
    const mainContentEl = document.querySelector('.s-main-content');

    topAppBar.setScrollTarget(mainContentEl);
    topAppBarNavEl.classList.add("mdc-top-app-bar__navigation-icon--hidden");
}


// Material Menu
var accountMenu = null;
var accountMenuButton = null;
if (!isNull(document.querySelector('#accountMenu'))) {
    accountMenu = new MDCMenu(document.querySelector('#accountMenu'));
    accountMenuButton = document.querySelector('#accountButton');
}
if (accountMenuButton != null) {
    accountMenuButton.addEventListener('click', () => (accountMenu.open = !accountMenu.open));
    accountMenu.setAnchorCorner(Corner.BOTTOM_START);
    document.querySelector('#accountMenu').addEventListener('MDCMenu:selected', evt => accountRedirect(evt));
}

var moreOptionMenu = null;
var moreOptionMenuButton = null;
if (!isNull(document.querySelector('#moreOptionsMenu'))) {
    moreOptionMenu = new MDCMenu(document.querySelector('#moreOptionsMenu'));
    moreOptionMenuButton = document.querySelector('#moreOptionsButton');
}
if (moreOptionMenuButton != null) {
    moreOptionMenuButton.addEventListener('click', () => (moreOptionMenu.open = !moreOptionMenu.open));
    moreOptionMenu.setAnchorCorner(Corner.BOTTOM_START);
    // document.querySelector('#moreOptionsMenu').addEventListener('MDCMenu:selected', evt => shareRedirect(evt));
}

var shareMenu = null;
var shareMenuButton = null;
if (!isNull(document.querySelector('#shareMenu'))) {
    shareMenu = new MDCMenu(document.querySelector('#shareMenu'));
    shareMenuButton = document.querySelector('#shareButton');
}
if (shareMenuButton != null) {
    shareMenuButton.addEventListener('click', () => (shareMenu.open = !shareMenu.open));
    shareMenu.setAnchorCorner(Corner.BOTTOM_START);
    document.querySelector('#shareMenu').addEventListener('MDCMenu:selected', evt => shareRedirect(evt));
}


// Material Ripple
let mdcButtonRipples = [].map.call(document.querySelectorAll('.mdc-icon-button'), function (el) {
    return new MDCRipple(el);
});
mdcButtonRipples.forEach((elem) => {
    elem.unbounded = true;
});
mdcButtonRipples = mdcButtonRipples.concat([].map.call(document.querySelectorAll('.mdc-button, .mdc-fab'), function (el) {
    return new MDCRipple(el);
}));


// Material Snackbar
const snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));


// Material Tab
var mdcTabBars = [].map.call(document.querySelectorAll('.mdc-tab-bar'), function (el) {
    return new MDCTabBar(el);
});
// document.querySelector('#mdc-tab-bar__id-noticias').addEventListener('MDCTabBar:activated', evt => showTabContent(evt));


// Material Floating Labels
var mdcFloatingLabels = [].map.call(document.querySelectorAll('.mdc-floating-label'), function (el) {
    return new MDCFloatingLabel(el);
});


// Material Line Ripples
var mdcLineRipples = [].map.call(document.querySelectorAll('.mdc-line-ripple'), function (el) {
    return new MDCLineRipple(el);
});


// Material Lists
var mdcLists = [].map.call(document.querySelectorAll('.mdc-list:not(.mdc-menu__items)'), function (el) {
    let elList = new MDCList(el);
    return elList.listElements.map((listItemEl) => new MDCRipple(listItemEl));
});


// Material Notched Ouline
var mdcNotchedOutlines = [].map.call(document.querySelectorAll('.mdc-notched-outline'), function (el) {
    return new MDCNotchedOutline(el);
});

// Material Selects
var mdcSelects = [].map.call(document.querySelectorAll('.mdc-select'), function (el) {
    return new MDCSelect(el);
});


// Material Textfields
var mdcTextInputs = [].map.call(document.querySelectorAll('.mdc-text-field'), function (el) {
    return new MDCTextField(el);
});


// Material Textfields Helper Text
var mdcTFHelperTexts = [].map.call(document.querySelectorAll('.mdc-text-field-helper-text'), function (el) {
    return new MDCTextFieldHelperText(el);
});


// Material Textfields
var mdcTextInputsIcons = [].map.call(document.querySelectorAll('.mdc-text-field-icon'), function (el) {
    return new MDCTextFieldIcon(el);
});


// Material Button Element Actions On Click
document.querySelectorAll('.mdc-button[data-action-type], .mdc-icon-button[data-action-type], .mdc-fab[data-action-type]').forEach(buttonEl => {
    let actionType = buttonEl.getAttribute('data-action-type');
    if (actionType == 'redirect') {
        let actionVal = buttonEl.getAttribute('data-action-val');
        buttonEl.addEventListener('click', () => (window.location.href = actionVal));
    } else if (actionType == 'submit') {
        let actionFn = buttonEl.getAttribute('data-action-fn');
        let fn = (typeof actionFn == "string") ? window[actionFn] : actionFn;
        buttonEl.addEventListener('click', fn);
    }
});


// Google Maps component
if (!isNull(document.querySelector('.s-googlemaps'))) {
    var gmComp = document.querySelector('.s-googlemaps');
    var gmURLL = 'https://www.google.com/maps?output=embed&daddr=ciudad+mujer&saddr=';
    var gmIfrS = "<iframe src='";
    var gmIfrE = "' class='s-googlemaps__iframe' frameborder='0' style='border:0;' allowfullscreen></iframe>";
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            gmComp.innerHTML = "";
            gmComp.innerHTML = gmIfrS + gmURLL + pos.lat + ',' + pos.lng + gmIfrE;
        }, () => {
            console.log('User denied access to location');
        });
    } else {
        // Browser doesn't support Geolocation
        console.log('Your browser does not support Geolocation');
    }
}


/************************** PWA SERVICE WORKER INIT **************************/

// Registering the service worker for the pwa
// NOTE
// Even though this service worker is not on the root of this web application
// It has been configured, through swing_main.py to make it look like it is.

if ('serviceWorker' in navigator) {
    const wb = new Workbox('/sw.js', { scope: '/' });
    // Detects an update for the app's content and prompts user to refresh
    wb.addEventListener('installed', event => {
        if (event.isUpdate) {
            console.log('App update found...');
            initSnackbar(snackbar, updateSBDataObj);
            snackbar.open();
        }
    });
    // Registers the Workbox Service Worker
    wb.register();
}


// Add to Homescreen (A2H) Event
let deferredPrompt;
var appIsInstalled = false;

// Snackbar A2H Data for Install Event
var installSBDataObj = {
    message: '¿Deseas Instalar nuestra App? (¡Gratis!)',
    actionText: 'Si',
    timeout: 20000,
    actionHandler: () => {
        console.log('Installing app (A2H)...');
        // Show the prompt
        deferredPrompt.prompt();
        // Wait for the user action
        deferredPrompt.userChoice
            .then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the A2H prompt');
                    appIsInstalled = true;
                } else {
                    console.log('User dismissed the A2H prompt');
                }
                deferredPrompt = null;
            });
    }
};


// Snackbar Data for Update Website Event
var updateSBDataObj = {
    message: '¡Nuevo contenido disponible!. Click OK para actualizar.',
    actionText: 'OK',
    timeout: 20000,
    actionHandler: () => {
        console.log('Updating app...');
        // Refresh the app
        window.location.reload();
    }
};


window.addEventListener('appinstalled', (evt) => {
    console.log('App is installed...');
    appIsInstalled = true;
});


window.addEventListener('beforeinstallprompt', (e) => {
    console.log('Prompting to install app...');
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Show the Snackbar popup to Install
    if (!appIsInstalled) {
        initSnackbar(snackbar, installSBDataObj);
        snackbar.open();
    }
});

