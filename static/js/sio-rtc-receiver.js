/************************** SOCKETIO-WEBRTC RECEIVER **************************/
import 'core-js';
import 'regenerator-runtime/runtime';
import console from 'dev-console.macro';
import * as localForage from "localforage";
import { advStreams, postFetch } from './swing_app';
import { enc } from 'crypto-js';
import { decrypt, encrypt } from 'crypto-js/aes';
import { SimplePeer } from "simple-peer";
import { io } from "socket.io-client";


/************************** FUNCTIONS AND VARIABLES **************************/

// Instance of Local Storage to retrieve Chat information
const chStore = localForage.createInstance({
    name: 'swingcms-ch'
});

// Instance of Local Storage to retrieve User Firebase Info 
const usrStore = localForage.createInstance({
    name: 'swingcms-usr'
});

// SocketIO Query
const sioQuery = {
    // Chat ID
    c_id: '',
    // Photo URL
    p_url: '',
    // Room ID
    r_id: ''
};

// Instance of SocketIO
export const socket = io({
    autoConnect: false,
    query: sioQuery
});

// Initialize SocketIO WebRTC Connection
export function initializeSIORTC(usrInfoJSON) {
    // Retrieve or Create Chat Information
    chStore.getItem('chInfo').then((val) => {
        // If no Chat info is found, create the base JSON
        if (!val) {
            let chInfo = {
                // Chat ID
                'c_id': '',
                // Messages
                'm_ses': '',
                // Messages pending to be sent
                'm_pnd': '',
                // Room ID
                'r_id': '',
                // Has Room ID been updated to new value?
                'r_upd': false
            };
            // Store Chat info
            chStore.setItem('chInfo', JSON.stringify(chInfo)).then((val) => {
                console.log('Chat Info Created: ' + val);
            });
        // If Chat info is found, update SocketIO Query info
        } else {
            let chInfo = JSON.parse(val);
            sioQuery['c_id'] = chInfo['c_id'];
            sioQuery['r_id'] = chInfo['r_id'];
        }

        // Update SocketIO Query
        sioQuery['p_url'] = encodeURIComponent(usrInfoJSON['p_url']);
    });

    // Update SocketIO Query Option
    socket.io.opts.query = sioQuery;

    // Start SocketIO Connection
    socket.connect();
}

/************************** ON PAGE LOAD **************************/

// Initiate SocketIO Connection
window.addEventListener('load', () => {
    // Retrieve User Firebase Info
    usrStore.getItem('usrInfo').then((val) => {
        // If User Firebase Info found, start SocketIO WebRTC Connection
        if (val) {
            console.log('ONLOAD: Initializing SocketIO/SimplePeer');
            initializeSIORTC(JSON.parse(val));
        }
    });
});
