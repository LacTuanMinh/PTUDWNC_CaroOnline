const jwt = require('jsonwebtoken');
const express = require('express');
const bcrypt = require('bcryptjs');
const config = require('../config/default.json')
const router = express.Router();
const userModel = require('../models/userModel');

router.get('/', (req, res) => {
  res.render('index', { title: 'Express' });
});


router.post('/signin', async (req, res) => {
  const { username, password } = req.body;
  const users = await userModel.getUserByUserName(username);

  if (users.length > 0) {
    const user = users[0];

    if (bcrypt.compareSync(password, user.Password)) {

      const token = jwt.sign({ id: user.ID }, config.passportKey);

      return res.status(200).send({
        msg: "Signed in",
        token: token,
        id: user.ID,
        name: user.Name
      });
    }
    else {
      return res.status(401).send({ msg: "Wrong password! Check again" });
    }
  }
  else {
    return res.status(401).send({ msg: 'No such user found' });
  }
});

module.exports = router;
