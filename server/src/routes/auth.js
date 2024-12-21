import express from "express";
import User from "../models/User.js";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import passport from "passport";
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    try {
        const user = new User({ username, password, email });
        await user.save();

        res.status(StatusCodes.CREATED).json({
            message: getReasonPhrase(StatusCodes.CREATED),
            description: 'User registered successfully!',
        });
    } catch (err) {
        res.status(StatusCodes.BAD_REQUEST).json({
            message: getReasonPhrase(StatusCodes.BAD_REQUEST),
            description: 'Error registering user',
            error: err.message,
        });
    }
});


authRouter.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    const user = req.user; // Extract _id and username from the user object
    const token = jwt.sign(
        { id: user?._id, username: user.username, role: user.role },
        process.env.SESSION_SECRET,
        { expiresIn: '1h' }
    );
    

    // Send the JWT and user info without the password
    res.status(StatusCodes.CREATED).json({
        message: getReasonPhrase(StatusCodes.CREATED),
        token,
        user: { _id, username },
    });
});


authRouter.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        res.send('Logged out');
    });
});


authRouter.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found with this email address' });
        }

        // Create a password reset token (expires in 1 hour)
        const resetToken = jwt.sign({ id: user._id }, process.env.SESSION_SECRET, { expiresIn: '1h' });

        // Create a password reset URL (you would need to replace with your front-end or API route)
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        // Send the reset URL via email (you will need to configure a real email service)
        const transporter = nodemailer.createTransport({
            host: 'smtp',
            port: 587,
            secure: false,  // Use TLS (false means no TLS)
            auth: {
                user: 'your_mailjet_api_key',  // Replace with your Mailjet API Key
                pass: 'your_mailjet_api_secret', // Replace with your Mailjet API Secret
            },
        });

        const mailOptions = {
            to: email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Please click the following link to reset your password: ${resetUrl}`,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: 'Password reset link has been sent to your email' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});


authRouter.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.SESSION_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Set the new password (ensure the password is hashed)
        user.password = newPassword; // You may want to hash the password before saving (e.g. using bcrypt)
        await user.save();

        return res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ message: 'Invalid or expired token' });
    }
});


export default authRouter;
