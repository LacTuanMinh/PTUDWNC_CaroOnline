import config from '../constants/config.json';
const API_URL = config.API_URL_DEPLOY;

async function authen() {
    const jwtToken = window.localStorage.getItem('jwtToken');
    const res = await fetch(`${API_URL}users/authenticate`, {
        method: 'POST',
        // body: JSON.stringify({ newUserName }),
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`
        }
    });
    return res.status;
}

export { authen };