const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

// Email transporter using environment variables
const transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// JWT token creation
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Standardized error handler
const handleErrors = (error) => {
    console.log(error.message, error.code);
    let err = { email: '', password: '', phoneNumber: '', location: '', name: '' };

    // Duplicate email error
    if (error.code === 11000) {
        err.email = 'Email already exists';
        return err;
    }

    // Validation errors
    if (error.message.includes('validation failed')) {
        Object.values(error.errors).forEach(({ properties }) => {
            err[properties.path] = properties.message;
        });
    }

    // Custom auth errors
    if (error.message.includes('Invalid email')) {
        err.email = 'Email not registered';
    }
    if (error.message.includes('password')) {
        err.password = 'Password incorrect';
    }

    return err;
};

// Send OTP verification email
const sendOTPVerificationEmail = async (user, res, purpose = 'verification') => {
    try {
        const otp = user.setOTP(); // Use User model method
        
        // COMMENTED OUT EMAIL SENDING FOR TESTING
        /*
        const subject = purpose === 'reset' ? 'Password Reset' : 'Email Verification';
        const title = purpose === 'reset' ? 'Password Reset' : 'Email Confirmation';
        const message = purpose === 'reset' 
            ? 'to reset your password' 
            : 'to verify your email and complete signup';

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: subject,
            html: `
                <h1>${title}</h1>
                <h2>Hello ${user.name}</h2>
                <p>Please enter <b>${otp}</b> in the app ${message}.</p>
                <p>This code <b>expires in 1 hour</b>.</p>
            `,
        };

        // Hash the OTP before saving
        const salt = await bcrypt.genSalt(12);
        user.otp = await bcrypt.hash(otp, salt);
        await user.save();

        await transport.sendMail(mailOptions);
        */

        // FOR TESTING: Just hash and save OTP, skip email
        const salt = await bcrypt.genSalt(12);
        user.otp = await bcrypt.hash(otp, salt);
        await user.save();

        console.log(`OTP for ${user.email}: ${otp}`); // Show OTP in console for testing

        res.status(200).json({
            success: true,
            message: "User created successfully (email disabled for testing)",
            data: {
                userId: user._id,
                email: user.email,
                otp: otp // Include OTP in response for testing
            }
        });
    } catch (error) {
        console.error('Error in sendOTPVerificationEmail:', error);
        res.status(400).json({
            success: false,
            message: "Failed to create user"
        });
    }
};

// Agency signup
const postSignUp = async (req, res) => {
    try {
        const picture = req.file;
        const { name, email, password, confirmPassword, location, phoneNumber } = req.body;

        // Validate password confirmation
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password confirmation does not match'
            });
        }

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required for agencies'
            });
        }

        const userData = {
            name,
            email,
            password,
            location,
            phoneNumber,
            role: 'Agency',
            picture: picture ? picture.path : null
        };

        const newUser = await User.create(userData);
        res.cookie('userid', newUser._id);

        await sendOTPVerificationEmail(newUser, res);

    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// User signup
const postSignupUser = async (req, res) => {
    try {
        const picture = req.file;
        const { name, email, password, location, sex, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        const userData = {
            name,
            email,
            password,
            location,
            sex,
            role: 'User',
            picture: picture ? picture.path : null
        };

        const newUser = await User.create(userData);
        res.cookie('userid', newUser._id);

        await sendOTPVerificationEmail(newUser, res);

    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Login
const postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.login(email, password);
        const token = createToken(user._id);

        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000
        });
        res.cookie('userid', user._id);

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                location: user.location,
                phoneNumber: user.phoneNumber,
                picture: user.picture,
                rate: user.rate,
                certification: user.certification,
                classification: user.classification,
                sex: user.sex,
                description: user.description,
                birthdayDate: user.birthdayDate,
                role: user.role,
                nbFollowers: user.nbFollowers,
                verified: user.verified
            }
        });

    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Update agency signup (add certification/classification)
const updateSignUp = async (req, res) => {
    try {
        const [certification, classification] = req.files;

        if (!certification || !classification) {
            return res.status(400).json({
                success: false,
                message: 'Both certification and classification files are required'
            });
        }

        const userId = req.cookies.userid;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                certification: certification.path,
                classification: classification.path
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                location: updatedUser.location,
                phoneNumber: updatedUser.phoneNumber,
                picture: updatedUser.picture,
                rate: updatedUser.rate,
                certification: updatedUser.certification,
                classification: updatedUser.classification,
                role: updatedUser.role,
                nbFollowers: updatedUser.nbFollowers
            }
        });

    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Verify OTP
const verifyOTP = async (req, res) => {
    try {
        const { otp, userId } = req.body;

        if (!otp || !userId) {
            return res.status(400).json({
                success: false,
                message: "OTP and user ID are required"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        await user.verifyOTP(otp);

        const token = createToken(user._id);
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            message: "Email verified successfully"
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Resend OTP
const resendOTPVerification = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        await user.clearExpiredOTP();
        await sendOTPVerificationEmail(user, res);

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Forgot password - send OTP
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Email not found"
            });
        }

        await user.clearExpiredOTP();
        await sendOTPVerificationEmail(user, res, 'reset');

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Verify forgot password OTP
const verifyResetOTP = async (req, res) => {
    try {
        const { otp, userId } = req.body;

        if (!otp || !userId) {
            return res.status(400).json({
                success: false,
                message: "OTP and user ID are required"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        // Verify OTP without marking email as verified
        if (!user.otp || !user.otpExpires) {
            return res.status(400).json({
                success: false,
                message: "No OTP found for this user"
            });
        }

        if (user.otpExpires < new Date()) {
            user.otp = null;
            user.otpExpires = null;
            await user.save();
            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }

        const isValid = await bcrypt.compare(otp, user.otp);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // Clear OTP but don't mark as verified
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: "OTP verified successfully"
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Set new password
const setNewPassword = async (req, res) => {
    try {
        const { userId, newPassword, confirmNewPassword } = req.body;

        if (!userId || !newPassword || !confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        user.password = newPassword; // Will be hashed by pre-save hook
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successful"
        });

    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({
            success: false,
            message: err
        });
    }
};

// Logout
const getLogout = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.cookie('userid', '', { maxAge: 1 });
    res.json({
        success: true,
        message: "Logged out successfully"
    });
};

module.exports = {
    postSignUp,
    postLogin,
    updateSignUp,
    postSignupUser,
    getLogout,
    verifyOTP,
    resendOTPVerification,
    forgotPassword,
    verifyResetOTP,
    setNewPassword
};