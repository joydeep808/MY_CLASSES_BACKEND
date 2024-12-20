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
const clearCookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/"
};
exports.UserAuthCheck = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken)
            throw new Responses_1.ApiErrorResponse(401, "Unauthorized access");
        try {
            const { userName } = jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            if (!userName) {
                return res.clearCookie("accessToken", { httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    path: "/" }).json(new Responses_1.ApiErrorResponse(401, "Please login again "));
            }
            const foundUser = yield User_Models_1.User.findOne({ userName });
            if (!foundUser) {
                return res.clearCookie("accessToken", { httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    path: "/" }).status(401).json(new Responses_1.ApiErrorResponse(401, "User not found "));
            }
            if (foundUser.isAccountBlocked) {
                return res.clearCookie("accessToken", { httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    path: "/" }).status(401).json(new Responses_1.ApiErrorResponse(401, "User blocked please contact to our team to unblock your account"));
            }
            req.user = foundUser;
            next();
        }
        catch (error) {
            res.clearCookie("accessToken", { httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/" });
            return res.status(401).json(new Responses_1.ApiErrorResponse(401, "invalid access token"));
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.teacherAuthCheck = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken)
            throw new Responses_1.ApiErrorResponse(401, "Unauthorized access");
        const { userName } = jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        if (!userName) {
            res.clearCookie("accessToken", { httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/" });
            return res.status(403).json(new Responses_1.ApiErrorResponse(403, "Please login again"));
        }
        const foundUser = yield Teacher_Models_1.Teacher.findOne({ teacherId: userName });
        if (!foundUser) {
            res.clearCookie("accessToken", { httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/" });
            return res.status(404).json(new Responses_1.ApiErrorResponse(404, "User not found"));
        }
        if (foundUser.status !== "SUCCESS") {
            res.clearCookie("accessToken", { httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/" });
            return res.status(401).json(new Responses_1.ApiErrorResponse(401, "Your Account is still not verifyed"));
        }
        req.teacher = foundUser;
        next();
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
