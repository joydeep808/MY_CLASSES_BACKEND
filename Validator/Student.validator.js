"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplyTeacherInquaryValidator = exports.StudentLoginValidator = exports.RegisterStudentValidator = void 0;
const express_validator_1 = require("express-validator");
const RegisterStudentValidator = () => {
    return [
        (0, express_validator_1.body)("email")
            .trim()
            .notEmpty()
            .withMessage("email required")
            .isEmail()
            .withMessage("Please provide the email "),
        (0, express_validator_1.body)("phoneNumber")
            .notEmpty()
            .withMessage("phone required")
            .isLength({ min: 10, max: 10 })
            .withMessage("Please provide a 10-digit mobile phone number"),
        (0, express_validator_1.body)("name")
            .trim()
            .notEmpty()
            .withMessage("Please provide the full name"),
        (0, express_validator_1.body)("currentClass").trim().notEmpty().withMessage("Please Provide Your Current Class"),
        (0, express_validator_1.body)("reffralId").trim().notEmpty().withMessage("Please Provide the reffral Code")
    ];
};
exports.RegisterStudentValidator = RegisterStudentValidator;
const StudentLoginValidator = () => {
    return [
        (0, express_validator_1.body)("email")
            .trim()
            .notEmpty()
            .withMessage("email required")
            .isEmail()
            .withMessage("Please provide the email "),
        (0, express_validator_1.body)("password")
            .trim()
            .notEmpty()
            .withMessage("password required")
            .isLength({ min: 8, max: 20 })
            .withMessage("Password length should be 8-20 "),
    ];
};
exports.StudentLoginValidator = StudentLoginValidator;
const ApplyTeacherInquaryValidator = () => {
    return [
        (0, express_validator_1.body)("teacherId").trim().notEmpty().withMessage("Teacher id not emapty")
    ];
};
exports.ApplyTeacherInquaryValidator = ApplyTeacherInquaryValidator;
