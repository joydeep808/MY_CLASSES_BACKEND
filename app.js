"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const Responses_1 = require("./Utilities/Responses");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
exports.App = (0, express_1.default)();
exports.App.use(express_1.default.static('Public'));
exports.App.use(express_1.default.json());
exports.App.use(express_1.default.urlencoded({ extended: false }));
//
exports.App.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
exports.App.use((0, cookie_parser_1.default)());
dotenv_1.default.config({
    path: ".env"
});
exports.App.listen(process.env.PORT, () => {
    console.log("Successfully Started");
    try {
        mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log("MongoDb connected");
    }
    catch (error) {
        console.log(error);
    }
});
const User_Routes_1 = __importDefault(require("./Routes/User.Routes"));
const Student_Route_1 = __importDefault(require("./Routes/Student.Route"));
const Admin_Routes_1 = __importDefault(require("./Routes/Admin.Routes"));
const Teacher_Routes_1 = __importDefault(require("./Routes/Teacher.Routes"));
const mongoose_1 = __importDefault(require("mongoose"));
exports.App.use("/api/v1/user", User_Routes_1.default);
exports.App.use("/api/v1/student", Student_Route_1.default);
exports.App.use("/api/v1/admin", Admin_Routes_1.default);
exports.App.use("/api/v1/teacher", Teacher_Routes_1.default);
exports.App.use(Responses_1.globleErrorHandler);
