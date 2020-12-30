import config from '../constants/config.json'
const API_URL = config.API_URL_TEST

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

export { authen, isBlankString, containsBlank, isEmailPattern };
