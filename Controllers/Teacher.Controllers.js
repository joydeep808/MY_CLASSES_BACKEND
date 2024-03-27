"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDetailsTeacher = exports.checkStudentEnroll = exports.RegisterTeacher = void 0;
const Teacher_Models_1 = require("../Models/Teacher.Models");
const Utilities_1 = require("../Utilities");
const AsyncHandler_1 = require("../Utilities/AsyncHandler");
const crypto_1 = __importDefault(require("crypto"));
const Responses_1 = require("../Utilities/Responses");
const User_Models_1 = require("../Models/User.Models");
exports.RegisterTeacher = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, completeAddress, description, locality, phone, qualification, subjectTeaching, name } = req.body;
        try {
            const UUID = crypto_1.default.randomUUID().split("-");
            const password = yield (0, Utilities_1.hashPassword)(UUID[0]);
            const newUser = yield User_Models_1.User.create({
                name,
                userName: UUID[4],
                password,
                email,
                phoneNumber: phone,
                role: "TEACHER"
            });
            const newTeacher = yield Teacher_Models_1.Teacher.create({
                teacherId: newUser.userName,
                completeAddress,
                description,
                locality,
                qualification,
                subjectTeaching
            });
            yield newUser.save();
            yield newTeacher.save();
            (0, Responses_1.ApiSuccessResponse)(res, 200, "Signup successfully done wait for 48-72 hours to verify");
        }
        catch (error) {
            if (error.keyValue.email) {
                throw new Responses_1.ApiErrorResponse(400, "Email already exist");
            }
            throw new Responses_1.ApiErrorResponse(400, "phone already exist");
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.checkStudentEnroll = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teacher = req.user;
        const EnrollStudents = yield Teacher_Models_1.Admission.find({ $and: [{ teacher: teacher.userName }, { status: "DONE" }] });
        if (EnrollStudents.length === 0)
            throw new Responses_1.ApiErrorResponse(404, "No enroll students found ");
        (0, Responses_1.ApiSuccessResponse)(res, 200, "Successfully found", EnrollStudents);
    }
    catch (error) {
        next(error);
    }
}));
exports.updateDetailsTeacher = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teacher = req.user;
        const AnotherTeacherDetails = yield Teacher_Models_1.Teacher.findOne({ teacherId: teacher.userName });
        if (!AnotherTeacherDetails)
            throw new Responses_1.ApiErrorResponse(404, "Teacher details not found");
        const { completeAddress, description, locality, name } = req.body;
        if (!(name || completeAddress || description || locality)) {
            throw new Responses_1.ApiErrorResponse(400, "Please provide atleast one value to update");
        }
        name && (teacher.name = name);
        description && (AnotherTeacherDetails.description = description);
        locality && (AnotherTeacherDetails.locality = locality);
        completeAddress && (AnotherTeacherDetails.completeAddress = completeAddress);
        yield AnotherTeacherDetails.save({ validateBeforeSave: false });
        (0, Responses_1.ApiSuccessResponse)(res, 200, "Update changes successfully done!");
    }
    catch (error) {
        next(error);
    }
}));
