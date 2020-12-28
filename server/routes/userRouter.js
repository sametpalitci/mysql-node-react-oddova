const express = require('express');
const router = express.Router();

const {
    userRegister,
    userLogin,
    userForgotPassword,
    userForgotPasswordShow,
    userForgotPasswordChange
} = require('../controllers/user')

router.post('/register', userRegister);
router.post('/login', userLogin);
router.post('/forgotPassword', userForgotPassword);
router.post('/parolami-sifirla/:token', userForgotPasswordChange);

router.get('/parolami-sifirla/:token', userForgotPasswordShow);

module.exports = router;