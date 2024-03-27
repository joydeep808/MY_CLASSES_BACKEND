"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Demo = void 0;
const mongoose_1 = require("mongoose");
const democlassSchema = new mongoose_1.Schema({
    studentId: {
        type: String,
        required: true,
        ref: "User"
    },
    teacherId: {
        type: String,
        required: true,
        ref: "User"
    },
    subject: {
        type: String,
        required: true,
    },
    currentClass: {
        type: String
    },
    status: {
        type: "String",
        enum: ["PENDING", "SUCCESS", "CENCELLED"],
        default: "PENDING"
    }
}, {
    timestamps: true
});
exports.Demo = (0, mongoose_1.model)("Demo", democlassSchema);
