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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateErrors = void 0;
const express_validator_1 = require("express-validator");
const Responses_js_1 = require("../Utilities/Responses.js");
const AsyncHandler_1 = require("./../Utilities/AsyncHandler");
exports.validateErrors = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        const extractedErrors = [];
        errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));
        throw new Responses_js_1.ApiErrorResponse(422, extractedErrors);
    }
    catch (error) {
        next(error);
    }
}));
