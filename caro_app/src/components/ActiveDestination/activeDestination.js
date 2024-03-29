import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

import Typography from '@material-ui/core/Typography';
import config from '../../constants/config.json';
const API_URL = config.API_URL_TEST;

export default function ActiveDestination({ socket, isLoggedIn, setIsLoggedIn }) {
	const ID = useParams().id;
	const history = useHistory();
	const [status, setStatus] = useState("Activating your account. Please wait a moment ...")
	useEffect(() => {
		async function active() {

			if (isLoggedIn) {
				history.push("/");
				return;
			}

			const res = await fetch(`${API_URL}/active`, {
				method: 'POST',
				body: JSON.stringify({ ID }),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const result = await res.json()
			if (res.status === 200) {
				alert(result.msg);
				window.localStorage.setItem('jwtToken', result.token);
				window.localStorage.setItem('userID', result.id);
				window.localStorage.setItem('name', result.name);

				socket.emit(`client_LoggedIn`, { userID: result.id });
				setIsLoggedIn(true);
				history.push("/");

			} else if (res.status === 400) { // already activated or not exist
				// alert(result.msg);
				setStatus(result.msg);
			}
		}
		active();
	}, [ID])
	return (
		<>
			<Typography>{status}</Typography>
		</>);
}