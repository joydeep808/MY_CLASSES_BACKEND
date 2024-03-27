"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Student_validator_1 = require("../Validator/Student.validator");
const validate_1 = require("../Validator/validate");
const Student_Controller_1 = require("../Controllers/Student.Controller");
const AuthCheck_Middleware_1 = require("../Middleware/AuthCheck.Middleware");
const Router = express_1.default.Router();
Router.route("/register").post((0, Student_validator_1.RegisterStudentValidator)(), validate_1.validateErrors, Student_Controller_1.registerAStudent);
Router.route("/login").patch((0, Student_validator_1.StudentLoginValidator)(), validate_1.validateErrors, Student_Controller_1.StudentLogin);
Router.route("/check/reffral").get(AuthCheck_Middleware_1.UserAuthCheck, Student_Controller_1.checkReffralsUsers);
Router.route("/showTeachers").get(Student_Controller_1.showTeachers);
Router.route("/inquary/teacher").post(AuthCheck_Middleware_1.UserAuthCheck, Student_Controller_1.applyForTeacherInquary);
Router.route("/search/teacher").get(Student_Controller_1.searchTeacher);
Router.route("/applyed/teacher").get(AuthCheck_Middleware_1.UserAuthCheck, Student_Controller_1.studentAppliedForTeacher);
exports.default = Router;
