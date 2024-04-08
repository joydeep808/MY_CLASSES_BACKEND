"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true
    },
    userName: {
        type: String,
        required: true,
        index: true,
    },
    password: {
        type: String,
        required: true
    },
    emailVerified: {
        type: Boolean,
        default: false,
        required: true,
    },
    phoneNumber: {
        type: Number,
        required: true,
        unique: true
    },
    refreshToken: {
        type: String
    },
    emailVerificationExpiry: {
        type: Number
    },
    emailVerificationToken: {
        type: String
    },
    forgotPasswordExpiry: {
        type: Number
    },
    forgotPasswordToken: {
        type: String
    },
    isAccountFreez: {
        type: Boolean,
        default: false
    },
    incorrectPasswordCounter: {
        type: Number,
        default: 5
    },
    isAccountBlocked: {
        type: Boolean,
        default: false
    },
    accountFreezTime: {
        type: Number,
    },
    role: {
        type: String,
        enum: ["STUDENT", "TEACHER", "ADMIN"],
        default: "STUDENT"
    }
}, {
    timestamps: true,
});
exports.User = (0, mongoose_1.model)("User", UserSchema);
