import React, { useState, useEffect } from 'react';
import { Link, useHistory } from "react-router-dom";
import { fade, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableContainer from '@material-ui/core/TableContainer';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';
import SearchIcon from '@material-ui/icons/Search';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import { authen } from '../../utils/helper';
import config from '../../constants/config.json';
const API_URL = config.API_URL_TEST;


const useStyles = makeStyles((theme) => ({
	container: {
		paddingTop: theme.spacing(4),
		paddingBottom: theme.spacing(4),
	},
	tableHeader: {
		fontWeight: 'bolder',
		fontSize: '18px'
	},
	shadow: {
		boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
	},
	row: {
		display: 'flex',
		alignItems: 'center'
	},
	hover: {
		cursor: 'pointer',
		"&:hover": {
			backgroundColor: "#f1f3f4"
		}
	}
}));

export default function UserManagement() {
	const classes = useStyles();
	const history = useHistory();
	const token = window.localStorage.getItem('jwtToken');

	const [users, setUsers] = useState([]);
	const [displayedUsers, setDisplayedUsers] = useState([]);
	const [nameInput, setNameInput] = useState("");
	const [emailInput, setEmailInput] = useState("");

	useEffect(() => {
		async function retrieveUsers() {
			const res = await fetch(`${API_URL}/management/users`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});
			if (res.status === 200) {
				const result = await res.json();
				setUsers(result.users);
				setDisplayedUsers(result.users);
			}
		}
		async function Authen() {
			const status = await authen();
			if (status === 401) {
				history.push('/signIn');
			} else {
				retrieveUsers();
			}
		}
		Authen();
	}, []);

	useEffect(() => {
		if (nameInput === "") {
			setDisplayedUsers(users.slice().filter(user => user.Email.toLowerCase().includes(emailInput)));
		} else if (emailInput === "") {
			setDisplayedUsers(users.slice().filter(user => user.Name.toLowerCase().includes(nameInput)));
		} else {
			setDisplayedUsers(users.slice().filter(user => user.Name.toLowerCase().includes(nameInput) && user.Email.toLowerCase().includes(emailInput)));
		}
	}, [nameInput, emailInput]);

	const handleToUserDetail = (userID) => {
		const userDetail = window.open(`/users/${userID}`, "_blank");
		userDetail.focus();
	}

	return (
		<React.Fragment>
			<Container maxWidth="lg" className={classes.container}>
				<Grid item xs={12} md={12} sm={12}>
					<Paper className={classes.shadow}>
						<div style={{ justifyContent: 'space-between', padding: '10px' }} className={classes.row} >

							<Typography component="h2" variant="h6" color="primary" gutterBottom style={{ padding: '10px', fontWeight: 'bold', textAlign: 'left' }}>
								Users on your system
							</Typography>

							<div className={classes.row} style={{ width: '60%' }}>
								<SearchIcon />
								<Input
									style={{ marginTop: '-10px', marginRight: '20px' }}
									placeholder="Search by name..."
									inputProps={{ 'aria-label': 'search' }}
									onChange={(e) => { setNameInput(e.target.value.toLowerCase()) }}
									fullWidth
								/>
								<SearchIcon />
								<Input
									style={{ marginTop: '-10px' }}
									placeholder="Search by email..."
									inputProps={{ 'aria-label': 'search' }}
									onChange={(e) => { setEmailInput(e.target.value.toLowerCase()) }}
									fullWidth
								/>
							</div>
						</div>

						<TableContainer style={{ maxHeight: '70vh' }}>
							<Table stickyHeader size="small">
								<TableHead>
									<TableRow >
										<TableCell className={classes.tableHeader}>ID</TableCell>
										<TableCell className={classes.tableHeader}>Name</TableCell>
										<TableCell className={classes.tableHeader}>Email</TableCell>
										<TableCell className={classes.tableHeader}>Username</TableCell>
										<TableCell className={classes.tableHeader}>Status</TableCell>
										<TableCell className={classes.tableHeader} align="right"></TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{
										displayedUsers.length === 0 ?
											<TableRow>
												<TableCell style={{ textAlign: 'center' }} colSpan={6}>User not found</TableCell>
											</TableRow>
											:
											(displayedUsers.map((user, index) => {
												const status = user.Status === -1 ? "Inactive" : (user.Status === 2 ? "Banned" : (user.Status === 0 ? "Offlined" : "Onlined"));
												return (
													<TableRow key={index} onClick={() => handleToUserDetail(user.ID)} className={classes.hover}>
														<TableCell>{user.ID}</TableCell>
														<TableCell>{user.Name}</TableCell>
														<TableCell>{user.Email}</TableCell>
														<TableCell>{user.Username}</TableCell>
														<TableCell>{status}</TableCell>
														<TableCell align="right">{
															user.Status !== -1 && user.Status !== 2 ?
																(
																	<Button variant="outlined" color="secondary" >Ban</Button>
																) :
																(
																	<Button variant="outlined" color="primary"> Unban</Button>
																)
														}</TableCell>
													</TableRow>
												)
											}))
									}
								</TableBody>
							</Table>
						</TableContainer>
					</Paper>
				</Grid>
			</Container>
		</React.Fragment>
	);
}