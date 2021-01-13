import React, { useState, useEffect } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import config from '../../constants/config.json';
const API_URL = config.API_URL_TEST;

const StyledTableCell = withStyles((theme) => ({
	head: {
		backgroundColor: "#f50057",
		color: theme.palette.common.white,
	},
	body: {
		fontSize: 18,
	},
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
	root: {
		'&:nth-of-type(odd)': {
			backgroundColor: theme.palette.action.hover,
		},
	},
}))(TableRow);

const useStyles = makeStyles({
	table: {
		width: '50%',
	},
	center: {
		textAlign: 'center',
		fontWeight: 'bolder',
		fontSize: '18px'
	},
	pointer: {
		cursor: 'pointer'
	}
});

export default function CustomizedTables() {
	const classes = useStyles();
	const userID = localStorage.getItem('userID');
	const [list, setList] = useState([]);

	useEffect(() => {
		async function retrieveEloRanking() {

			const res = await fetch(`${API_URL}/ranking`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			const result = await res.json();
			if (res.status === 200) {
				setList(result.list);
			}
		}
		retrieveEloRanking();
	}, []);

	const handleToUserDetail = (id) => {
		if (userID === id)
			return;
		const userDetail = window.open(`/userDetail/${id}`, "_blank");
		userDetail.focus();
	}

	return (
		<>
			<Typography style={{ fontSize: "26px" }}>
				TOP PLAYERS
			</Typography>

			<TableContainer style={{
				display: 'flex', justifyContent: 'center'
			}} >
				<Table className={classes.table} aria-label="customized table" style={{ border: '1px solid grey', borderRadius: '5px' }}>
					<TableHead >
						<TableRow>
							<StyledTableCell className={classes.center} style={{ width: '15%' }}>TOP</StyledTableCell>
							<StyledTableCell className={classes.center} style={{ width: '40%' }}>Name</StyledTableCell>
							<StyledTableCell className={classes.center} style={{ width: '25%' }}>Elo </StyledTableCell>
							<StyledTableCell className={classes.center} style={{ width: '20%' }}>Win Rate</StyledTableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{
							list.length === 0 ?
								<StyledTableRow  >
									<StyledTableCell className={`${classes.center} ${classes.pointer}`} component="th" scope="row" colSpan="4"> No Player Data	</StyledTableCell>
								</StyledTableRow> :
								(list.map((row, index) => (
									<StyledTableRow key={index} onClick={() => handleToUserDetail(row.ID)}>
										<StyledTableCell className={`${classes.center} ${classes.pointer}`} component="th" scope="row"> 	{index + 1} 	</StyledTableCell>
										<StyledTableCell className={`${classes.center} ${classes.pointer}`} component="th" scope="row"> {row.Name} {userID === row.ID ? " (You)" : ""} </StyledTableCell>
										<StyledTableCell className={`${classes.center} ${classes.pointer}`} >{row.Elo}</StyledTableCell>
										<StyledTableCell className={`${classes.center} ${classes.pointer}`} >{row.WinRate}%</StyledTableCell>
									</StyledTableRow>
								)))
						}
					</TableBody>
				</Table>
			</TableContainer >

		</>
	);
}
