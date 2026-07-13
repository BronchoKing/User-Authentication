const express = require('express');
const authController = require('../Controller/authController.js');

const router = express.Router();

router.route('/user-signup').post(authController.userSignup);
router.route('/user-name').get(authController.protect, authController.userFullname);
router.route('/user-signout').post(authController.signOut);

/*
router.route('/about-me').post(authController.aboutme);
*/

router.route('/user-login').post(authController.userFullname, authController.userLogin);


module.exports = router;

