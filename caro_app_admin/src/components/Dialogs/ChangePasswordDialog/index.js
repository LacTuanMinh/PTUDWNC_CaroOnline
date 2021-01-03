import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import SimpleSnackbar from '../../SnackBar/snackbar';
import DialogTitle from '@material-ui/core/DialogTitle';
import SaveIcon from '@material-ui/icons/Save';
import { isBlankString } from '../../../utils/helper'; //'../../../utils/index'
import config from '../../../constants/config.json';
const API_URL = config.API_URL_TEST;


const useStyles = makeStyles((theme) => ({

	container: {
		display: 'inline-block',
		width: '100%'
	},
	floatRight: {
		float: "right",
		width: '60%'
	},
	floatLeft: {
		float: "left",
		width: '40%'
	},
	paperLikeShadow: {
		boxShadow: '0 4px 8px 5px rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
	},
	hidden: {
		display: 'none'
	}
}));

export default function FormDialog() {
	const classes = useStyles();
	const userID = localStorage.getItem('userID');
	const token = window.localStorage.getItem('jwtToken');
	const [open, setOpen] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [validCurentPassword, setValidCurentPassword] = useState(false);
	const [validNewPassword, setValidNewPassword] = useState(false);
	const [showSnackbar, setShowSnackBar] = useState(false);
	const [contents, setContents] = useState([
		{ id: 4, msg: "Password can't be empty!!!" },
		{ id: 5, msg: "New password can't be empty!!!" },
	]);

	const handleCurrentPasswordChange = (currentPassword) => {
		setCurrentPassword(currentPassword);
		if (isBlankString(currentPassword)) {
			setContents(contents => [...contents.filter(content => content.id !== 4), { id: 4, msg: "Password can't be empty!!!" }]);
			setValidCurentPassword(false);
		} else if (currentPassword.length < 6) {
			setContents(contents => [...contents.filter(content => content.id !== 4), { id: 4, msg: "Password must have at least 6 characters!!!" }]);
			setValidCurentPassword(false);
		} else {
			setContents(contents.filter(content => content.id !== 4));
			setValidCurentPassword(true);
		}
	}

	const handleNewPasswordChange = (newPassword) => {
		setNewPassword(newPassword);
		if (isBlankString(newPassword)) {
			setContents(contents => [...contents.filter(content => content.id !== 5), { id: 5, msg: "New password can't be empty!!!" }]);
			setValidNewPassword(false);
		} else if (newPassword.length < 6) {
			setContents(contents => [...contents.filter(content => content.id !== 5), { id: 5, msg: "New password must have at least 6 characters!!!" }]);
			setValidNewPassword(false);
		} else {
			setContents(contents.filter(content => content.id !== 5));
			setValidNewPassword(true);
		}
	}

	const handleClickOpen = () => {
		setOpen(true);
		setContents([
			{ id: 4, msg: "Password can't be empty!!!" },
			{ id: 5, msg: "New password can't be empty!!!" },
		]);
	};

	const handleClose = () => {
		setOpen(false);
		setCurrentPassword("");
		setNewPassword("");
		setShowSnackBar(false);
	};

	const handleChangePassword = async (event) => {
		event.preventDefault();

		if (!validCurentPassword || !validNewPassword) {
			setShowSnackBar(true);
		}
		else {
			const data = {
				CurrentPassword: currentPassword,
				NewPassword: newPassword
			}
			const res = await fetch(`${API_URL}/users/profile/updatepassword/${userID}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(data),
			});

			// const result = await res.json();
			if (res.status === 200) {
				setShowSnackBar(true);
			} else {
				setShowSnackBar(true);
			}
		}
	};

	return (
		<div>
			<SimpleSnackbar open={showSnackbar} setOpen={(isOpen) => setShowSnackBar(isOpen)} contents={contents} />

			<Button fullWidth variant="outlined" color="secondary" onClick={handleClickOpen} startIcon={<SaveIcon />}>
				Change password
      </Button>
			<Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
				<form >
					<DialogTitle id="form-dialog-title">Change password</DialogTitle>
					<DialogContent>
						<div className={classes.container}>
							<Typography className={classes.floatLeft} align="left" component="h2"><b> Current password:</b> </Typography>
							{validCurentPassword ?
								<></>
								:
								<Typography className={classes.floatRight} align="right" style={{ color: "red" }}>Invalid</Typography>
							}
						</div>
						<TextField variant="outlined" autoFocus margin="normal" type="password" fullWidth
							onChange={(event) => { handleCurrentPasswordChange(event.target.value); }}
						/>

						<div className={classes.container}>
							<Typography className={classes.floatLeft} align="left" component="h2"><b> New password:</b> </Typography>
							{validNewPassword ?
								<></>
								:
								<Typography className={classes.floatRight} align="right" style={{ color: "red" }}>Invalid</Typography>
							}
						</div>
						<TextField variant="outlined" margin="normal" type="password" fullWidth
							onChange={(event) => { handleNewPasswordChange(event.target.value); }}
						/>
						<Typography>Password must have at least 6 characters</Typography>

					</DialogContent>
					<DialogActions>
						<Button onClick={handleChangePassword} color="secondary">
							Update
            </Button>
						<Button onClick={handleClose} color="primary">
							Cancel
           </Button>
					</DialogActions>
				</form>
			</Dialog>
		</div>
	);
}
