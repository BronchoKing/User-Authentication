const User = require('../Model/userModel.js');
const jwt = require('jsonwebtoken');
const util = require('util');            // This imports Node.js's built-in util module. The util module provides helper functions for working with callbacks, objects, strings, debugging, and more.
                                        // One of its most common uses is converting callback-based functions into Promise-based functions using util.promisify().
const cookieParser = require('cookie-parser');



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
        maxAge: 7 * 24 * 60 * 60 * 1000
    }

    res.cookie('jwt', token, options);

    res.status(statusCode).json({
    status: 'success',
    token
  });

}   



exports.userSignup = async (req, res, next) => {
    try {
          //const { fullname, email, password, confirmpassword } = req.body;
          const fullname = req.body.fullname;
          const email = req.body.email;
          const password = req.body.password;
          const confirmpassword = req.body.confirmpassword;
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
            message: "You are not loggied in"
        });
    }

    const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STRING);
    console.log("DECODED TOKEN -->",decodedToken);

    const user = await User.findById(decodedToken.id);

    //console.log("User is: ",user);

    if(!user) {
        return res.status(404).json({
            message: "JWT Token is invalid/non-existent"
        });
    }
    
    next();
}

/*
exports.aboutme = (req, res, next) => {
    console.log("I am Broncho King and I live in the capital City of Ghana – Accra");
}
*/