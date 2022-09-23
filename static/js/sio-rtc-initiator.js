/************************** SOCKETIO-WEBRTC INITIATOR **************************/
import 'core-js';
import 'regenerator-runtime/runtime';
import * as localForage from "localforage";
import { io } from "socket.io-client";
import { SimplePeer } from "simple-peer";
import { advStreams, postFetch } from './swing_app';


/************************** ON PAGE LOAD **************************/

// Initiate SocketIO Connection
window.addEventListener('load', () => {
    console.log('Initializing SocketIO/SimplePeer');

    const socket = io({
        query: 'photoURL=' + encodeURIComponent(advStreams.myUserInfo.photoURL)
    });
});
