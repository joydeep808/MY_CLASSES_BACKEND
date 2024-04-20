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
exports.removeUserProfilePicture = exports.setNewAvatar = exports.getNewAccessToken = exports.changePasswordFromEmailOTP = exports.generatePasswordResetTokens = exports.changeUserEmail = exports.forgotPasswordDirectly = exports.updateDetails = exports.generateResendOTP = exports.verifyEmail = exports.logoutUser = void 0;
const Student_Models_1 = require("../Models/Student.Models");
const Utilities_1 = require("../Utilities");
const AsyncHandler_1 = require("../Utilities/AsyncHandler");
const Responses_1 = require("../Utilities/Responses");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_Models_1 = require("../Models/User.Models");
const Multer_Middleware_1 = require("../Middleware/Multer.Middleware");
const Workers_1 = require("../Utilities/Workers");
const fs_1 = require("fs");
exports.logoutUser = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const student = req.user;
        student.refreshToken = "";
        yield student.save({ validateBeforeSave: false });
        return res.clearCookie("accessToken").clearCookie("refreshToken").json(new Responses_1.ApiResponse(200, "Logout successfully done"));
    }
    catch (error) {
        next(error);
    }
}));
exports.verifyEmail = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        const FoundEmail = yield User_Models_1.User.findOne({ email }).select("-refreshToken -password -forgetPasswordExpiry -forgotPasswordToken -isAccountFreez  -isAccountBlocked");
        if (!FoundEmail) {
            throw new Responses_1.ApiErrorResponse(404, "User not found with this email ");
        }
        if (FoundEmail.incorrectPasswordCounter === 0) {
            throw new Responses_1.ApiErrorResponse(403, "You have reached daily otp tries try again after 24 hours");
        }
        if (FoundEmail.emailVerified) {
            throw new Responses_1.ApiErrorResponse(400, "Your email already verifyed");
        }
        if (otp !== FoundEmail.EmailOtp) {
            const OneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
            if (FoundEmail.emailVerificationExpiry < OneDayAgo) {
                FoundEmail.incorrectPasswordCounter = 4;
                FoundEmail.save({ validateBeforeSave: false });
                throw new Responses_1.ApiErrorResponse(400, `Opt not valid only ${4} tries left`);
            }
            FoundEmail.incorrectPasswordCounter -= 1;
            const incorrectEmailDetails = yield FoundEmail.save({ validateBeforeSave: false });
            throw new Responses_1.ApiErrorResponse(400, `Opt not valid only ${(yield incorrectEmailDetails).incorrectPasswordCounter} tries left`);
        }
        if (FoundEmail.emailVerificationExpiry <= Date.now()) {
            throw new Responses_1.ApiErrorResponse(400, "Otp Expired try again with new OTP");
        }
        FoundEmail.emailVerified = true;
        FoundEmail.incorrectPasswordCounter = 5;
        FoundEmail.save({ validateBeforeSave: false });
        yield (0, Workers_1.addOnBoardingEmailQueue)(FoundEmail.email, FoundEmail.userName, FoundEmail.name);
        (0, Responses_1.ApiSuccessResponse)(res, 200, "Email successfully verifyed", FoundEmail);
    }
    catch (error) {
        next(error);
    }
}));
exports.generateResendOTP = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const FoundUser = yield User_Models_1.User.findOne({ email });
        if (!FoundUser) {
            throw new Responses_1.ApiErrorResponse(404, "User not found with this email");
        }
        if (FoundUser.emailVerified === true) {
            throw new Responses_1.ApiErrorResponse(401, "Email already verifyed");
        }
        const OneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        if (FoundUser.emailVerificationExpiry < OneDayAgo) {
            const { otp, tokenExpiry } = yield (0, Utilities_1.generateVerificationTokens)();
            FoundUser.EmailOtp = otp;
            FoundUser.emailVerificationExpiry = tokenExpiry;
            FoundUser.save({ validateBeforeSave: false });
            yield (0, Workers_1.addEmailVerificationQueue)(FoundUser.email, otp, FoundUser.name);
            (0, Responses_1.ApiSuccessResponse)(res, 200, "OTP send ");
        }
        if (FoundUser.incorrectPasswordCounter === 0) {
            throw new Responses_1.ApiErrorResponse(403, "You have reached your otp tries limit try again 24 hours");
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.updateDetails = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const student = req.user;
        const { name, currentClass, parentsNumber } = req.body;
        if (!(name || currentClass || parentsNumber)) {
            throw new Responses_1.ApiErrorResponse(400, "Please provide atleast one value to update");
        }
        const studentDetails = yield Student_Models_1.Student.findOne({ studentId: student.userName });
        if (!studentDetails)
            throw new Responses_1.ApiErrorResponse(400, "Student not found ");
        name && (student.name = name);
        currentClass && (studentDetails.currentClass = currentClass);
        yield student.save({ validateBeforeSave: false });
        (0, Responses_1.ApiSuccessResponse)(res, 200, "Update changes successfully done!");
    }
    catch (error) {
        next(error);
    }
}));
exports.forgotPasswordDirectly = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const student = req.user;
        const { oldPassword, newPassword } = req.body;
        if (!(oldPassword && newPassword)) {
            throw new Responses_1.ApiErrorResponse(400, "Please provide all the required details ");
        }
        const isPasswordValid = yield (0, Utilities_1.isValidPassword)(oldPassword, student.password);
        if (!isPasswordValid) {
            if (student.incorrectPasswordCounter === 0) {
                student.isAccountFreez = true;
                yield student.save({ validateBeforeSave: false });
                res.status(400).clearCookie("accessToken").clearCookie("refreshToken").json(new Responses_1.ApiResponse(400, "Account Freezed "));
            }
            if (student.incorrectPasswordCounter > 0) {
                student.incorrectPasswordCounter -= 1;
                yield student.save({ validateBeforeSave: false });
                throw new Responses_1.ApiErrorResponse(400, `Your Password is incorrect ${student.incorrectPasswordCounter} tries left`);
            }
        }
        const password = yield (0, Utilities_1.hashPassword)(newPassword);
        student.password = password;
        student.incorrectPasswordCounter = 5;
        yield student.save({ validateBeforeSave: false });
        (0, Responses_1.ApiSuccessResponse)(res, 200, "Password changed successfully done ");
    }
    catch (error) {
        next(error);
    }
}));
exports.changeUserEmail = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { newEmail, password } = req.body;
        if (!(newEmail && password)) {
            throw new Responses_1.ApiErrorResponse(400, "Please fill all the required details ");
        }
        const hashedPassword = yield (0, Utilities_1.hashPassword)(password);
        if (hashedPassword !== user.password) {
            throw new Responses_1.ApiErrorResponse(400, "Incorrect password provided");
        }
        const isEmailFound = yield User_Models_1.User.findOne({ email: newEmail });
        if (isEmailFound) {
            throw new Responses_1.ApiErrorResponse(401, "This email is already exist with us ");
        }
        user.email = newEmail;
        yield user.save({ validateBeforeSave: false });
        (0, Responses_1.ApiSuccessResponse)(res, 200, "Successfully Email Changed ");
    }
    catch (error) {
        next(error);
    }
}));
exports.generatePasswordResetTokens = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const isUserFound = yield User_Models_1.User.findOne({ email });
        if (!isUserFound) {
            throw new Responses_1.ApiErrorResponse(404, "From this email user not found");
        }
        if (isUserFound.emailVerified === false) {
            throw new Responses_1.ApiErrorResponse(400, "You are not able to change the password beacuse email not verifyed ");
        }
        const { otp, tokenExpiry } = yield (0, Utilities_1.generateVerificationTokens)();
        isUserFound.forgotPasswordToken = otp;
        isUserFound.forgotPasswordExpiry = tokenExpiry;
        yield isUserFound.save({ validateBeforeSave: false });
        yield (0, Workers_1.addResetPasswordEmailQueue)(email, otp, isUserFound.name);
        (0, Responses_1.ApiSuccessResponse)(res, 200, "Email send please check and reset your password");
    }
    catch (error) {
        next(error);
    }
}));
exports.changePasswordFromEmailOTP = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otp, email, newPassword } = req.body;
        if (!otp) {
            throw new Responses_1.ApiErrorResponse(400, "Please provide valid otp ");
        }
        if (!email) {
            throw new Responses_1.ApiErrorResponse(400, "Please provide email");
        }
        if (!newPassword) {
            throw new Responses_1.ApiErrorResponse(400, "Please provide the newPassword");
        }
        const isUserFound = yield User_Models_1.User.findOne({ email });
        if (!isUserFound) {
            throw new Responses_1.ApiErrorResponse(404, "User not found");
        }
        if (isUserFound.forgotPasswordExpiry < Date.now()) {
            throw new Responses_1.ApiErrorResponse(404, "OTP already expired");
        }
        const hashedPassword = yield (0, Utilities_1.hashPassword)(newPassword);
        if (isUserFound.forgotPasswordToken !== otp) {
            throw new Responses_1.ApiErrorResponse(404, "OTP not valid ");
        }
        isUserFound.password = hashedPassword;
        isUserFound.forgotPasswordToken = "";
        yield isUserFound.save({ validateBeforeSave: false });
        (0, Responses_1.ApiSuccessResponse)(res, 200, "Successfully reset your password");
    }
    catch (error) {
        next(error);
    }
}));
exports.getNewAccessToken = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const studentRefreshToken = req.cookies.refreshToken;
        if (!studentRefreshToken) {
            throw new Responses_1.ApiErrorResponse(400, "Please Login ");
        }
        const { id } = jsonwebtoken_1.default.verify(studentRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (!id) {
            res.clearCookie("refreshToken");
            throw new Responses_1.ApiErrorResponse(400, "Refresh token not valid");
        }
        const foundStudent = yield User_Models_1.User.findOne({ _id: id });
        if (!foundStudent) {
            throw new Responses_1.ApiErrorResponse(404, "Student not found or student Deleted");
        }
        if (foundStudent.isAccountBlocked) {
            throw new Responses_1.ApiErrorResponse(401, "Your account was blocked please contact to our support");
        }
        const { refreshToken, sessionToken } = yield (0, Utilities_1.generateSessionTokens)(foundStudent);
        foundStudent.refreshToken = refreshToken;
        yield foundStudent.save({ validateBeforeSave: false });
        res.cookie("accessToken", sessionToken).cookie("refreshToken", refreshToken).json(new Responses_1.ApiResponse(200, "Successfully generated "));
    }
    catch (error) {
        next(error);
    }
}));
exports.setNewAvatar = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = req.user;
        if (!((_a = req.file) === null || _a === void 0 ? void 0 : _a.path)) {
            throw new Responses_1.ApiErrorResponse(400, "Please provide the image that you want to set ");
        }
        const filePath = yield (0, Multer_Middleware_1.getStaticFilePath)(req, req.file.filename);
        if (!filePath) {
            throw new Responses_1.ApiErrorResponse(404, "File not found");
        }
        if (!user.avatar) {
            user.avatar = filePath;
            yield user.save({ validateBeforeSave: false });
            return (0, Responses_1.ApiSuccessResponse)(res, 200, "Avatar set successfully ");
        }
        const isFileRemoved = yield (0, Utilities_1.extractTheUrlPath)(user.avatar);
        if (isFileRemoved === false) {
            (0, fs_1.unlinkSync)("Public" + filePath);
        }
        user.avatar = filePath;
        yield user.save({ validateBeforeSave: false });
        return (0, Responses_1.ApiSuccessResponse)(res, 200, "New Profile set");
    }
    catch (error) {
        next(error);
    }
}));
exports.removeUserProfilePicture = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user.avatar)
            throw new Responses_1.ApiErrorResponse(400, "You havn't set profile yet");
        user.avatar = "";
        yield user.save({ validateBeforeSave: false });
        return (0, Responses_1.ApiSuccessResponse)(res, 200, "Successsfully removed profile");
    }
    catch (error) {
        next(error);
    }
}));
