const express = require('express');
const router = express.Router();


/* GET users listing. */
router.post('/authenticate', (req, res) => {
  console.log("authenticated");
  return res.status(200).end();
});

router.get('/games', function (req, res) {

});
module.exports = router;
