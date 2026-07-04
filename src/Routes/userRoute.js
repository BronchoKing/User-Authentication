const express = require('express');
const authController = require('../Controller/authController.js');

const router = express.Router();

router.route('/user-signup').post(authController.userSignup);
router.route('/user-login').post(authController.protect, authController.userLogin);


module.exports = router;