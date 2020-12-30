import React, { useState, useEffect } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
// import Paper from '@material-ui/core/Paper';
import config from '../../constants/config.json';
const API_URL = config.API_URL_TEST;

const StyledTableCell = withStyles((theme) => ({
	head: {
		backgroundColor: theme.palette.common.black,
		color: theme.palette.common.white,
	},
	body: {
		fontSize: 14,
	},
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
	root: {
		'&:nth-of-type(odd)': {
			backgroundColor: theme.palette.action.hover,
		},
	},
}))(TableRow);

function createData(name, calories, fat, carbs, protein) {
	return { name, calories, fat, carbs, protein };
}

const rows = [
	createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
	createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
	createData('Eclair', 262, 16.0, 24, 6.0),
	createData('Cupcake', 305, 3.7, 67, 4.3),
	createData('Gingerbread', 356, 16.0, 49, 3.9),
];

const useStyles = makeStyles({
	table: {
		width: '50%',

	},
});

export default function CustomizedTables() {
	const classes = useStyles();
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

	return (
		<TableContainer style={{
			display: 'flex', justifyContent: 'center'
		}} >
			<Table className={classes.table} aria-label="customized table" style={{ border: '1px solid grey' }}>
				<TableHead>
					<TableRow>
						<StyledTableCell>TOP</StyledTableCell>
						<StyledTableCell>Name</StyledTableCell>
						<StyledTableCell align="right">Elo </StyledTableCell>
						<StyledTableCell align="right">Win Rate</StyledTableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{list.map((row, index) => (
						<StyledTableRow key={index}>
							<StyledTableCell component="th" scope="row">
								{index + 1}
							</StyledTableCell>
							<StyledTableCell component="th" scope="row">
								{row.Name}
							</StyledTableCell>
							<StyledTableCell align="right">{row.Elo}</StyledTableCell>
							<StyledTableCell align="right">{row.WinRate}%</StyledTableCell>
						</StyledTableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer >
	);
}
