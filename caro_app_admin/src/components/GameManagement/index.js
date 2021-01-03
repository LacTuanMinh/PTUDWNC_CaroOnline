import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableContainer from '@material-ui/core/TableContainer';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';
import SearchIcon from '@material-ui/icons/Search';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import { convertISOToDMY } from '../../utils/helper';
import config from '../../constants/config.json';

const API_URL = config.API_URL_TEST;

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  root: {
    width: '100%',
  },
  tableContainer: {
    maxHeight: '85vh',
  },
  tableHeader: {
    fontWeight: 'bolder',
    fontSize: '17px',
    backgroundColor: 'lightGrey',
    textAlign: 'center',
    padding: '10px'
  },
  tableBody: {
    textAlign: 'center',
    fontSize: '15px',
    padding: '8px'
  },
  shadow: {
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
  },
  row: {
    display: 'flex',
    alignItems: 'center'
  },
}));

export default function GameManagement() {

  const history = useHistory();
  const token = window.localStorage.getItem('jwtToken');
  const classes = useStyles();

  const [games, setGames] = useState([]);
  const [displayedGames, setDisplayedGames] = useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [nameInput, setNameInput] = useState("");

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleToPlayedGame = (gameID) => {
    const playedGame = window.open(`/games/${gameID}`, "_blank");
    playedGame.focus();
    return;
  }

  useEffect(() => {
    async function retrieveGames() {
      const res = await fetch(`${API_URL}/management/games`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.status === 200) {
        const result = await res.json();
        setGames(result.games);
        setDisplayedGames(result.games);
      } else if (res.status === 401) {
        history.push('/signIn');
      } else {

      }
    }
    retrieveGames();
  }, []);

  useEffect(() => {
    if (nameInput !== "") {
      setDisplayedGames(games.slice().filter(game => game.Name.toLowerCase().includes(nameInput)));
    } else {
      setDisplayedGames(games);
    }
  }, [nameInput]);

  return (
    <>
      <Container maxWidth="lg" className={classes.container}>
        <Paper className={`${classes.root} ${classes.shadow}`}>

          <div style={{ justifyContent: 'space-between', padding: '10px' }} className={classes.row} >

            <Typography component="h2" variant="h6" color="primary" gutterBottom style={{ padding: '10px', fontWeight: 'bold', textAlign: 'left' }}>
              History of generated games
            </Typography>

            <div className={classes.row} style={{ alignItems: 'right', width: '30%' }}>
              <SearchIcon />
              <Input
                style={{ marginTop: '-10px', marginRight: '20px' }}
                placeholder="Search by game name..."
                inputProps={{ 'aria-label': 'search' }}
                onChange={(e) => { setNameInput(e.target.value.toLowerCase()) }}
                fullWidth
              />
            </div>
          </div>

          <TableContainer className={classes.tableContainer}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell key={1} className={classes.tableHeader} style={{ width: '15%' }}> ID </TableCell>
                  <TableCell key={2} className={classes.tableHeader} style={{ width: '15%' }}> Name  </TableCell>
                  <TableCell key={3} className={classes.tableHeader} style={{ width: '15%' }}> Player 1 <br></br> (1) </TableCell>
                  <TableCell key={4} className={classes.tableHeader} style={{ width: '15%' }}> Player 2 <br></br> (2) </TableCell>
                  <TableCell key={5} className={classes.tableHeader} style={{ width: '5%' }}>  Winner </TableCell>
                  <TableCell key={6} className={classes.tableHeader} style={{ width: '10%' }}> Blocked rule  </TableCell>
                  <TableCell key={7} className={classes.tableHeader} style={{ width: '10%' }}> Time per turn (s) </TableCell>
                  <TableCell key={8} className={classes.tableHeader} > Played at </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  displayedGames.length === 0 ?
                    <TableRow >
                      <TableCell style={{ textAlign: 'center' }} colSpan={8}>No games found</TableCell>
                    </TableRow>
                    :
                    displayedGames.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((game, index) => {
                      return (
                        <TableRow key={index} title={"Click to view game detail"} hover style={{ cursor: 'pointer' }} onClick={() => handleToPlayedGame(game.ID)}>
                          <TableCell className={classes.tableBody}> {game.ID} </TableCell>
                          <TableCell className={classes.tableBody}> {game.Name} </TableCell>
                          <TableCell className={classes.tableBody}> {game.Player1} </TableCell>
                          <TableCell className={classes.tableBody}> {game.Player2} </TableCell>
                          <TableCell className={classes.tableBody}> {game.Result === 1 ? "(1)" : "(2)"}  </TableCell>
                          <TableCell className={classes.tableBody}> {game.IsBlockedRule === true ? "Yes" : "No"} </TableCell>
                          <TableCell className={classes.tableBody}> {game.TimeThinkingEachTurn}  </TableCell>
                          <TableCell className={classes.tableBody}> {convertISOToDMY(game.GameOverAt)} </TableCell>
                        </TableRow>
                      );
                    })
                }
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={displayedGames.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
            style={{ backgroundColor: '#f1f3f4' }}
          />
        </Paper>
      </Container>
    </>
  );
}