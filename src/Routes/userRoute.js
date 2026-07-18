const express = require('express');
const authController = require('../Controller/authController.js');

const router = express.Router();

router.route('/user-signup').post(authController.userSignup);
router.route('/user-name').get(authController.protect, authController.userFullname);
router.route('/user-signout').post(authController.signOut);
router.route('/forgot-password').post(authController.forgotPassword);
router.route('/reset-password/:token').patch(authController.resetPassword);

/*
router.route('/about-me').post(authController.aboutme);
*/

router.route('/user-login').post(authController.userLogin);


module.exports = router;

