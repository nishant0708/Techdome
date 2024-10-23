const express = require('express');
const { usersignup, userlogin, Loan, getapplication, paynment } = require('../Controllers/UserController');
const verifyToken = require('../MiddleWare/VerifyToken');

const router = express.Router();

router.post('/signup', usersignup);
router.post('/login', userlogin);
router.post('/apply',verifyToken,Loan);
router.get('/applications/:userId',verifyToken, getapplication);
router.post('/pay', verifyToken, paynment);

module.exports = router;