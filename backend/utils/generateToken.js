const jwt = require("jsonwebtoken");

//json web token is used to generate token for authentication and authorization of user and admin
// it takes user data and secret key from environment variable and generates a token that expires in 1 day

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
};
// jwt 3 parts - header, payload, signature
// header - algorithm and token type hs256,jwt
// payload - user data like id, role, email etc
// signature - header + payload + secret key    
module.exports = generateToken;
