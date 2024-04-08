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
exports.setNewAvatar = exports.getNewAccessToken = exports.changePasswordFromEmailLink = exports.generatePasswordResetTokens = exports.changeUserEmail = exports.verifyEmail = exports.generateEmailVerificationTokens = exports.forgotPasswordDirectly = exports.updateDetails = exports.logoutUser = void 0;
const Student_Models_1 = require("../Models/Student.Models");
const Utilities_1 = require("../Utilities");
const AsyncHandler_1 = require("../Utilities/AsyncHandler");
const Responses_1 = require("../Utilities/Responses");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_Models_1 = require("../Models/User.Models");
const Multer_Middleware_1 = require("../Middleware/Multer.Middleware");
const Workers_1 = require("../Utilities/Workers");
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
exports.generateEmailVerificationTokens = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const student = req.user;
    try {
        const { hashedToken, tokenExpiry, unhashedToken } = yield (0, Utilities_1.generateVerificationTokens)();
        student.emailVerificationToken = hashedToken;
        student.emailVerificationExpiry = tokenExpiry;
        const redirectdLink = `${req.protocol}://${req.get("host")}/verify/email/${unhashedToken}/${student.email}`;
        yield (0, Workers_1.addEmailVerificationQueue)(student.email, redirectdLink, student.name);
        yield student.save({});
        (0, Responses_1.ApiSuccessResponse)(res, 200, "Please check your email ");
    }
    catch (error) {
        next(error);
    }
}));
exports.verifyEmail = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, email } = req.params;
        const isEmailVerifyed = yield User_Models_1.User.findOne({ email });
        if (!isEmailVerifyed) {
            throw new Responses_1.ApiErrorResponse(404, "Email not valid");
        }
        if (isEmailVerifyed.emailVerified === true) {
            throw new Responses_1.ApiErrorResponse(400, "email already verifyed");
        }
        if (isEmailVerifyed.emailVerificationExpiry < Date.now()) {
            throw new Responses_1.ApiErrorResponse(400, "Token expired");
        }
        const hashedToken = yield (0, Utilities_1.unhashedToHashed)(token);
        if (!hashedToken) {
            throw new Responses_1.ApiErrorResponse(400, "Please check the paramiters");
        }
        if (isEmailVerifyed.emailVerificationToken !== hashedToken) {
            throw new Responses_1.ApiErrorResponse(400, "Token not valid");
        }
        isEmailVerifyed.emailVerificationToken = "";
        isEmailVerifyed.emailVerified = true;
        yield isEmailVerifyed.save({ validateBeforeSave: false });
        (0, Responses_1.ApiSuccessResponse)(res, 200, "Successfully verifyed the email");
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
        const { hashedToken, tokenExpiry, unhashedToken } = yield (0, Utilities_1.generateVerificationTokens)();
        isUserFound.forgotPasswordToken = hashedToken;
        isUserFound.forgotPasswordExpiry = tokenExpiry;
        yield isUserFound.save({ validateBeforeSave: false });
        const redirectLink = `${req.protocol}://${req.get("host")}/change/password/link/${unhashedToken}/${email}`;
        yield (0, Workers_1.addResetPasswordEmailQueue)(email, redirectLink, isUserFound.name);
        (0, Responses_1.ApiSuccessResponse)(res, 200, "Email send please check and reset your password", unhashedToken);
    }
    catch (error) {
        next(error);
    }
}));
exports.changePasswordFromEmailLink = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, email } = req.params;
        const { newPassword } = req.body;
        const isUserFound = yield User_Models_1.User.findOne({ email });
        if (!isUserFound) {
            throw new Responses_1.ApiErrorResponse(404, "User not found");
        }
        if (isUserFound.forgotPasswordExpiry < Date.now()) {
            throw new Responses_1.ApiErrorResponse(404, "Token already expired");
        }
        const hashedPassword = yield (0, Utilities_1.hashPassword)(newPassword);
        const hashedToken = yield (0, Utilities_1.unhashedToHashed)(token);
        if (isUserFound.forgotPasswordToken !== hashedToken) {
            throw new Responses_1.ApiErrorResponse(404, "Token not valid ");
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
        user.avatar = filePath;
        yield user.save({ validateBeforeSave: false });
        (0, Responses_1.ApiSuccessResponse)(res, 200, "Avatar set successfully ");
    }
    catch (error) {
        next(error);
    }
}));
