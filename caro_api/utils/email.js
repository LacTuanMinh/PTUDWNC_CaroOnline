const nodemailer = require("nodemailer");

module.exports = {
	send: (receiver, description, title) => {
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: 'caroonlineteam@gmail.com',
				pass: 'admin123!'
			},
			tls: {
				rejectUnauthorized: false
			},
			pool: true
		});

		const mailOptions = {
			from: 'caroonlineteam@gmail.com',
			to: receiver,
			subject: title,
			html: description
		};

		return transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				console.log(error);
			} else {
				console.log('Email sent: ' + info.response);
			}
		});
	}
}