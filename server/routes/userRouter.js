const express = require('express');
const router = express.Router();

const { userRegister } = require('../controllers/user')

router.post('/register', userRegister);

module.exports = router;