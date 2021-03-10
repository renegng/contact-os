/************************** EMPLOYEE APPOINTMENTS **************************/
import * as cscApiKey from '../../instance/js/swing_countrycitystate-api-key.json';
import { MDCMenu, Corner } from '@material/menu';


/************************** FUNCTIONS **************************/

export const appCountry = 'SV';
export var jsonUserDetails, citiesData, statesData = null;

// MDC Assigned Components to Variables
// This is done to reference specific MDC instantiated elements, their properties and functions
export const mdcAssignedVars = {};

// Create User Result List Element Container
function createUserResultContainer(user = null) {
    let userContainer = document.createElement('li');
    let userEmail = document.createElement('span');
    let userName = document.createElement('span');
    let rippleEl = document.createElement('span');
    let userTxtC = document.createElement('span');
    let userIcon = document.createElement('i');

    userContainer.classList.add('mdc-list-item');
    rippleEl.classList.add('mdc-list-item__ripple');
    userIcon.classList.add('material-icons', 'mdc-list-item__graphic');
    userTxtC.classList.add('mdc-list-item__text');
    userName.classList.add('mdc-list-item__primary-text')
    userEmail.classList.add('mdc-list-item__secondary-text');

    userIcon.setAttribute('aria-hidden', 'true');
    userContainer.setAttribute('role', 'menuitem');
    userContainer.setAttribute('tabindex', '0');

    if (user) {
        userContainer.setAttribute('data-value', user.u_id);
        userName.textContent = user.u_name;
        userIcon.textContent = 'person';
        userEmail.textContent = user.u_email;
    } else {
        userContainer.setAttribute('data-value', -1);
        userName.textContent = '0 Resultados';
        userIcon.textContent = 'search_off';
        userEmail.textContent = 'No se encontraron registros';
    }

    userTxtC.appendChild(userName);
    userTxtC.appendChild(userEmail);
    userContainer.appendChild(rippleEl);
    userContainer.appendChild(userIcon);
    userContainer.appendChild(userTxtC);

    return userContainer;
}

// Get Cities
var setUserCity = null;
export function getCities(selState) {
    if (selState) {
        let apiUrl = `https://api.countrystatecity.in/v1/countries/${appCountry}/states/${selState}/cities`;
        let headers = new Headers();
        let requestOptions = {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
        };
        headers.append("X-CSCAPI-KEY", cscApiKey.apiKey);
        swcms.getFetch(apiUrl, 'loadCities', requestOptions).then((response) => {
            // If User Detail is being loaded
            if (setUserCity) {
                let citiesElms = document.querySelectorAll('#f-appointment-city-select > li');

                citiesElms.forEach((city, index) => {
                    if (city.getAttribute('data-value') == setUserCity.id) {
                        mdcAssignedVars['mdcCitiesSelect'].selectedIndex = index;
                    }
                });

                setUserCity = null;
            }
        });
    }
}
/* Allow 'window' context to reference the function */
window.getCities = getCities;

// Get States
export function getStates() {
    let apiUrl = `https://api.countrystatecity.in/v1/countries/${appCountry}/states`;
    let headers = new Headers();
    let requestOptions = {
        method: 'GET',
        headers: headers,
        redirect: 'follow'
    };
    headers.append("X-CSCAPI-KEY", cscApiKey.apiKey);
    swcms.getFetch(apiUrl, 'loadDepartments', requestOptions);
}
/* Allow 'window' context to reference the function */
window.getStates = getStates;

// Get Users Results
export function getUsers(uType, timer) {
    let txtEl = (uType == 'usr')? document.getElementById('f-appointment-ufilter-input') : document.getElementById('f-appointment-efilter-input');
    let txtIn = txtEl.value.trim();
    
    if (txtIn.length > 1) {
        let query = encodeURIComponent(txtIn);
        let ft = (uType == 'usr')? '' : 'sur';
        let apiUrl = `/api/list/users/?ft=${ft}&flt=${uType}&qry=${query}`;

        swcms.getFetch(apiUrl, 'loadUsersResults');
    } else {
        if (uType == 'usr') {
            searchResultsUsers.open = false;
        } else {
            searchResultsEmployees.open = false;
        }
    }
    window.clearTimeout(timer);
    timer = null;
}
/* Allow 'window' context to reference the function */
window.getUsers = getUsers;

// Load Cities
export function loadCities(data) {
    let citListEl = document.querySelector('#f-appointment-city-select');
    let sortedData = data.sort((a, b) => a.name < b.name ? -1 : 1);

    mdcAssignedVars['mdcCitiesSelect'].selectedIndex = -1;
    citListEl.innerHTML = '';

    sortedData.forEach((cit) => {
        let citContainer = document.createElement('li');
        let citName = document.createElement('span');

        citContainer.classList.add('mdc-list-item');
        citName.classList.add('mdc-list-item__text');

        citName.textContent = cit.name;
        citContainer.setAttribute('data-value', cit.id);

        citContainer.appendChild(citName);
        citListEl.appendChild(citContainer);
    });
    citiesData = data;
}
/* Allow 'window' context to reference the function */
window.loadCities = loadCities;

// Load Departments
export function loadDepartments(data) {
    let depListEl = document.querySelector('#f-appointment-department-select');
    let sortedData = data.sort((a, b) => a.name < b.name ? -1 : 1);

    sortedData.forEach((dep) => {
        let depContainer = document.createElement('li');
        let depName = document.createElement('span');

        depContainer.classList.add('mdc-list-item');
        depName.classList.add('mdc-list-item__text');

        depName.textContent = dep.name.replace(' Department', '');
        depContainer.setAttribute('data-value', dep.iso2);

        depContainer.appendChild(depName);
        depListEl.appendChild(depContainer);
    });
    statesData = data;
}
/* Allow 'window' context to reference the function */
window.loadDepartments = loadDepartments;

// Load User Details
export function loadUserDetails(data) {
    Object.entries(data).forEach(([key, val]) => {
        console.log(`Key: ${key}, Value: ${val}`);
        switch (key) {
            case 'country':
            case 'enabled':
            case 'email':
            case 'id':
            case 'roles':
            case 'status':
                break;
            
            case 'city':
                mdcAssignedVars['mdcCitiesSelect'].selectedIndex = -1;
                break;
            
            case 'state':
                mdcAssignedVars['mdcStatesSelect'].selectedIndex = -1;
                break;
            
            default:
                let inputEl = document.getElementsByName('u.' + key);
                if (inputEl) inputEl.value = (val)? val : '';
                break;
        }
    });
    if (data.state) {
        let statesElms = document.querySelectorAll('#f-appointment-department-select > li');
        // Validate that State exists in the Dropdown
        if (!statesElms){
            getStates().then((response) => {
                loadUserDetailsLocation(data.state, data.city);
            });
        } else {
            loadUserDetailsLocation(data.state, data.city);
        }
    }
    jsonUserDetails = data;
}
/* Allow 'window' context to reference the function */
window.loadUserDetails = loadUserDetails;

function loadUserDetailsLocation(uState, uCity) {
    let statesElms = document.querySelectorAll('#f-appointment-department-select > li');

    statesElms.forEach((state, index) => {
        if (state.getAttribute('data-value') == uState.iso2) {
            setUserCity = uCity;
            mdcAssignedVars['mdcStatesSelect'].selectedIndex = index;
        }
    });
}

// Load User Information
export function loadUserInfo(evt, uType) {
    let usrId = evt.detail.item.getAttribute('data-value');
    
    // Verify if it's a valid User Record
    if (usrId != -1) {
        let usrName = evt.detail.item.querySelector('.mdc-list-item__primary-text').textContent;
        let usrEmail = evt.detail.item.querySelector('.mdc-list-item__secondary-text').textContent;
    
        if (uType == 'usr') {
            let apiUrl = `/api/detail/user/${usrId}/`;
            let usrCont = document.querySelector('.container-appointmentadm-user--record-info');
    
            usrCont.querySelector('.mdc-typography--caption').textContent = usrName;
            usrCont.querySelector('.mdc-typography--subtitle2').textContent = usrEmail;
            usrCont.classList.remove('container--hidden');
    
            document.querySelector('.container-appointment-confirm--user').textContent = usrName;
            document.getElementById('f-appointment-ufilter-input').value = usrName;
            document.getElementById('app_usr_id').value = usrId;

            swcms.getFetch(apiUrl, 'loadUserDetails');
        } else {
            let empCont = document.querySelector('.container-appointmentadm-emp--record-info');
    
            empCont.querySelector('.mdc-typography--caption').textContent = usrName;
            empCont.querySelector('.mdc-typography--subtitle2').textContent = usrEmail;
            empCont.classList.remove('container--hidden');
    
            document.querySelector('.container-appointment-confirm--emp').textContent = usrName;
            document.getElementById('f-appointment-efilter-input').value = usrName;
            document.getElementById('app_emp_id').value = usrId;
        }
    }
}
/* Allow 'window' context to reference the function */
window.loadUserInfo = loadUserInfo;

// Load Users Results
export function loadUsersResults(data) {
    let uType = data.r_filter;
    let userListMenu = (uType == 'usr')? document.querySelector('#searchUsersMenu > ul') : document.querySelector('#searchEmployeesMenu > ul');
    userListMenu.innerHTML = '';

    if (data.r_total > 0) {
        data.records.forEach((user) => {
            userListMenu.appendChild(createUserResultContainer(user));
        });

        (uType == 'usr')? searchResultsUsers.open = true : searchResultsEmployees.open = true;
    } else {
        userListMenu.appendChild(createUserResultContainer());

        (uType == 'usr')? searchResultsUsers.open = true : searchResultsEmployees.open = true;
    }
}
/* Allow 'window' context to reference the function */
window.loadUsersResults = loadUsersResults;

// Select Appointment Service
export function selectAppointmentService(value) {
    let svcIdEl = document.getElementById('app_svc_id');
    let svcConfirmEl = document.querySelector('.container-appointment-confirm--service');
    let svcName = document.querySelector('#f-appointment-service-select > li[data-value="' + value + '"]');
    svcConfirmEl.textContent = svcName.textContent;
    svcIdEl.value = value;
}
/* Allow 'window' context to reference the function */
window.selectAppointmentService = selectAppointmentService;

// Select Appointmemt Time
export function selectAppointmentTime(elm) {
    let curSelected = document.querySelector('.mdc-card--selected');
    let timeConfirmEl = document.querySelector('.container-appointment-confirm--time');
    let timeSelectedEl = elm.querySelector('.container-appointment-hours--time').textContent;

    if (curSelected) {
        curSelected.classList.remove('mdc-card--selected');
        curSelected.querySelector('.container-appointment-hours--time').classList.remove('s-font-color-primary');
        curSelected.querySelector('.container-appointment-hours--time').classList.add('s-font-color-secondary');
    }
    
    elm.classList.add('mdc-card--selected');
    elm.querySelector('.container-appointment-hours--time').classList.remove('s-font-color-secondary');
    elm.querySelector('.container-appointment-hours--time').classList.add('s-font-color-primary');

    timeConfirmEl.textContent = timeSelectedEl;
}
/* Allow 'window' context to reference the function */
window.selectAppointmentTime = selectAppointmentTime;

// Set Current Selected Date on Hours Cards
export function setSelectedDateOnUI(date) {
    let formatDate = swcms.returnFormatDate(date, 'date');
    let curSelected = document.querySelector('.mdc-card--selected');

    if (curSelected) {
        let timeConfirmEl = document.querySelector('.container-appointment-confirm--time');

        curSelected.classList.remove('mdc-card--selected');
        curSelected.querySelector('.container-appointment-hours--time').classList.remove('s-font-color-primary');
        curSelected.querySelector('.container-appointment-hours--time').classList.add('s-font-color-secondary');

        timeConfirmEl.textContent = '';
    }

    document.querySelector('.container-appointment-confirm--date').textContent = formatDate;
    document.querySelector('#appointment-hours').querySelectorAll('.container-appointment-hours--date').forEach((el) => {
        el.textContent = formatDate;
    });
}


/************************** MATERIAL DESIGN COMPONENTS INIT **************************/

// Material Menu
var isTypingUsrsTimeout = null;
var searchResultsUsers = new MDCMenu(document.querySelector('#searchUsersMenu'));
searchResultsUsers.setAnchorCorner(Corner.BOTTOM_START);
document.getElementById('f-appointment-ufilter-input').addEventListener('keyup', (evt) => {
    if (evt.key === 'Enter') {
        evt.preventDefault();
    }
    if (evt.key !== 'Shift' && evt.key !== 'Alt' && evt.key !== 'Control' && evt.key !== 'Meta') {
        if (isTypingUsrsTimeout !== null) {
            window.clearTimeout(isTypingUsrsTimeout);
            isTypingUsrsTimeout = window.setTimeout(() => {getUsers('usr', isTypingUsrsTimeout)}, 333);
        } else if (isTypingUsrsTimeout === null) {
            isTypingUsrsTimeout = window.setTimeout(() => {getUsers('usr', isTypingUsrsTimeout)}, 333);
        }
    }
});
document.querySelector('#searchUsersMenu').addEventListener('MDCMenu:selected', (evt) => { loadUserInfo(evt, 'usr') });

var isTypingEmpsTimeout = null;
var searchResultsEmployees = new MDCMenu(document.querySelector('#searchEmployeesMenu'));
searchResultsEmployees.setAnchorCorner(Corner.BOTTOM_START);
document.getElementById('f-appointment-efilter-input').addEventListener('keyup', (evt) => {
    if (evt.key === 'Enter') {
        evt.preventDefault();
    }
    if (evt.key !== 'Shift' && evt.key !== 'Alt' && evt.key !== 'Control' && evt.key !== 'Meta') {
        let uType = document.getElementById('app_svc_id').value;
        if (uType) {
            if (isTypingEmpsTimeout !== null) {
                window.clearTimeout(isTypingEmpsTimeout);
                isTypingEmpsTimeout = window.setTimeout(() => {getUsers(uType, isTypingEmpsTimeout)}, 333);
            } else if (isTypingEmpsTimeout === null) {
                isTypingEmpsTimeout = window.setTimeout(() => {getUsers(uType, isTypingEmpsTimeout)}, 333);
            }
        }
    }
});
document.querySelector('#searchEmployeesMenu').addEventListener('MDCMenu:selected', (evt) => { loadUserInfo(evt, 'emp') });


/************************** ON PAGE LOAD **************************/

var appCal;
// Get jsCalendar instance
window.addEventListener('load', () => {
    appCal = jsCalendar.get('#appointment-cal');
    
    // Calendar configuration
    // Minimum date to allow is Today
    let minDate = new Date();
    minDate.setDate(minDate.getDate() - 1);
    appCal.min(minDate);

    // Maximum date to allow is Two Months from now
    let maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2);
    appCal.max(maxDate);
    
    // Click on date behavior
    appCal.onDateClick((event, date) => {
        appCal.set(date);
        setSelectedDateOnUI(date);
    });

    // Make changes on the date elements
	appCal.onDateRender((date, element, info) => {
        // Color weekends days red
        if (!info.isCurrent && (date.getDay() == 0 || date.getDay() == 6)) {
            element.classList.add((info.isCurrentMonth) ? 'jsCalendar-date-weekend-currentmonth' : 'jsCalendar-date-weekend-othermonth');
        }
        // Color days before and after MinDate and MaxDate grey
        if (date < minDate || date > maxDate) {
            element.classList.add('jsCalendar-date-unavailable');
            element.classList.remove('jsCalendar-date-weekend-currentmonth', 'jsCalendar-date-weekend-othermonth');
        }
        // Color days between Monday and Friday as green
        if (date.getDay() > 0 && date.getDay() < 6 && date > minDate && date < maxDate && info.isCurrentMonth) {
            if (info.isCurrent) {
                element.classList.remove('jsCalendar-date-available');
            } else {
                element.classList.add('jsCalendar-date-available');
            }
        }
        // Display the current date on the hours cards
        if (info.isCurrent) {
            setSelectedDateOnUI(date);
        }
    });

	// Refresh Calendar layout
    appCal.refresh();

    // Load States
    getStates();

    // Store MDC Elements to Assigned Variables Object
    swcms.mdcSelects.forEach((sel) => {
        if (sel.assignedVar)
            mdcAssignedVars[sel.assignedVar] = sel;
    });
});
