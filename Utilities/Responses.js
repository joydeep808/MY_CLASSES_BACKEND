"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globleErrorHandler = exports.ApiSuccessResponse = exports.ApiErrorResponse = exports.ApiResponse = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
class ApiResponse {
    constructor(statusCode, message, data, success) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = true;
    }
}
exports.ApiResponse = ApiResponse;
class ApiErrorResponse extends Error {
    constructor(statusCode, message, stack, errors, success) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
        this.success = false;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.ApiErrorResponse = ApiErrorResponse;
const ApiSuccessResponse = (res, statusCode = 200, message, data) => {
    return res.status(200).json(new ApiResponse(statusCode, message, data));
};
exports.ApiSuccessResponse = ApiSuccessResponse;
function globleErrorHandler(err, req, res, next) {
    if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
        return res.status(401).json({
            statusCode: 401,
            message: "Please login",
            success: false
        });
    }
    if (err instanceof ApiErrorResponse) {
        return res.status(err.statusCode).json({
            statusCode: err.statusCode,
            message: err.message,
            success: err.success
        });
    }
    console.log(err);
    return res.status(500).json({
        statusCode: 500,
        message: "Something went wrong from our side ",
        success: false
    });
}
exports.globleErrorHandler = globleErrorHandler;
