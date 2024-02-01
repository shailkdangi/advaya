const express = require("express");
const router = express.Router();
const userController = require("../Controller/UserController");
const {authenticateToken, verifyToken} = require('../Auth/verify');

// Handle requests to the root path
router.get('/', userController.hello);

// Handle role and phone number request for inserting
router.post('/addphone', userController.addPhone);

// Verify OTP
router.post('/verifyOtp', userController.verifyOtp);

// Insert full name and license
router.post('/userDetail', verifyToken, userController.userDetail);

// Insert user language
router.post('/userlanguage', verifyToken, userController.userlanguage);
// profile
router.post('/profileUpdate', verifyToken, userController.profileUpdate);

module.exports = router;
