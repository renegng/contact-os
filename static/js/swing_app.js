// import AOS from 'aos';
import 'core-js';
import 'regenerator-runtime/runtime';
import { MDCDrawer } from "@material/drawer";
import { MDCFloatingLabel } from '@material/floating-label';
import { MDCIconButtonToggle } from '@material/icon-button';
import { MDCLineRipple } from '@material/line-ripple';
import { MDCList } from "@material/list";
import { MDCMenu, Corner } from '@material/menu';
import { MDCNotchedOutline } from '@material/notched-outline';
import { MDCRipple } from '@material/ripple';
import { MDCSnackbar } from '@material/snackbar';
import { MDCTab } from '@material/tab';
import { MDCTabBar } from '@material/tab-bar';
import { MDCTabIndicator } from '@material/tab-indicator';
import { MDCTabScroller } from '@material/tab-scroller';
import { MDCTextField } from '@material/textfield';
import { MDCTextFieldHelperText } from '@material/textfield/helper-text';
import { MDCTopAppBar } from '@material/top-app-bar';
import { Workbox } from 'workbox-window/Workbox.mjs';
import { isNull } from 'util';

// Initialize AOS
// AOS.init();

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

    let drawer = window.matchMedia("(max-width: 56.24em)").matches ?
        initModalDrawer() : initPermanentDrawer();

    // Toggle between permanent drawer and modal drawer at breakpoint 50em
    const resizeHandler = () => {
        if (window.matchMedia("(max-width: 56.24em)").matches && drawer instanceof MDCList) {
            drawer.destroy();
            drawer = initModalDrawer();
        } else if (window.matchMedia("(min-width: 56.25em)").matches && drawer instanceof MDCDrawer) {
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
}

// Material Menu
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
var mdcTab = null;
var mdcTabBar = null;
var mdcTabIndicator = null;
var mdcTabScroller = null;
if (!isNull(document.querySelector('.mdc-tab-bar'))) {
    mdcTab = new MDCTab(document.querySelector('.mdc-tab'));
    mdcTabBar = new MDCTabBar(document.querySelector('.mdc-tab-bar'));
    mdcTabIndicator = new MDCTabIndicator(document.querySelector('.mdc-tab-indicator'));
    mdcTabScroller = new MDCTabScroller(document.querySelector('.mdc-tab-scroller'));
    document.querySelector('#mdc-tab-bar__id-noticias').addEventListener('MDCTabBar:activated', evt => showTabContent(evt));
}

// Material Floating Labels
var mdcFloatingLabels = [].map.call(document.querySelectorAll('.mdc-floating-label'), function (el) {
    return new MDCFloatingLabel(el);
});

// Material Line Ripples
var mdcLineRipples = [].map.call(document.querySelectorAll('.mdc-line-ripple'), function (el) {
    return new MDCLineRipple(el);
});

// Material Notched Ouline
var mdcNotchedOutlines = [].map.call(document.querySelectorAll('.mdc-notched-outline'), function (el) {
    return new MDCNotchedOutline(el);
});

// Material Textfields
var mdcTextInputs = [].map.call(document.querySelectorAll('.mdc-text-field'), function (el) {
    return new MDCTextField(el);
});

// Material Textfields Helper Text
var mdcTFHelperTexts = [].map.call(document.querySelectorAll('.mdc-text-field-helper-text'), function (el) {
    return new MDCTextFieldHelperText(el);
});

// Social Media Share Redirect
// Applications URLs
const emailShareUrl = "mailto:?body=";
const facebookShareUrl = "https://www.facebook.com/sharer/sharer.php?u=";
const googlePlusShareURL = "https://plus.google.com/share?url=";
const linkedInShareURL = "https://www.linkedin.com/shareArticle?mini=true&url=";
const twitterShareURL = "https://twitter.com/share?ref_src=twsrc%5Etfw&text=";
const whatsAppShareURL = "https://wa.me/?text=";

function shareRedirect(e) {
    // Default text of the share message
    var shareText = "¡Mira lo que encontré!";
    shareText = encodeURIComponent(shareText);

    // Share parameters
    var shareMyURL = location.href;
    shareMyURL = encodeURIComponent(shareMyURL);

    var shareTitle = document.title;
    shareTitle = encodeURIComponent(shareTitle);

    // Open a new window to share the content
    var shareAppName = e.detail.item.lastChild.textContent;
    shareAppName = shareAppName.toLowerCase().trim();

    switch (shareAppName) {
        case 'email':
            window.location.href(emailShareUrl + shareTitle + " - " + shareMyURL + "&subject=" + shareText + " - " + shareTitle);
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

// Show Tabs Content
function showTabContent(e) {
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

// Audio playback
var audio = null;
var playAudioButton = null;
var playAudioButtonIconToggle = null;
if (!isNull(document.querySelector('.fab__playbutton'))) {
    playAudioButton = document.querySelector('.fab__playbutton');
    playAudioButtonIconToggle = new MDCIconButtonToggle(document.querySelector('.fab__playbutton'));
    playAudioButton.addEventListener('MDCIconButtonToggle:change', ({ detail }) => playAudio(detail));

    // Autoplay audio
    audio = document.getElementById('cmsv-vr-audio');
    audio.oncanplaythrough = () => { playAudioButton.click() };
}

function playAudio(detail) {
    if (detail.isOn) {
        audio.play();
    } else {
        audio.pause();
    }
    audio.onended = () => { playAudioButton.click() };
}

// Landing Page Image Carousel
var landPageImgCarCont = null;
if (!isNull(document.querySelector('#landing-img-carousel'))) {
    landPageImgCarCont = document.querySelector('#landing-img-carousel');
    setInterval(() => {
        landingPageImgCarousel(landPageImgCarCont);
    }, 7500);
}

var lpic = 1;
function landingPageImgCarousel(container) {
    var backgroundImgs = [];
    container.classList.remove('img-transition-fadein');
    // Forces re-orientation of the container, which forces re-animation
    void container.offsetWidth;

    container.style.backgroundImage = 'url("' + backgroundImgs[Math.floor(lpic % backgroundImgs.length)] + '")';
    container.classList.add('img-transition-fadein');
    lpic++;
}

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

// FAQ Material List behaviour
if (!isNull(document.querySelector('.mdc-list-item__collapse'))) {
    Array.from(document.getElementsByClassName('mdc-list-item__collapse')).forEach((elem) => {
        elem.addEventListener('click', () => {
            var secondaryTxt = elem.querySelector('.mdc-list-item__secondary-text');
            var collapseIcon = elem.querySelector('.mdc-list-item__meta');

            if (secondaryTxt.classList.contains('mdc-list-item__faq-answer-hide')) {
                secondaryTxt.classList.remove('mdc-list-item__faq-answer-hide');
                secondaryTxt.classList.add('mdc-list-item__faq-answer-show');
                collapseIcon.dispatchEvent(new Event('click'));
            } else {
                secondaryTxt.classList.remove('mdc-list-item__faq-answer-show');
                secondaryTxt.classList.add('mdc-list-item__faq-answer-hide');
                collapseIcon.dispatchEvent(new Event('click'));
            }
        });
    });
}

// Login Button
var loginButton = null;
if (!isNull(document.querySelector('#loginButton'))) {
    loginButton = document.querySelector('#loginButton');
}
if (loginButton != null) {
    loginButton.addEventListener('click', () => (window.location.href = '/login'));
}

// Read More Button
if (!isNull(document.querySelector('.mdc-card__action--button'))) {
    Array.from(document.getElementsByClassName('mdc-card__action--button')).forEach((elem) => {
        elem.addEventListener('click', () => {
            var elemId = elem.id;
            var readMoreButtonText = elem.querySelector('.mdc-button__label');
            var readMoreContent = document.getElementById('RMC-' + elemId);

            if (readMoreContent.classList.contains('s-mdc-card__body--hidden')) {
                readMoreContent.classList.remove('s-mdc-card__body--hidden');
                readMoreButtonText.innerHTML = "Leer menos...";
            } else {
                readMoreContent.classList.add('s-mdc-card__body--hidden');
                readMoreButtonText.innerHTML = "Leer más...";
            }
        });
    });
}

// Image List Open Image
if (!isNull(document.querySelector('.s-mdc-image-list__image'))) {
    Array.from(document.getElementsByClassName('s-mdc-image-list__image')).forEach((elem) => {
        elem.addEventListener('click', () => (window.open(elem.getAttribute('src'))));
    });
}

// Snackbar init function
function initSnackbar(sb, initObject) {
    sb.labelText = initObject.message;
    sb.actionButtonText = initObject.actionText;
    sb.setTimeoutMs = initObject.timeout;
    sb.listen('MDCSnackbar:closed', (evt) => {
        if (evt.detail.reason == 'action') {
            initObject.actionHandler();
        }
    });
}

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

