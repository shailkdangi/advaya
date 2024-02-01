const jwt = require('jsonwebtoken');
const userModel = require('../model/userModel');
const {createError} = require('../error.js');

exports.verifyToken = (req, res, next) =>{
    let token = req.headers.authorization || req.headers.token;
    if(!token) return next(createError(401 ,"You are not authenticated!"))
    token = token.replace("Bearer ", "");
    jwt.verify(token , process.env.JWT , (err, user) =>{
        if (err) next(createError(403, "Token is not valid!"))
        req.user = user;
        next() 
    })
}
exports.authenticateToken = async (req, res, next) => {
    try {
        // Get the token from the request headers
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];

        // Verify the token
        const decodedToken = jwt.verify(token, 'your_secret_key');

        // Use the decoded token to identify the user or perform other actions
        const userId = decodedToken.userId;

        // Example query to find user by ID
        const user = await userModel.findUserById(userId);

        if (user) {
            req.user = user; // Set the user object in the request
            next();
        } else {
            return res.status(401).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error authenticating token:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};