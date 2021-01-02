import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom'
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Avatar from '@material-ui/core/Avatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import config from '../../../constants/config.json';
import IconButton from '@material-ui/core/IconButton';
import HistoryIcon from '@material-ui/icons/History';
import VisibilityIcon from '@material-ui/icons/Visibility';
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

export default function PlayedGamesDialog({ userID }) {
	const classes = useStyles();
	const token = window.localStorage.getItem('jwtToken');
	const history = useHistory();
	const [open, setOpen] = useState(false);
	const [dense, setDense] = useState(false);
	const [gameList, setGameList] = useState([]);

	const handleClickOpen = () => {
		setOpen(true);
	}

	const handleClose = () => {
		setOpen(false);
	}

	useEffect(() => {
		async function retrieveGameList() {

			const res = await fetch(`${API_URL}/management/playedGames/${userID}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});
			const result = await res.json();
			setGameList(result.list);
		}
		retrieveGameList();
	}, [setGameList]);


	const handleChangeToViewPlayedGame = (gameID) => {
		const playedGame = window.open(`/games/${gameID}`, "_blank");
		playedGame.focus();
		return;
	}

	return (
		<>
			<Button fullWidth variant="contained" color="secondary" onClick={handleClickOpen}>
				Played games
      </Button>
			<Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" fullWidth>
				<form >
					<DialogTitle id="form-dialog-title" >Played games</DialogTitle>
					<DialogContent>

						<div className={classes.demo}>
							<List dense={dense}>
								{
									gameList.length === 0 ?
										<Typography variant="h6" style={{ textAlign: 'center' }}>No game played</Typography>
										:
										(gameList.map((game, index) => (
											<React.Fragment key={game.ID}>
												<ListItem >
													<ListItemAvatar>
														<Avatar>
															<HistoryIcon />
														</Avatar>
													</ListItemAvatar>
													<ListItemText
														primary={game.Name}
													// secondary={game.Player1ID === userID && game.Result === 1 ? "You won" : "You lost"}
													/>
													<ListItemSecondaryAction>
														<IconButton edge="end" aria-label="delete" onClick={() => handleChangeToViewPlayedGame(game.ID)} >
															<VisibilityIcon />
														</IconButton>
													</ListItemSecondaryAction>
												</ListItem>
												<Divider />
											</React.Fragment>
										)))
								}

							</List>
						</div>
					</DialogContent>
				</form>
			</Dialog>
		</>
	);
}
