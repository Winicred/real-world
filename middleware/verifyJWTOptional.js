const jwt = require('jsonwebtoken');

const verifyJWTOptional = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization

    if (!authHeader || !authHeader?.startsWith('Token ') || !authHeader.split(' ')[1].length) {
        req.loggedIn = false;
        return next();
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) {
                return res.status(403).json({message: 'Your token is invalid.'});
            }

            req.loggedIn = true;
            req.user = decoded.user;
            
            next();
        }
    )
};

module.exports = verifyJWTOptional;