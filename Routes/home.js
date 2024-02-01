const express = require("express");
const router = express.Router();
const userController = require("../Controller/homeController");
const {authenticateToken, verifyToken} = require('../Auth/verify');

router.post('/homepage', verifyToken, userController.homepage);