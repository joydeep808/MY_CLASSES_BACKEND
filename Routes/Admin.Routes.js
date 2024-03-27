"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Admin_Controller_1 = require("../Controllers/Admin.Controller");
const AuthCheck_Middleware_1 = require("../Middleware/AuthCheck.Middleware");
const Router = express_1.default.Router();
Router.route("/register").post(Admin_Controller_1.RegisterAdmin);
Router.use(AuthCheck_Middleware_1.UserAuthCheck);
// Router.use() --> 
Router.route("/unverifyed/Teacher").patch(Admin_Controller_1.VerifyTeacher);
Router.route("/blockUser").patch(Admin_Controller_1.blockUser);
// Router.route("")
exports.default = Router;
