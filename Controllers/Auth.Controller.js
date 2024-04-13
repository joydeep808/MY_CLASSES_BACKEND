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
exports.generateTokens = exports.generateAccessTokenFromRefreshToken = void 0;
const AsyncHandler_1 = require("../Utilities/AsyncHandler");
const Responses_1 = require("../Utilities/Responses");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.generateAccessTokenFromRefreshToken = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.cookies.refreshToken;
        if (!refreshToken || refreshToken === undefined || refreshToken === "") {
            throw new Responses_1.ApiErrorResponse(401, "Please Login again");
        }
        const { name, role, } = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (!(name && role)) {
            throw new Responses_1.ApiErrorResponse(403, "Refresh token not valid");
        }
        const accessToken = jsonwebtoken_1.default.sign({ name, role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax"
        });
        return res.json("Successfully set");
    }
    catch (error) {
        next(error);
    }
}));
exports.generateTokens = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refreshToken = jsonwebtoken_1.default.sign({ id: "Joydee" }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1d" });
        const accessToken = jsonwebtoken_1.default.sign({ id: "Joydee" }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1m" });
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: true,
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: true,
        });
        return res.json("Okay");
    }
    catch (error) {
        next(error);
    }
}));
