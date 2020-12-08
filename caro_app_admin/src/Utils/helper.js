async function authen() {

    const jwtToken = window.localStorage.getItem('jwtToken');
    const res = await fetch(`http://localhost:8001/users/authenticate`, {
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