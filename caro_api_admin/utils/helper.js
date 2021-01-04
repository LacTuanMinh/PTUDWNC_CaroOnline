const managementModel = require('../models/managementModel');

module.exports = {
	isBlankString: (token) => token.trim().length === 0,


	containsBlank: (token) => token.includes(' '),


	isEmailPattern: (token) => {
		const regex = /\S+@\S+\.\S+/;
		return regex.test(token)
	},

	convertISOToYMD: (token) => {
		let formattedDOB = new Date(token).toLocaleDateString();
		formattedDOB = formattedDOB.split(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
		return formattedDOB[3] + "-" + formattedDOB[1] + "-" + formattedDOB[2];
	},

	mapEloToMedal: async (elo) => {

		const medals = await managementModel.getMedal();
		for (let i = 0; i < medals.length; i++) {
			if (elo < medals[i].MinElo) {
				return medals[i - 1].Name;
			}
		}
		return medals[medals.length - 1].Name;
	}
}


