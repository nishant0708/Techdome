const express = require('express');
const { adminsignUp, adminverifyPasscode, Adminlogin, getallapplication, applicationDecison, applicationdetailsbyId } = require('../Controllers/AdminController');
const verifyToken = require('../MiddleWare/VerifyToken');


const router = express.Router();

router.post('/signup', adminsignUp);
router.post('/verifypasscode',adminverifyPasscode);
router.post('/login', Adminlogin);
router.get("/applications",verifyToken,getallapplication);
router.get('/applicationdetails/:id',verifyToken,applicationdetailsbyId)
router.post('/application/:id/decision', verifyToken,applicationDecison);

module.exports = router;