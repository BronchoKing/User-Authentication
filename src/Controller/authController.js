const User = require('../Model/userModel.js');
const jwtToken = require('../Utils/jwt.js');
const jwt = require('jsonwebtoken');
const util = require('util');            // This imports Node.js's built-in util module. The util module provides helper functions for working with callbacks, objects, strings, debugging, and more.
                                        // One of its most common uses is converting callback-based functions into Promise-based functions using util.promisify().

exports.userSignup = async (req, res, next) => {
    try {
          const {username, email, password, confirmpassword} = req.body;
          const user = await User.create({
          username,
          email,
          password,
          confirmpassword
    });
        return res.status(201).json({
            status: "success",
            data: {
                user
            }
        });

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

        const token = jwtToken(user._id);
        
        res.status(201).json({
            message: "successfully logged in",
            user: user,
            token
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

exports.protect = async (req, res, next) => {
    const _tokenCheck = req.headers.authorization;
    let token;

    if(_tokenCheck && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token){
        return res.status(404).json({
            message: "Undefined token in the header"
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