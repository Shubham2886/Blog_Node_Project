require("dotenv").config();
const user_jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    // get auth header value
    const bearerHeader = req.headers['authorization'];

    // check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        // Format of token 
        // Authorization: Bearer <access_token>
        try {
            //split at the space
            const bearer = bearerHeader.split(' ');
            // get token from array
            const bearerToken = bearer[1];
            // set the token 
            req.token = bearerToken;
            // next middleware 

            const decoded = user_jwt.verify(bearerToken, process.env.JWT_SECRET, (err, result) => {
                if (err) {
                    return "token expried"
                }
                return result
            });
            if (decoded === "token expried") {
                return res.status(401).send({ status: "token", message: "Your Token Is Expried Please Login Again!" })
            }
            req.user = decoded;
            res.locals.userPayload = req.user;
            // return res.json({ payload: req.userdashboard});
        } catch (error) {
            res.locals.userPayload = null;
            return res.status(401).send({ status: "token", message: "Your Token Is Expried Please Login Again!" });
        }

    } else {
        //forbidden
        res.locals.userPayload = null;
        return res.status(403).send({ message: "A token is required for authentication" });
    }

    return next()
};

module.exports = verifyToken;