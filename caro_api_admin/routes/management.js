const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const managementModel = require('../models/managementModel');
const fs = require('fs');
const path = require('path');
const util = require("util");
const rename = util.promisify(fs.rename);
const unlink = util.promisify(fs.unlink);
const config = require('../config/default.json');
const { convertISOToYMD } = require('../utils/helper');

router.use(express.static('public'));

router.get('/games', async (req, res) => {
	const games = await managementModel.getAllGames();
	res.status(200).send({ games });
})


router.get('/users', async (req, res) => {
	const users = await managementModel.getAllUsers();
	res.status(200).send({ users });
});

router.get('/users/:userID', async (req, res) => {
	const userID = req.params.userID;
	const results = await managementModel.getUserByID(userID);

	if (results.length === 1) {
		const result = results[0];
		delete result.Password;
		delete result.Status;
		delete result.IsAdmin;
		res.status(200).send({ userInfo: result });
	} else {
		res.status(400).end();
	}
});

router.get('/users/avatar/:userID', async (req, res) => {

	const userID = req.params.userID;
	const result = await managementModel.getUserAvatarByID(userID);

	if (result.length !== 1) { // wrong userID
		return res.status(400).send({ mesg: "Error! Please try later" });
	}

	if (result[0].Avatar === null) { // chưa có avatar
		return res.status(304).end();
	}

	const AvatarURL = result[0].Avatar;
	res.status(200).sendFile(path.join(__dirname, '../../caro_api/public', AvatarURL));
});

router.get('/playedGames/:userID', async (req, res) => {
	const userID = req.params.userID;
	const games = await managementModel.getAllGamesByPlayerID(userID);

	res.status(200).send({ list: games });
});

router.get('/playedGameDetail/:ID', async (req, res) => {
	const gameID = req.params.ID;
	const game = await managementModel.getGameByID(gameID);
	console.log(gameID, game);
	const [player1Name, player2Name] = await Promise.all([
		managementModel.getUserNameByID(game[0].Player1ID),
		managementModel.getUserNameByID(game[0].Player2ID),
	]);
	res.status(200).send({ game: game[0], player1Name: player1Name[0].Name, player2Name: player2Name[0].Name });
});

router.post('/ban/:userID', async (req, res) => {

	const userID = req.params.userID;
	const result = await managementModel.updateUserStatus(userID, 2);
	if (result.affectedRows === 0) {
		return res.status(400).send({ msg: 'User not found' });
	} else {
		return res.status(200).send({ msg: 'Banned' });
	}
});

router.post('/unban/:userID', async (req, res) => {

	const userID = req.params.userID;
	const result = await managementModel.updateUserStatus(userID, 0);
	if (result.affectedRows === 0) {
		return res.status(400).send({ msg: 'User not found' });
	} else {
		return res.status(200).send({ msg: 'Unbanned' });
	}
});

module.exports = router;
