const jwt = require('jsonwebtoken');
const express = require('express');
const config = require('../config/default.json')
const router = express.Router();
const userModel = require('../models/userModel');

router.get('/', (req, res) => {
  res.render('index', { title: 'Express' });
});


router.post('/signin', async (req, res) => {

  const { username, password } = req.body;
  const users = await userModel.getUserByUserName(username);
  console.log(users);

  if (users.length > 0) {
    const user = users[0];

    if (user.Password === password) {
      const token = jwt.sign({ id: user.ID }, config.passportKey);
      console.log(token);
      return res.status(200).send({
        mesg: "Signed in",
        token: token,
        id: user.ID,
        name: user.Name
      });
    } else {
      return res.status(401).send({ mesg: "Wrong password! Check again" });
    }
  } else {
    return res.status(401).json({ mesg: 'No such user found' });
  }
});

module.exports = router;
