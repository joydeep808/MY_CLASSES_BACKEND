"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admission = exports.Teacher = void 0;
const mongoose_1 = require("mongoose");
const TeacherSchema = new mongoose_1.Schema({
    teacherId: {
        type: "String",
        ref: "User"
    },
    description: {
        type: String,
        required: true
    },
    qualification: {
        type: String,
        required: true
    },
    subjectTeaching: {
        type: [String],
        required: true
    },
    classesTeaching: {
        type: String,
        default: "8 to 12",
    },
    teacherSpecializeFor: {
        type: String
    },
    locality: {
        type: String,
        required: true
    },
    completeAddress: {
        type: String,
        required: true
    },
    coverImage: {
        type: [String],
        default: []
    },
    status: {
        type: "String",
        enum: ["SUCCESS", "REJECTED", "PENDING"],
        default: "PENDING"
    },
    teachingExperience: {
        type: String,
    },
    reason: {
        type: String,
    },
}, {
    timestamps: true
});
const admissionSchema = new mongoose_1.Schema({
    teacher: {
        type: String,
        ref: "Teacher"
    },
    student: {
        type: String,
        ref: "User"
    },
    streem: {
        type: String,
    },
    subject: {
        type: String,
    },
    status: {
        type: "String",
        enum: ["DONE", "CENCELLED"]
    }
});
exports.Teacher = (0, mongoose_1.model)("Teacher", TeacherSchema);
exports.Admission = (0, mongoose_1.model)("Admission", admissionSchema);
