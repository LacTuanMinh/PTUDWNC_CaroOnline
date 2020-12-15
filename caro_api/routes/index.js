const jwt = require('jsonwebtoken');
const express = require('express');
const config = require('../config/default.json');
const bcrypt = require('bcryptjs');
const { v1: uuidv1 } = require('uuid');
const router = express.Router();
const userModel = require('../models/userModel');
const v1options = {
  msecs: Date.now(),
};

uuidv1(v1options);

router.get('/', (req, res) => {
  res.render('index', { title: 'Express' });
});

router.post('/signin', async (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  const users = await userModel.getUserByUserName(username);
  // console.log(users);

  if (users.length > 0) {
    const user = users[0];

    if (bcrypt.compareSync(password, user.Password)) {

      const token = jwt.sign({ id: user.ID }, config.passportKey);
      // await userModel.updateUserStatus(user.ID, 1);// set status to Online (== 1)

      return res.status(200).send({
        mesg: "Signed in",
        token: token,
        id: user.ID,
        name: user.Name
      });
    }
    else {
      return res.status(401).send({ mesg: "Wrong password! Check again" });
    }
  }
  else {
    return res.status(401).send({ mesg: 'No such user found' });
  }
});

router.post('/signup', async (req, res) => {

  console.log(req.body);
  const { name, email, username, password } = req.body;

  const allUser = await userModel.getAllUsername();
  console.log(allUser);

  if (allUser.length > 0) {
    let isExisted = false;

    allUser.forEach(user => {
      if (user.Username === username) {
        console.log("trùng");
        isExisted = true;
      }
    });

    if (isExisted)
      return res.status(400).send({ mesg: 'Username has been used' });
  }

  const N = config.hashRound;
  const hashedPassword = bcrypt.hashSync(password, N);
  const newUser = {
    ID: uuidv1(),
    Name: name,
    Username: username,
    Password: hashedPassword,
    Email: email,
    Status: 0,
    IsAdmin: 0
  };

  const result = await userModel.addUser(newUser);
  console.log(result);
  const token = jwt.sign({ id: newUser.ID }, config.passportKey);
  return res.status(200).send({ mesg: "Welcom to join my app", token, id: newUser.ID, name: newUser.Username });
});


module.exports = router;
