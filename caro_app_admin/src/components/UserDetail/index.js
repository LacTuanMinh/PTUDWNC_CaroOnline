import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import Badge from '@material-ui/core/Badge';
import defaultAvatar from '../../images/defaultAvatar.jpg';
import PlayedGamesDialog from '../Dialogs/PlayedGamesDialog/index';
import MedalIcon from '../../images/medal.png';
import config from '../../constants/config.json';

const API_URL = config.API_URL_TEST;

const useStyles = makeStyles((theme) => ({
	cardGrid: {
		paddingTop: theme.spacing(4),
		paddingBottom: theme.spacing(4),
	},
	card: {
		height: '100%',
		flexDirection: 'column',
	},
	cardMedia: {
		paddingTop: '25%',
	},
	cardHeader: {
		backgroundColor:
			theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[700],
	},
	cardContent: {
		flexGrow: 1,
	},
	paper: {
		marginTop: theme.spacing(3),
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: "black"//theme.palette.secondary.main,
	},
	form: {
		width: '75%', // Fix IE 11 issue.
		marginTop: theme.spacing(1),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
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

export default function UserDetail() {
	const classes = useStyles();
	const userID = useParams().userID; // not ID of the admin
	const token = localStorage.getItem('jwtToken'); // token of admin
	const history = useHistory();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [dateOfBirth, setDateOfBirth] = useState((new Date()).toISOString());
	const [avatar, setAvatar] = useState("");
	const [activatedDate, setActivatedDate] = useState((new Date()).toISOString());
	const [info, setInfo] = useState({});

	useEffect(() => {
		async function ComponentWillMount() {
			const res = await fetch(`${API_URL}/management/users/${userID}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});

			if (res.status === 200) {
				const result = await res.json();
				setInfo(result.userInfo);
				setName(result.userInfo.Name);
				setEmail(result.userInfo.Email);
				setAvatar(result.userInfo.Avatar);
				setActivatedDate(new Date(result.userInfo.ActivatedDate).toLocaleDateString());
				setDateOfBirth(result.userInfo.DateOfBirth !== null ?
					(new Date(result.userInfo.DateOfBirth)).toLocaleDateString()
					:
					"<Empty>");
			} else {
				history.push('/signIn');
				return;
			}
		}
		ComponentWillMount();
	}, []);

	useEffect(() => {
		async function retrieveAvatar() {
			const res = await fetch(`${API_URL}/management/users/avatar/${userID}`, {
				method: 'GET',
				headers: {
					ContentType: 'image/jpeg',
					Authorization: `Bearer ${token}`
				}
			});

			if (res.status === 200) {
				const result = await res.blob();
				setAvatar(URL.createObjectURL(result));
			}
		}
		retrieveAvatar();
	}, [setAvatar]);

	return (
		<>
			<Container component="main" maxWidth="lg">
				<Grid container spacing={4}>
					<Grid item xs={12} md={6}>
						<div className={classes.paper} style={{ padding: '20px' }}>
							<img height={200} width={200} style={{ borderRadius: '8px', margin: '20px' }} className={classes.paperLikeShadow}
								src={avatar ? avatar : defaultAvatar} alt="User avatar"
							/>
							<Card className={classes.paperLikeShadow} style={{ width: '70%', margin: '20px' }}>
								<CardHeader
									title={
										<Badge color="secondary">
											<div style={{ display: 'table' }}>
												<img src={MedalIcon} height="40" width="40" style={{
													display: 'table-cell',
													verticalAlign: 'middle',
													marginRight: '10px'
												}} />
												<span style={{ display: 'table-cell', verticalAlign: 'middle', marginLeft: '10px' }}> {info.medal}</span>
											</div>
										</Badge>}
									className={classes.cardHeader}
								/>
								<CardContent>
									<table style={{ margin: '5px', width: '100%', fontSize: '18px' }}>
										<tbody>
											<tr>
												<td style={{ textAlign: 'right', fontWeight: 'bold', width: '50%' }}>Elo mark:</td>
												<td style={{ textAlign: 'center', width: '50%' }}>{info.Elo}</td>
											</tr>
											<tr>
												<td style={{ textAlign: 'right', fontWeight: 'bold' }}>Total play(s):</td>
												<td style={{ textAlign: 'center' }}>{info.PlayCount}</td>
											</tr>
											<tr>
												<td style={{ textAlign: 'right', fontWeight: 'bold' }}>Winned play(s):</td>
												<td style={{ textAlign: 'center' }}>{info.WinCount}</td>
											</tr>
										</tbody>
									</table>
								</CardContent>
								<CardActions>
									<PlayedGamesDialog userID={userID} />
								</CardActions>
							</Card>
						</div>
					</Grid>

					<Grid item xs={12} md={6}>
						<div className={classes.paper}>
							<Typography component="h2" variant="h5">
								USER DETAIL
							</Typography>
							<div className={classes.form} >

								<div className={classes.container}>
									<Typography className={classes.floatLeft} align="left" component="h2"><b> Name:</b> </Typography>
								</div>
								<TextField variant="outlined" margin="normal" fullWidth
									placeholder="Name" value={name} disabled
								/>
								<div className={classes.container}>
									<Typography className={classes.floatLeft} align="left" component="h2"> <b>Email:</b>  </Typography>
								</div>
								<TextField variant="outlined" margin="normal" fullWidth
									placeholder="Email" value={email} disabled
								/>

								<div className={classes.container}>
									<Typography align="left" component="h2" className={classes.floatLeft}>
										<b>Date of Birth:</b>
									</Typography>
								</div>
								<TextField variant="outlined" margin="normal" disabled fullWidth
									placeholder="Date of birth" value={dateOfBirth !== null ? dateOfBirth : "<Empty>"}
								/>
								<div className={classes.container}>
									<Typography align="left" component="h2" className={classes.floatLeft}>
										<b>Activated date:</b>
									</Typography>
								</div>
								<TextField variant="outlined" margin="normal" disabled fullWidth
									placeholder="Activated dare" value={activatedDate}
								/>
							</div>
						</div>
					</Grid>
				</Grid>
			</Container>
		</>
	);
}
