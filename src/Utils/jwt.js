const jwt = require('jsonwebtoken');

const jwtToken = (id) => {
    return jwt.sign(
        {id}, process.env.SECRET_STRING, {expiresIn: process.env.LOGIN_EXPIRES}
    );
}

module.exports = jwtToken;