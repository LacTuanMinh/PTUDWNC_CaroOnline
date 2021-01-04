import config from '../constants/config.json';
const API_URL = config.API_URL_TEST;

async function authen() {
    const jwtToken = window.localStorage.getItem('jwtToken');
    const res = await fetch(`${API_URL}/users/authenticate`, {
        method: 'POST',
        // body: JSON.stringify({ newUserName }),
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`
        }
    });
    return res.status;
}

function isBlankString(token) {
    return token.trim().length === 0;
}

function containsBlank(token) {
    return token.includes(' ');
}

function isEmailPattern(token) {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(token)
}

function convertISOToDMY(token) {
    let formattedDOB = new Date(token).toLocaleDateString();
    formattedDOB = formattedDOB.split(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    // return formattedDOB[1] + "/" + formattedDOB[2] + "/" + formattedDOB[3];
    return (formattedDOB[1].length === 1 ? "0" + formattedDOB[1] : formattedDOB[1]) + "/" + (formattedDOB[2].length === 1 ? "0" + formattedDOB[2] : formattedDOB[2]) + "/" + formattedDOB[3];
}

export { authen, isBlankString, containsBlank, isEmailPattern, convertISOToDMY };