import bcrypt from 'bcryptjs';
import User from '../modals/User.js';
import { generateToken } from '../utils/token.js';
import emailService from '../service/nodemailer.service.js';
const AuthController = {
    //register controller
    register: async (req, res) => {
        const { email, password, name, avatar } = req.body;
        try {
            //check if user already exists
            let user = await User.findOne({ email });
            if (user) {
                res.status(400).json({ success: false, msg: 'User already exists' });
                return;
            }
            //create a new user
            user = new User({
                email,
                password,
                name,
                avatar: avatar || '',
            });
            //hash password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            //save user
            await user.save();
            //generate jwt token
            const token = generateToken(user);
            res.json({
                success: true,
                token,
                msg: 'User created successfully',
            });
        }
        catch (error) {
            console.log('error: ', error);
            res.status(500).json({ success: false, msg: 'Server error' });
        }
    },
    //login controller
    login: async (req, res) => {
        const { email, password } = req.body;
        try {
            //find user by email
            const user = await User.findOne({ email });
            if (!user) {
                res.status(400).json({ success: false, msg: 'Invalid credentials' });
                return;
            }
            //verify password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                res.status(400).json({ success: false, msg: 'Invalid credentials' });
                return;
            }
            //generate token
            const token = generateToken(user);
            res.json({
                success: true,
                token,
                msg: 'User logged in successfully',
            });
        }
        catch (error) {
            console.log('error: ', error);
            res.status(500).json({ success: false, msg: 'Server error' });
        }
    },
    //forget password controller
    forgotPassword: async (req, res) => {
        const { email } = req.body;
        try {
            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                res.status(400).json({ success: false, msg: 'User not found' });
                return;
            }
            // Generate 6-digit code instead of long token
            const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
            const resetExpiry = new Date(Date.now() + 600000); // 10 minutes
            // Save code to user
            user.otp = resetCode;
            user.otp_expiry = resetExpiry;
            await user.save();
            // Send email with code
            await emailService.sendPasswordResetEmail(email, resetCode);
            res.json({ success: true, msg: 'Reset code sent to your email' });
        }
        catch (error) {
            console.log('error: ', error);
            res.status(500).json({ success: false, msg: 'Server error' });
        }
    },
    //reset password controller
    resetPassword: async (req, res) => {
        const { otp, password, email } = req.body;
        try {
            // Find user with valid code
            const user = await User.findOne({
                email,
            });
            if (!user ||
                user.otp !== otp ||
                (user.otp_expiry && user.otp_expiry < new Date())) {
                res.status(400).json({ success: false, msg: 'Invalid or expired code' });
                return;
            }
            // Hash new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            // Clear reset code
            user.otp = undefined;
            user.otp_expiry = undefined;
            await user.save();
            res.json({ success: true, msg: 'Password reset successful' });
        }
        catch (error) {
            console.log('error: ', error);
            res.status(500).json({ success: false, msg: 'Server error' });
        }
    },
};
export default AuthController;
//# sourceMappingURL=auth.controller.js.map