const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const util = require("util");
const rename = util.promisify(fs.rename);
const unlink = util.promisify(fs.unlink);
const config = require('../config/default.json');
const { convertISOToYMD } = require('../utils/helper');
const storage = multer.diskStorage({

  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);// make filename unique in images folder (if happen)
  },
  destination: function (req, file, cb) {
    cb(null, `./public/images/userAvatars`);
  },
});
const upload = multer({ storage });

router.use(express.static('public'));

router.post('/authenticate', (req, res) => {
  console.log("authenticated");
  return res.status(200).end();
});

router.get('/get/:ID', async (req, res) => {
  const userID = req.params.ID;
  const user = await userModel.getUserByID(userID);
  if (user) {
    res.status(200).send({ player1: user[0] });
  }
  //else res.status(404).send()
});

router.post('/signout', async (req, res) => {

  const { userID } = req.body;
  const affectedRow = await userModel.updateUserStatus(userID, 0);

  if (affectedRow === 0) {
    res.status(400).send({ mesg: 'Failed to sign out' });
  } else res.status(200).send({ mesg: 'Successful' });

})

router.get('/profile/:userID', async (req, res) => {
  const userID = req.params.userID;

  const results = await userModel.getUserByID(userID);
  if (results.length === 1) {
    const result = results[0];
    delete result.Password;
    delete result.Status;
    delete result.IsAdmin;
    res.status(200).send({ userInfo: result });
  } else {
    res.status(400).end();
  }
})

router.get('/avatar/:userID', async (req, res) => {

  const userID = req.params.userID;
  const result = await userModel.getUserAvatarByID(userID);

  if (result.length !== 1) { // wrong userID
    return res.status(400).send({ mesg: "Error! Please try later" });
  }

  if (result[0].Avatar === null) { // chưa có avatar
    return res.status(304).end();
  }

  const AvatarURL = result[0].Avatar;
  res.status(200).sendFile(path.join(__dirname, '../public', AvatarURL));
});

router.post('/profile/updateinfo/:userID', async (req, res) => {

  const userID = req.params.userID;
  const { Name, Email, DateOfBirth } = req.body;
  const formattedDOB = convertISOToYMD(DateOfBirth);

  const result = await userModel.updateUserInfo(userID, { Name, Email, DateOfBirth: formattedDOB });

  console.log(result);

  if (result.affectedRows === 1) {
    res.status(200).send({ mesg: 'ok' });
  } else res.status(400).end();

});

router.post('/profile/updatepassword/:userID', async (req, res) => {
  const userID = req.params.userID;
  const { CurrentPassword, NewPassword } = req.body;

  const result = await userModel.getPasswordByID(userID);

  if (result.length === 1) {

    if (bcrypt.compareSync(CurrentPassword, result[0].Password)) { // old password is correct
      const N = config.hashRound;
      const hashedPassword = bcrypt.hashSync(NewPassword, N);
      const updateResult = await userModel.updateUserPassword(userID, { Password: hashedPassword });

      if (updateResult.affectedRows === 1) {
        res.status(200).end();
      } else {
        res.status(400).send({ mesg: "Something wrong when changing password" });
      }

    } else {
      res.status(400).send({ mesg: "Current password is wrong" });
    }

  } else {
    res.status(400).send({ mesg: "Something wrong when changing password" });
  }
});

router.post('/profile/updateavatar/:userID', upload.single('avatar'), async (req, res) => {

  const userID = req.params.userID;
  const file = req.file;
  const user = await userModel.getUserByID(userID);

  if (user.length !== 1) {
    return res.status(400).send({ mesg: "Error! Please try later" });
  }

  const prePath = './public/images/userAvatars';

  // nếu người dùng đã có avatar thì xóa avatar cũ
  if (user[0].Avatar !== null) {
    await unlink(`./public/${user[0].Avatar}`);
  }

  const newUrl = `${prePath}/${Date.now()}${userID}` + path.extname(file.originalname);
  const [, result] = await Promise.all([
    rename(`${prePath}/${file.filename}`, newUrl),
    userModel.updateUserAvatar(userID, { Avatar: newUrl.replace('./public/', '') }),
  ]);
  return res.status(200).sendFile(path.join(__dirname, '../public', newUrl.replace('./public/', '')));
});

module.exports = router;
