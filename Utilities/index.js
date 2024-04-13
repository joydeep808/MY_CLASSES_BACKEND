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
exports.unhashedToHashed = exports.generateVerificationTokens = exports.generateRandomNumbers = exports.generateAccessToken = exports.generateSessionTokens = exports.isValidPassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    return bcrypt_1.default.hashSync(password, 10);
});
exports.hashPassword = hashPassword;
const isValidPassword = (password, hashPassword) => __awaiter(void 0, void 0, void 0, function* () {
    return bcrypt_1.default.compareSync(password, hashPassword);
});
exports.isValidPassword = isValidPassword;
const generateSessionTokens = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const sessionToken = jsonwebtoken_1.default.sign({ userName: user.userName, email: user.email, role: user.role }, process.env.ACCESS_TOKEN_SECRET);
    const refreshToken = jsonwebtoken_1.default.sign({ id: user._id, name: user.name, role: user.role }, process.env.REFRESH_TOKEN_SECRET);
    return { sessionToken, refreshToken };
});
exports.generateSessionTokens = generateSessionTokens;
const generateAccessToken = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const sessionToken = jsonwebtoken_1.default.sign({ userName: user.userName, email: user.email, role: user.role }, process.env.ACCESS_TOKEN_SECRET);
    return sessionToken;
});
exports.generateAccessToken = generateAccessToken;
const generateRandomNumbers = (length = 4) => {
    let generateNumber = "";
    for (let index = 0; index < length; index++) {
        generateNumber += Number(Math.floor(Math.random() * 9));
    }
    return generateNumber;
};
exports.generateRandomNumbers = generateRandomNumbers;
const generateVerificationTokens = () => __awaiter(void 0, void 0, void 0, function* () {
    const tokenExpiry = Date.now() + 10 * 60 * 1000;
    const otp = (0, exports.generateRandomNumbers)();
    return { tokenExpiry, otp };
});
exports.generateVerificationTokens = generateVerificationTokens;
const unhashedToHashed = (unhashedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedToken = yield crypto_1.default.createHash("sha-256").update(unhashedToken).digest("hex");
    return hashedToken;
});
exports.unhashedToHashed = unhashedToHashed;
