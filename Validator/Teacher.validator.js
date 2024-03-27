"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterTeacherValidator = void 0;
const express_validator_1 = require("express-validator");
const RegisterTeacherValidator = () => {
    return [
        (0, express_validator_1.body)("email").trim().notEmpty().withMessage("Email is required"),
        (0, express_validator_1.body)("completeAddress").trim().notEmpty().withMessage("Please provide your complete address"),
        (0, express_validator_1.body)("description").trim().notEmpty().withMessage("Please provide description "),
        (0, express_validator_1.body)("locality").trim().notEmpty().withMessage("Please provide locality"),
        (0, express_validator_1.body)("phone")
            .notEmpty()
            .withMessage("phone required")
            .isLength({ min: 10, max: 10 })
            .withMessage("Please provide a 10-digit mobile phone number"),
        (0, express_validator_1.body)("qualification").trim().notEmpty().withMessage("Please provide your qualification"),
        (0, express_validator_1.body)("subjectTeaching").trim().notEmpty().withMessage("Please provide your teaching subjects")
    ];
};
exports.RegisterTeacherValidator = RegisterTeacherValidator;
