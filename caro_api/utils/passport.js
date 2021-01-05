const passportJWT = require('passport-jwt');
const userModel = require('../models/userModel');
const config = require('../config/default.json');
const { convertISOToYMD } = require('../utils/helper');

// create jwt strategy
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const jwtOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: config.passportKey
};
const JWT_strategy = new JwtStrategy(jwtOptions, async (jwt_payload, next) => {
	const user = await userModel.getUserByID(jwt_payload.id);
	if (user[0] !== null)
		return next(null, user[0]);
	else return next(null, false);
});

// create facebook strategy
// const FacebookStrategy = require('passport-facebook').Strategy;
// const fbOptions = {
// 	clientID: config.facebook_key,
// 	clientSecret: config.facebook_secret,
// 	callbackURL: config.callback_url,
// 	profileFields: ['id', 'displayName', 'email', 'photos']
// };
// const FB_strategy = new FacebookStrategy(fbOptions, async (accessToken, refreshToken, profile, done) => {
// 	const user = await userModel.getUserByID(profile.id);

// 	if (user.length === 1) { // đã tồn tại trong db
// 		return done(null, user[0]);
// 	} else {
// 		const newUser = {
// 			ID: profile.id,
// 			Name: profile.displayName,
// 			Username: profile.id,
// 			Password: 'facebook',
// 			Email: profile.emails[0].value,
// 			Status: 0, // -1 : inactive , 0: offline, 1: online, 2: banned
// 			IsAdmin: 0,
// 			Elo: 1000,
// 			WinCount: 0,
// 			PlayCount: 0,
// 			ActivatedDate: convertISOToYMD(new Date().toISOString()),
// 		};
// 		// const result = await userModel.addUser(newUser);
// 		return done(null, newUser);
// 	}
// })

// use these strategy
module.exports = passport => {
	passport.use(JWT_strategy);
	// passport.use(FB_strategy);
}
