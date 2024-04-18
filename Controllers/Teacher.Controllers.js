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
exports.removeCoverImages = exports.addCoverImages = exports.TeacherLogin = exports.updateDetailsTeacher = exports.checkStudentEnroll = exports.RegisterTeacher = void 0;
const Teacher_Models_1 = require("../Models/Teacher.Models");
const Utilities_1 = require("../Utilities");
const AsyncHandler_1 = require("../Utilities/AsyncHandler");
const Responses_1 = require("../Utilities/Responses");
const User_Models_1 = require("../Models/User.Models");
const Workers_1 = require("../Utilities/Workers");
const Multer_Middleware_1 = require("../Middleware/Multer.Middleware");
const fs_1 = __importDefault(require("fs"));
exports.RegisterTeacher = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, completeAddress, description, locality, phone, qualification, subjectTeaching, name, password, teacherSpecializeFor, teachingExperience } = req.body;
        try {
            const UUID = yield (0, Utilities_1.generateRandomNumbers)(3);
            const UniqueUTeacherID = `MY${phone.slice(6, 10)}${UUID}`;
            const hashedPassword = yield (0, Utilities_1.hashPassword)(password);
            const { otp, tokenExpiry } = yield (0, Utilities_1.generateVerificationTokens)();
            const newUser = yield User_Models_1.User.create({
                name,
                userName: UniqueUTeacherID,
                password: hashedPassword,
                email,
                phoneNumber: phone,
                role: "TEACHER",
                emailVerificationExpiry: tokenExpiry,
                EmailOtp: otp,
            });
            const newTeacher = yield Teacher_Models_1.Teacher.create({
                teacherId: newUser.userName,
                completeAddress,
                description,
                locality,
                qualification,
                subjectTeaching,
                status: "SUCCESS",
                teacherSpecializeFor,
                teachingExperience,
            });
            yield newUser.save();
            yield newTeacher.save();
            yield (0, Workers_1.addEmailVerificationQueue)(newUser.email, otp, newUser.name);
            return (0, Responses_1.ApiSuccessResponse)(res, 200, "OTP send in your email ");
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
        const teacher = req.teacher;
        const EnrollStudents = yield Teacher_Models_1.Admission.find({ $and: [{ teacher: teacher.teacherId }, { status: "DONE" }] });
        if (EnrollStudents.length === 0)
            throw new Responses_1.ApiErrorResponse(404, "No enroll students found ");
        return (0, Responses_1.ApiSuccessResponse)(res, 200, "Successfully found", EnrollStudents);
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
        return (0, Responses_1.ApiSuccessResponse)(res, 200, "Update changes successfully done!");
    }
    catch (error) {
        next(error);
    }
}));
exports.TeacherLogin = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const isTeacherFound = yield User_Models_1.User.findOne({ $or: [{ email }, { userName: email }] }).select(" -sessionToken -refreshToken -forgotPasswordToken -forgotPasswordExpiry -emailVerificationToken -emailVerificationExpiry");
        if (!isTeacherFound) {
            throw new Responses_1.ApiErrorResponse(404, "Teacher not found with this details");
        }
        if (isTeacherFound.role !== "TEACHER")
            throw new Responses_1.ApiErrorResponse(400, "You are not able to login in student site");
        if (isTeacherFound.isAccountBlocked) {
            throw new Responses_1.ApiErrorResponse(401, "Your Account is Blocked please contact our team");
        }
        if (isTeacherFound.isAccountFreez === true && isTeacherFound.accountFreezTime > Date.now()) {
            throw new Responses_1.ApiErrorResponse(401, "Your account freezed try again 24 hours for security purpose ");
        }
        const isPasswordValid = yield (0, Utilities_1.isValidPassword)(password, isTeacherFound.password);
        if (!isPasswordValid) {
            if (isTeacherFound.incorrectPasswordCounter === 0) {
                isTeacherFound.isAccountFreez = true;
                yield isTeacherFound.save({ validateBeforeSave: false });
                throw new Responses_1.ApiErrorResponse(400, "Your account is freez due to multiple incorrect password tries");
            }
            if (isTeacherFound.incorrectPasswordCounter > 0) {
                isTeacherFound.incorrectPasswordCounter -= 1;
                yield isTeacherFound.save({ validateBeforeSave: false });
                throw new Responses_1.ApiErrorResponse(400, `Your Password is incorrect ${isTeacherFound.incorrectPasswordCounter} tries left`);
            }
        }
        const { refreshToken, sessionToken } = yield (0, Utilities_1.generateSessionTokens)(isTeacherFound);
        isTeacherFound.refreshToken = refreshToken;
        isTeacherFound.incorrectPasswordCounter = 5;
        yield isTeacherFound.save({ validateBeforeSave: false });
        const teacherDetails = {
            name: isTeacherFound.name,
            email: isTeacherFound.email,
            userName: isTeacherFound.userName,
            phone: isTeacherFound.phoneNumber,
        };
        return res
            .cookie("accessToken", sessionToken)
            .cookie("refreshToken", refreshToken)
            .json(new Responses_1.ApiResponse(200, "Login successfully Done ", teacherDetails));
    }
    catch (error) {
        next(error);
    }
}));
exports.addCoverImages = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teacher = req.teacher;
        if (!Array.isArray(req.files)) {
            throw new Responses_1.ApiErrorResponse(400, "Please provide atleast 1 picture");
        }
        if (teacher.coverImage.length >= 10) {
            yield Promise.resolve(req.files.map(item => {
                fs_1.default.unlinkSync(item.path);
            }));
            throw new Responses_1.ApiErrorResponse(200, "You are not able to add cover image because 10 image already added");
        }
        if (teacher.coverImage.length + req.files.length > 10) {
            throw new Responses_1.ApiErrorResponse(400, `Only ${10 - req.files.length} images you can able to add`);
        }
        if (req.files.length === 0) {
            throw new Responses_1.ApiErrorResponse(400, "Please provide atleast 1 picture");
        }
        yield Promise.resolve(req.files.map((item, index) => __awaiter(void 0, void 0, void 0, function* () {
            const filePath = yield (0, Multer_Middleware_1.getStaticFilePath)(req, item.filename);
            if (filePath !== null) {
                teacher.coverImage.push(filePath);
            }
        })));
        yield teacher.save({ validateBeforeSave: false });
        return (0, Responses_1.ApiSuccessResponse)(res, 200, "Cover image successfully done!");
    }
    catch (error) {
        next(error);
    }
}));
exports.removeCoverImages = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Teacher = req.teacher;
        const { imagesLink } = req.body;
        if (imagesLink.length === 0) {
            throw new Responses_1.ApiErrorResponse(400, "Please provide atleast 1 value");
        }
        let removePhotoarr = [];
        yield Promise.resolve(imagesLink.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            if (Teacher.coverImage.includes(item)) {
                Teacher.coverImage = Teacher.coverImage.filter(image => image !== item);
                removePhotoarr.push(item);
            }
        })));
        if (removePhotoarr.length === 0) {
            throw new Responses_1.ApiErrorResponse(400, "Please provide valid image name");
        }
        yield Teacher.save({ validateBeforeSave: false });
        removePhotoarr.map(item => {
            fs_1.default.unlinkSync(item);
        });
        return (0, Responses_1.ApiSuccessResponse)(res, 200, "Successsfully Removed cover images");
    }
    catch (error) {
        next(error);
    }
}));
const monthlyPayment = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
}));
