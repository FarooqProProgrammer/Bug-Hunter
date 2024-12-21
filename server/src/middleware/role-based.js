import jwt from 'jsonwebtoken';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import User from '../models/User';

// Middleware to check if the user has the required role
const roleBasedAuth = (...roles) => {
    return async (req, res, next) => {
        try {
            // Get the JWT token from the request headers (Authorization header)
            const token = req.header('Authorization')?.replace('Bearer ', '');
            if (!token) {
                return res.status(StatusCodes.UNAUTHORIZED).json({
                    message: 'Access denied. No token provided.',
                });
            }

            // Verify the token
            const decoded = jwt.verify(token, process.env.SESSION_SECRET);

            // Find the user with the decoded id and check their role
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(StatusCodes.UNAUTHORIZED).json({
                    message: 'User not found',
                });
            }

            // Check if the user role is valid
            if (!roles.includes(user.role)) {
                return res.status(StatusCodes.FORBIDDEN).json({
                    message: 'You do not have permission to access this resource',
                });
            }

            // Attach user to request object
            req.user = user;
            next();
        } catch (error) {
            console.error(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
                error: error.message,
            });
        }
    };
};

export {roleBasedAuth};
