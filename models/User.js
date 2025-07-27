const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        validate: [isEmail, 'Please enter a valid email'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    
    // Profile Information
    location: {
        type: String,
        required: [true, 'Please enter your location'],
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    picture: {
        type: String,
        default: null
    },
    sex: {
        type: String,
        enum: ['male', 'female', 'other'],
        lowercase: true
    },
    birthdayDate: {
        type: Date
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        trim: true
    },
    
    // Role & Status
    role: {
        type: String,
        enum: ['User', 'Agency', 'Admin'],
        required: true,
        default: 'User'
    },
    verified: {
        type: Boolean,
        default: false
    },
    isValidated: {
        type: Boolean,
        default: false
    },
    
    // Agency-specific fields
    certification: {
        type: String,
        required: function() { return this.role === 'Agency'; }
    },
    classification: {
        type: String,
        enum: ['Budget', 'Standard', 'Premium', 'Luxury'],
        required: function() { return this.role === 'Agency'; }
    },
    rate: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be negative'],
        max: [5, 'Rating cannot exceed 5']
    },
    nbFollowers: {
        type: Number,
        default: 0,
        min: [0, 'Followers count cannot be negative']
    },
    
    // OTP Verification (embedded - no separate model needed)
    otp: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    },
    confirmationCode: {
        type: String,
        default: null
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ location: 1 });
UserSchema.index({ verified: 1 });

// Hash password before saving (only if modified)
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Static method to login user/agency
UserSchema.statics.login = async function(email, password) {
    if (!email || !password) {
        throw new Error('Email and password are required');
    }

    const user = await this.findOne({ email });
    
    if (!user) {
        throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    return user;
};

// Static method to create OTP
UserSchema.statics.generateOTP = function() {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

// Instance method to set OTP
UserSchema.methods.setOTP = function() {
    this.otp = UserSchema.statics.generateOTP();
    this.otpExpires = new Date(Date.now() + 3600000); // 1 hour from now
    return this.otp;
};

// Instance method to verify OTP
UserSchema.methods.verifyOTP = async function(inputOTP) {
    if (!this.otp || !this.otpExpires) {
        throw new Error('No OTP found for this user');
    }

    if (this.otpExpires < new Date()) {
        this.otp = null;
        this.otpExpires = null;
        await this.save();
        throw new Error('OTP has expired');
    }

    const isValid = await bcrypt.compare(inputOTP, this.otp);
    
    if (!isValid) {
        throw new Error('Invalid OTP');
    }

    // Clear OTP and mark as verified
    this.otp = null;
    this.otpExpires = null;
    this.verified = true;
    await this.save();
    
    return true;
};

// Instance method to clear expired OTP
UserSchema.methods.clearExpiredOTP = async function() {
    if (this.otpExpires && this.otpExpires < new Date()) {
        this.otp = null;
        this.otpExpires = null;
        await this.save();
    }
};

// Virtual for profile completion percentage
UserSchema.virtual('profileCompletion').get(function() {
    let completed = 0;
    const fields = ['name', 'email', 'location', 'phoneNumber', 'description', 'picture'];
    
    fields.forEach(field => {
        if (this[field]) completed++;
    });
    
    return Math.round((completed / fields.length) * 100);
});

// Ensure virtual fields are included in JSON output
UserSchema.set('toJSON', { 
    virtuals: true,
    transform: function(doc, ret) {
        delete ret.password; // Never include password in JSON output
        delete ret.otp; // Never include OTP in JSON output
        return ret;
    }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;