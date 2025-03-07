const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        validate: {
            validator: function(value) {
                // Email is optional if phone is provided
                return !value || validator.isEmail(value);
            },
            message: "Please enter a valid email"
        },
        sparse: true // Allows null/undefined values but enforces uniqueness for non-null values
    },
    phone: {
        type: String,
        trim: true,
        validate: {
            validator: function(value) {
                // Phone is optional if email is provided
                // Basic phone validation (can be enhanced based on requirements)
                return !value || /^\+?[1-9]\d{9,14}$/.test(value);
            },
            message: "Please enter a valid phone number"
        },
        sparse: true // Allows null/undefined values but enforces uniqueness for non-null values
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false
    },
    coverPic: {
        public_id: String,
        url: String
    },
    profilePic: {
        public_id: String,
        url: String
    },
    website: {
        type: String,
    },
    city: {
        type: String,
    }
}, { timestamps: true });

// Custom validation to ensure either email or phone is provided
userSchema.pre('validate', function(next) {
    if (!this.email && !this.phone) {
        this.invalidate('email', 'Either email or phone number is required');
        this.invalidate('phone', 'Either email or phone number is required');
    }
    next();
});

// remove password before sending off
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;

    return userObject;
}

// hash password before save 
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 8) 
})

// compare password while login 
userSchema.methods.comparePassword = async function (givenPassword) {
    return await bcrypt.compare(givenPassword, this.password);
}

// generate auth token
userSchema.methods.generateAuthToken = function () {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRE} )
}

const User = mongoose.model("user", userSchema);

module.exports = User;