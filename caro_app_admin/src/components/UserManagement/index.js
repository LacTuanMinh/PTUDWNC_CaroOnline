import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableContainer from '@material-ui/core/TableContainer';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';
import SearchIcon from '@material-ui/icons/Search';
import TablePagination from '@material-ui/core/TablePagination';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import { InformationSnackbar } from '../SnackBar/snackbar';
import { authen } from '../../utils/helper';
import config from '../../constants/config.json';
const API_URL = config.API_URL_TEST;


const useStyles = makeStyles((theme) => ({
	container: {
		paddingTop: theme.spacing(4),
		paddingBottom: theme.spacing(4),
	},
	tableHeader: {
		textAlign: 'center',
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
	},
	tableBody: {
		textAlign: 'center',
		fontSize: '15px',
		padding: '8px'
	},
}));

export default function UserManagement() {
	const classes = useStyles();
	const history = useHistory();
	const token = window.localStorage.getItem('jwtToken');

	const [users, setUsers] = useState([]);
	const [displayedUsers, setDisplayedUsers] = useState([]);
	const [nameInput, setNameInput] = useState("");
	const [emailInput, setEmailInput] = useState("");
	const [showSnackbar, setShowSnackBar] = useState(false);
	const [content, setContent] = useState("");
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

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
	const handleBanUser = async (event, userID) => {
		event.stopPropagation(); // prevent click this button lead to user detail page

		const res = await fetch(`${API_URL}/management/ban/${userID}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			}
		});
		if (res.status === 200) {
			const usersCopy = JSON.parse(JSON.stringify(users));
			setUsers(usersCopy =>
				usersCopy.map((user, index) => {
					if (user.ID === userID) {
						user.Status = 2;
					}
					return user;
				})
			);

		} else {
			const result = await res.json();
			setContent(result.msg);
			setShowSnackBar(true);
		}
	}
	const handleUnbanUser = async (event, userID) => {
		event.stopPropagation();

		const res = await fetch(`${API_URL}/management/unban/${userID}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			}
		});
		if (res.status === 200) {
			const usersCopy = JSON.parse(JSON.stringify(users));
			setUsers(usersCopy =>
				usersCopy.map((user, index) => {
					if (user.ID === userID) {
						user.Status = 0;
					}
					return user;
				})
			);
		} else {
			const result = await res.json();
			setContent(result.msg);
			setShowSnackBar(true);
		}
	}

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	}

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(+event.target.value);
		setPage(0);
	}

	return (
		<React.Fragment>
			<InformationSnackbar open={showSnackbar} setOpen={(isOpen) => setShowSnackBar(isOpen)} content={content} />
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
										<TableCell className={classes.tableHeader} style={{ width: '15%' }}>ID</TableCell>
										<TableCell className={classes.tableHeader} style={{ width: '20%' }}>Name</TableCell>
										<TableCell className={classes.tableHeader} style={{ width: '20%' }}>Email</TableCell>
										<TableCell className={classes.tableHeader} style={{ width: '20%' }}>Username</TableCell>
										<TableCell className={classes.tableHeader} style={{ width: '10%' }}>Status</TableCell>
										<TableCell className={classes.tableHeader} style={{ width: '10%' }}></TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{
										displayedUsers.length === 0 ?
											<TableRow>
												<TableCell style={{ textAlign: 'center' }} colSpan={6}>User not found</TableCell>
											</TableRow>
											:
											(displayedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user, index) => {
												const status = user.Status === -1 ? "Inactivated" : (user.Status === 2 ? "Banned" : "Activated");
												return (
													<TableRow key={index} title={"Click to view user detail"} onClick={() => handleToUserDetail(user.ID)} className={classes.hover}>
														<TableCell className={classes.tableBody} >{user.ID}</TableCell>
														<TableCell className={classes.tableBody} >{user.Name}</TableCell>
														<TableCell className={classes.tableBody} >{user.Email}</TableCell>
														<TableCell className={classes.tableBody} >{user.Username}</TableCell>
														<TableCell className={classes.tableBody} >{status}</TableCell>
														<TableCell className={classes.tableBody} >{
															user.Status !== -1 && user.Status !== 2 ?
																<Button variant="outlined" color="secondary" onClick={(e) => handleBanUser(e, user.ID)} title={"Click to ban this user"}>Ban</Button>
																:
																<Button variant="outlined" color="primary" onClick={(e) => handleUnbanUser(e, user.ID)} title={"Click to unban this user"}> Unban</Button>
														}</TableCell>
													</TableRow>
												)
											}))
									}
								</TableBody>
							</Table>
						</TableContainer>
						<TablePagination
							rowsPerPageOptions={[10, 25, 100]}
							component="div"
							count={displayedUsers.length}
							rowsPerPage={rowsPerPage}
							page={page}
							onChangePage={handleChangePage}
							onChangeRowsPerPage={handleChangeRowsPerPage}
							style={{ backgroundColor: '#f1f3f4' }}
						/>
					</Paper>
				</Grid>
			</Container>
		</React.Fragment>
	);
}