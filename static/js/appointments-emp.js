/************************** EMPLOYEE APPOINTMENTS **************************/
import * as cscApiKey from '../../instance/js/swing_countrycitystate-api-key.json';


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

    mdcAssignedVars['mdcCitiesSelect'].selectedIndex = -1;
    citListEl.innerHTML = '';

    data.forEach((cit) => {
        let citContainer = document.createElement('li');
        let citName = document.createElement('span');

        citContainer.classList.add('mdc-list-item');
        citName.classList.add('mdc-list-item__text');

        citName.textContent = cit.name;
        citContainer.setAttribute('data-value', cit.iso2);

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

    data.forEach((dep) => {
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

// Select Appointment Service
export function selectAppointmentService(value) {
    let serviceConfirmEl = document.querySelector('.container-appointment-confirm--service');
    let serviceName = document.querySelector('#f-appointment-service-select > li[data-value="' + value + '"]');
    serviceConfirmEl.textContent = serviceName.textContent;
}
/* Allow 'window' context to reference the function */
window.selectAppointmentService = selectAppointmentService;

// Select Appointmemt Time
export function selectAppointmentTime(time) {
    let timeConfirmEl = document.querySelector('.container-appointment-confirm--time');
    timeConfirmEl.textContent = time;
}
/* Allow 'window' context to reference the function */
window.selectAppointmentTime = selectAppointmentTime;


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
        let dateConfirmEl = document.querySelector('.container-appointment-confirm--date');
        appCal.set(date);
        dateConfirmEl.textContent = swcms.returnFormatDate(date, 'date');
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
