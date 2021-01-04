const jwt = require('jsonwebtoken');
const express = require('express');
const config = require('../config/default.json');
const bcrypt = require('bcryptjs');
const { v1: uuidv1 } = require('uuid');
const router = express.Router();
const userModel = require('../models/userModel');
const accountModel = require('../models/accountModel');
const v1options = {
  msecs: Date.now(),
};
uuidv1(v1options);
const emailServer = require('../utils/email');
const { convertISOToYMD } = require('../utils/helper');

router.get('/', (req, res) => {
  res.render('index', { title: 'Express' });
});

router.post('/signin', async (req, res) => {
  const { username, password } = req.body;
  const users = await userModel.getUserByUserName(username);

  if (users.length > 0) {
    const user = users[0];

    if (user.Status === -1) { // chưa active  tài khoản qua email
      return res.status(401).send({ msg: "Your account has not been activated. Please check your email to continue!" });
    }
    if (user.Status === 2) {
      return res.status(401).send({ msg: "Your account has been banned by admin team." });
    }

    if (bcrypt.compareSync(password, user.Password)) {

      const token = jwt.sign({ id: user.ID }, config.passportKey);
      // await userModel.updateUserStatus(user.ID, 1);// set status to Online (== 1)

      return res.status(200).send({
        mesg: "Signed in", token: token, id: user.ID, name: user.Name
      });
    }
    else {
      return res.status(401).send({ msg: "Wrong password! Check again" });
    }
  }
  else {
    return res.status(401).send({ mesg: 'No such user found' });
  }
});

router.post('/signup', async (req, res) => {

  const { name, email, username, password } = req.body;
  const allUser = await userModel.getAllUsername();

  if (allUser.length > 0) {
    let isExisted = false;

    allUser.forEach(user => {
      if (user.Username === username) {
        console.log("trùng");
        isExisted = true;
      }
    });

    if (isExisted)
      return res.status(400).send({ msg: 'Username has been used' });
  }

  const N = config.hashRound;
  const hashedPassword = bcrypt.hashSync(password, N);
  const newUser = {
    ID: uuidv1(),
    Name: name,
    Username: username,
    Password: hashedPassword,
    Email: email,
    Status: -1, // -1 : inactive , 0: offline, 1: online, 2: banned
    IsAdmin: 0
  };

  const result = await userModel.addUser(newUser);

  if (result.affectedRows === 1) {
    const content = `WELCOME!<br>Now you need to click the link below to active your account.<br><a href="${config.APP_URL_TEST}/active/${newUser.ID}">${config.APP_URL_TEST}/active/${newUser.ID}</a>`
    emailServer.send(newUser.Email, content, "Active your account on our app!");
    return res.status(200).send({ msg: "Please check your email to active your account." });
  } else {
    return res.status(500).send({ msg: "Please try again" });
  }
  // console.log(result);
  // const token = jwt.sign({ id: newUser.ID }, config.passportKey);
  // return res.status(200).send({ mesg: "Welcom to join my app", token, id: newUser.ID, name: newUser.Username });
});

router.post('/active', async (req, res) => {
  const ID = req.body.ID;
  const status = await userModel.getUserStatusByID(ID);

  if (status.length === 0) {
    return res.status(400).send({ msg: "User does not exist." });
  }
  if (status[0].Status !== -1) {
    return res.status(400).send({ msg: "Your account has been activated before. Just join our app now." })
  } else {
    const token = jwt.sign({ id: ID }, config.passportKey);
    const date = convertISOToYMD(new Date().toISOString());

    await userModel.updateUserActivatedDate(ID, date);
    const name = await userModel.getUserNameByID(ID);
    return res.status(200).send({ msg: "Welcom to join our app", token, id: ID, name: name[0].Name });
  }
})

router.post('/checkResetRequest', async (req, res) => {
  const result = await accountModel.getRequestByID(req.body.ID);

  if (result.length === 1) {

    if (result[0].IsSuccessful === 1) {
      return res.status(400).end(); //spam
    }
    return res.status(200).end();// thực sự cần reset

  } else {
    res.status(400).end(); // spam
  }
})

router.post('/forgotpassword', async (req, res) => {
  const { Email, Username } = req.body;

  const user = await userModel.getUserByUserName(Username);

  if (user.length === 0) { // username nhập bậy bạ
    return res.status(400).send({ msg: "Username does not exist" });
  }

  const newResetRequest = {
    ID: uuidv1(),
    UserID: user[0].ID,
    Email,
    IsSuccessful: 0
  }
  const addResult = await accountModel.addRequest(newResetRequest);

  if (addResult.affectedRows === 1) {
    const content = `Reset Password!<br>Now you need to click the link below to recover your account.<br><a href="${config.APP_URL_TEST}/reset/${newResetRequest.ID}">${config.APP_URL_TEST}/reset/${newResetRequest.ID}</a>`
    emailServer.send(newResetRequest.Email, content, "Reset your password on our app!");
    return res.status(200).send({ msg: "Please check your email to continue." });
  } else {
    return res.status(500).send({ msg: "Error, please try again." });
  }
})

router.post('/resetpassword', async (req, res) => {

  const { ID, password, confirmPassword } = req.body;

  if (password !== confirmPassword || password.length < 6 || confirmPassword.length < 6) {
    return res.status(500).send({ msg: "Check again. Password must be at least 6 chars or two password does not match." })
  }

  const result = await accountModel.getRequestByID(ID);
  if (result.length === 1) {

    if (result[0].IsSuccessful === 1) {
      return res.status(400).end(); //spam

    } else {
      const N = config.hashRound;
      const hashedPassword = bcrypt.hashSync(password, N);

      const [reqStatusUpdateResult, passwordUpdateResult] = await Promise.all([
        accountModel.updateRequest(ID, { IsSuccessful: 1 }),
        userModel.updateUserPassword(result[0].UserID, { Password: hashedPassword }),
      ])

      if (reqStatusUpdateResult.affectedRows === 1 && passwordUpdateResult.affectedRows === 1) {
        res.status(200).send({ msg: "Your password has been reset successfully." });
      } else {
        res.status(500).send({ msg: "Something wrong when changing password. Try again" });
      }
    }
  } else {
    res.status(400).end(); // spam
  }
})

router.get('/ranking', async (req, res) => {

  const result = await userModel.getRanking(10);
  console.log(result);
  res.status(200).send({ list: result });
})

module.exports = router;
