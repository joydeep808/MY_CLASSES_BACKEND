"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Teacher_validator_1 = require("../Validator/Teacher.validator");
const validate_1 = require("../Validator/validate");
const Teacher_Controllers_1 = require("../Controllers/Teacher.Controllers");
const AuthCheck_Middleware_1 = require("../Middleware/AuthCheck.Middleware");
const Student_validator_1 = require("../Validator/Student.validator");
const Multer_Middleware_1 = require("../Middleware/Multer.Middleware");
const Router = express_1.default.Router();
Router.route("/register").post((0, Teacher_validator_1.RegisterTeacherValidator)(), validate_1.validateErrors, Teacher_Controllers_1.RegisterTeacher);
Router.route("/check/enroll/students").get(AuthCheck_Middleware_1.teacherAuthCheck, Teacher_Controllers_1.checkStudentEnroll);
Router.route("/update/details").patch(AuthCheck_Middleware_1.UserAuthCheck, Teacher_Controllers_1.updateDetailsTeacher);
Router.route("/login").patch((0, Student_validator_1.StudentLoginValidator)(), validate_1.validateErrors, Teacher_Controllers_1.TeacherLogin);
Router.route("/add/coverImage").put(AuthCheck_Middleware_1.teacherAuthCheck, Multer_Middleware_1.uploadLocal.array("coverImage"), Teacher_Controllers_1.addCoverImages);
exports.default = Router;
