const passportJWT = require('passport-jwt');
const userModel = require('../models/userModel');
const config = require('../config/default.json')

// create jwt strategy
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.passportKey
};
const JWT_strategy = new JwtStrategy(jwtOptions, async (jwt_payload, next) => {

    // console.log('You access jwtstrategy. userID : ' + jwt_payload.id);

    const user = await userModel.getUserByID(jwt_payload.id);
    if (user[0] !== null)
        return next(null, user[0]);
    else return next(null, false);
});

// use the JWT strategy
module.exports = passport => {
    passport.use(JWT_strategy);
}
