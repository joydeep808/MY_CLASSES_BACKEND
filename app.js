"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const Responses_1 = require("./Utilities/Responses");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
exports.App = (0, express_1.default)();
exports.App.use(express_1.default.static('Public'));
exports.App.use(express_1.default.json());
exports.App.use(express_1.default.urlencoded({ extended: false }));
exports.App.use((0, cors_1.default)({
    origin: "*",
}));
exports.App.use((0, cookie_parser_1.default)());
exports.App.use((0, helmet_1.default)());
exports.App.use(express_1.default.json());
dotenv_1.default.config({
    path: ".env"
});
exports.App.listen(process.env.PORT, () => {
    console.log("Successfully Started");
    try {
        mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log("MongoDb connected" + process.env.PORT);
    }
    catch (error) {
        console.log(error);
    }
});
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    message: "Too many requests comming from the same ip address"
});
exports.App.use(limiter);
const User_Routes_1 = __importDefault(require("./Routes/User.Routes"));
const Student_Route_1 = __importDefault(require("./Routes/Student.Route"));
const Admin_Routes_1 = __importDefault(require("./Routes/Admin.Routes"));
const Teacher_Routes_1 = __importDefault(require("./Routes/Teacher.Routes"));
const mongoose_1 = __importDefault(require("mongoose"));
const Auth_Controller_1 = require("./Controllers/Auth.Controller");
exports.App.get("/tokens", Auth_Controller_1.generateTokens);
exports.App.get("/health", (req, res) => {
    console.log(req.ip);
    return (0, Responses_1.ApiSuccessResponse)(res, 200, "Everything looks fine");
});
exports.App.use("/api/v1/user", User_Routes_1.default);
exports.App.use("/api/v1/student", Student_Route_1.default);
exports.App.use("/api/v1/admin", Admin_Routes_1.default);
exports.App.use("/api/v1/teacher", Teacher_Routes_1.default);
exports.App.use(Responses_1.globleErrorHandler);
