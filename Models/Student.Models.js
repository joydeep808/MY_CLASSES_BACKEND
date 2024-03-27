"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inquary = exports.Student = void 0;
const mongoose_1 = require("mongoose");
const Constraints_1 = require("./Constraints");
const StudentSchema = new mongoose_1.Schema({
    studentId: {
        type: String,
        ref: "User",
        index: true
    },
    reffralId: {
        type: String,
        required: true
    },
    currentClass: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: Constraints_1.GENDER_ENUM
    },
}, {
    timestamps: true,
});
const inquaryFromStudent = new mongoose_1.Schema({
    student: {
        type: String,
        ref: "User"
    },
    teacher: {
        type: String,
        ref: "Teacher"
    },
    status: {
        type: "String",
        enum: ["PENDING", "DONE", "REJECTED"]
    }
});
exports.Student = (0, mongoose_1.model)("Student", StudentSchema);
exports.Inquary = (0, mongoose_1.model)("Inquary", inquaryFromStudent);
