/************************** EMPLOYEE APPOINTMENTS **************************/
import * as cscApiKey from '../../instance/js/swing_countrycitystate-api-key.json';
import { MDCMenu, Corner } from '@material/menu';


/************************** FUNCTIONS **************************/

export const appCountry = 'SV';
export var statesData, citiesData = null;

// MDC Assigned Components to Variables
// This is done to reference specific MDC instantiated elements, their properties and functions
export const mdcAssignedVars = {};

// Get Cities
export function getCities(selState) {
    let apiUrl = `https://api.countrystatecity.in/v1/countries/${appCountry}/states/${selState}/cities`;
    let headers = new Headers();
    let requestOptions = {
        method: 'GET',
        headers: headers,
        redirect: 'follow'
    };
    headers.append("X-CSCAPI-KEY", cscApiKey.apiKey);
    swcms.getFetch(apiUrl, 'loadCities', requestOptions);
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

// Load User Information
export function loadUserInfo(evt, uType) {
    let usrName = evt.detail.item.querySelector('.mdc-list-item__primary-text').textContent;
    let usrEmail = evt.detail.item.querySelector('.mdc-list-item__secondary-text').textContent;

    if (uType == 'usr') {
        let usrCont = document.querySelector('.container-appointmentadm-user--record-info');

        usrCont.querySelector('.mdc-typography--caption').textContent = usrName;
        usrCont.querySelector('.mdc-typography--subtitle2').textContent = usrEmail;
        usrCont.classList.remove('container--hidden');

        document.querySelector('.container-appointment-confirm--user').textContent = usrName;
    } else {
        let empCont = document.querySelector('.container-appointmentadm-emp--record-info');

        empCont.querySelector('.mdc-typography--caption').textContent = usrName;
        empCont.querySelector('.mdc-typography--subtitle2').textContent = usrEmail;
        empCont.classList.remove('container--hidden');

        document.querySelector('.container-appointment-confirm--emp').textContent = usrName;
    }
}
/* Allow 'window' context to reference the function */
window.loadUserInfo = loadUserInfo;

// Select Appointment Service
export function selectAppointmentService(value) {
    let serviceConfirmEl = document.querySelector('.container-appointment-confirm--service');
    let serviceName = document.querySelector('#f-appointment-service-select > li[data-value="' + value + '"]');
    serviceConfirmEl.textContent = serviceName.textContent;
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
var searchResultsUsers = new MDCMenu(document.querySelector('#searchUsersMenu'));
searchResultsUsers.setAnchorCorner(Corner.BOTTOM_START);
document.getElementById('f-appointment-ufilter-input').addEventListener('click', () => (searchResultsUsers.open = !searchResultsUsers.open));
document.querySelector('#searchUsersMenu').addEventListener('MDCMenu:selected', (evt) => { loadUserInfo(evt, 'usr') });

var searchResultsEmployees = new MDCMenu(document.querySelector('#searchEmployeesMenu'));
searchResultsEmployees.setAnchorCorner(Corner.BOTTOM_START);
document.getElementById('f-appointment-efilter-input').addEventListener('click', () => (searchResultsEmployees.open = !searchResultsEmployees.open));
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
