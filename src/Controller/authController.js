const User = require('../Model/userModel.js');
const jwt = require('jsonwebtoken');
const util = require('util');            // This imports Node.js's built-in util module. The util module provides helper functions for working with callbacks, objects, strings, debugging, and more.
                                        // One of its most common uses is converting callback-based functions into Promise-based functions using util.promisify().
const cookieParser = require('cookie-parser');
const sendEmail = require('../Util/email.js');
const crypto = require('crypto');



const jwtToken = (id) => {
    return jwt.sign(
        {id}, process.env.SECRET_STRING, {expiresIn: process.env.LOGIN_EXPIRES}
    );
}

const setJWT = (user, statusCode, res) => {
   const token = jwtToken(user._id);

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 6 * 60 * 60 * 1000              // expires in 6 hours
    }

    res.cookie('jwt', token, options);

    res.status(statusCode).json({
    status: 'success',
    token
  });

}   



exports.userSignup = async (req, res, next) => {
    try {
        console.log("REQUEST BODY --->", req.body);

          const { fullname, email, password, confirmpassword } = req.body;
     
          const user = await User.create({
          fullname,
          email,
          password,
          confirmpassword
    });
    
    setJWT(user, 201, res);

    /*   
    return res.status(201).json({
            status: "success",
            data: {
                user
            }
        });
        */

    } catch (error) {
        console.log("ERROR OBJECT --->",error);
        return res.status(400).json({
            status: "fail",
            message: error.message
        });
    }
}

exports.userLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;


        if(!email || !password) {
            return res.status(400).json({
                message: "Incorrect email or password"
            });
        }
        
        const user = await User.findOne({ email: email}).select('password');

        if(!user || !(await user.comparePasswordInDb(password, user.password))) {
            return res.status(404).json({
                message: "Something happened"
            });
        }

        // Calling and setting the JWT token
        setJWT(user, 200, res);
        console.log("COOKIE", req.cookies);
        

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}


exports.protect = async (req, res, next) => {
    /*
    const _tokenCheck = req.headers.authorization;
    let token;

    if(_tokenCheck && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } */

        let token;

        if(req.cookies.jwt){
            token = req.cookies.jwt
        }


    console.log("token ", token)

    if(!token){
        return res.status(404).json({
            status: "fail",
            message: "You are not logged in"
        });
    }

    const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STRING);
    console.log("DECODED TOKEN -->",decodedToken);

    const user = await User.findById(decodedToken.id);

    //console.log("User is: ",user);

    if(!user) {
        return res.status(404).json({
            message: "User no longer exists."
        });
    }

    req.user = user;
    
    next();
}

// Signout controller to sign a user out of a session by clearing JWT cookie from the browser
exports.signOut = async (req, res, next) => {
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: true,
        sameSite: "none", 
        maxAge: 24 * 60 * 60                        // In seconds, equal to 1 day   
    });

    res.status(200).json({
        status: "success",
        message: "Logged out successfully"
    });
}

// Extract user full name
exports.userFullname = async (req, res, next) => {
        let token;

        if(req.cookies.jwt){
            token = req.cookies.jwt
        }

        const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STRING);

        const user = await User.findById(decodedToken.id);

        req.user = user;

     res.json({
        fullname: req.user.fullname.split(' ')[0]
     });

     next();
}

exports.forgotPassword = async (req, res, next) => {
    const user =  await User.findOne({email: req.body.email});

    if(!user){
        return res.status(401).json({
            message: "User not found."
        });
    }

    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    const resetUrl = `https://profitharvester.com/reset-password.html?token=${resetToken}`;
    const message = `We have received a password reset request. Please use the below link to reset your password\n\n${resetUrl}\n\nThis reset password link will expired in 10 minutes.`
    
    try {
        await sendEmail({
            email: user.email,
            subject: 'Password change request received.',
            message: message
        })

        res.status(200).json({
            status: 'success',
            message: 'Password reset link sent. Please check in your email inbox.'
        });
    } catch (error) {

        console.log("FORGOT PASSWORD ---->", error);
        user.passwordResetToken = undefined,
        user.passwordResetTokenExpires = undefined

        await user.save({ validateBeforeSave: false });
    }

    next();
}


exports.resetPassword = async (req, res, next) => {
    try {
        const token = req.params.token;
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetTokenExpires: { $gt: Date.now() }
        });

        if(!user){
            return res.status(400).json({
                status: 'fail',
                message: 'Token is invalid or has expired'
            });
        }

        user.password = req.body.newpassword;
        user.confirmpassword = req.body.confirmpassword;

        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;

        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Password reset successful. Please login.'
        });


    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }

    next();
}



/*
exports.aboutme = (req, res, next) => {
    console.log("I am Broncho King and I live in the capital City of Ghana – Accra");
}
*/