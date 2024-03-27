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
exports.teacherAuthCheck = exports.UserAuthCheck = void 0;
const Teacher_Models_1 = require("../Models/Teacher.Models");
const User_Models_1 = require("../Models/User.Models");
const AsyncHandler_1 = require("../Utilities/AsyncHandler");
const Responses_1 = require("../Utilities/Responses");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.UserAuthCheck = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken)
            throw new Responses_1.ApiErrorResponse(401, "Unauthorized access");
        const { userName } = jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        if (!userName) {
            res.clearCookie("accessToken").clearCookie("refreshToken");
            throw new Responses_1.ApiErrorResponse(401, "Access token invalid");
        }
        const foundUser = yield User_Models_1.User.findOne({ userName });
        if (!foundUser) {
            res.clearCookie("accessToken").clearCookie("refreshToken");
            throw new Responses_1.ApiErrorResponse(404, "No User found");
        }
        if (foundUser.isAccountBlocked) {
            res.clearCookie("sessionToken");
            throw new Responses_1.ApiErrorResponse(401, "User blocked please contact to our team to unblock your account");
        }
        req.user = foundUser;
        next();
    }
    catch (error) {
        next(error);
    }
}));
exports.teacherAuthCheck = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = req.cookies.sessionToken;
        if (!accessToken)
            throw new Responses_1.ApiErrorResponse(401, "Unauthorized access");
        const { userName } = jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        if (!userName) {
            res.clearCookie("sessionToken").clearCookie("refreshToken");
            throw new Responses_1.ApiErrorResponse(401, "Access token invalid");
        }
        const foundUser = yield Teacher_Models_1.Teacher.findOne({ userName });
        if (!foundUser) {
            res.clearCookie("accessToken").clearCookie("refreshToken");
            throw new Responses_1.ApiErrorResponse(404, "No User found");
        }
        if (foundUser.status !== "SUCCESS") {
            res.clearCookie("sessionToken");
            throw new Responses_1.ApiErrorResponse(401, "Your Account is still not verifyed");
        }
        req.teacher = foundUser;
        next();
    }
    catch (error) {
        next(error);
    }
}));
