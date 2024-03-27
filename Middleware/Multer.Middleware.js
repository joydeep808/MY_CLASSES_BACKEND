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
exports.getLocalPath = exports.getStaticFilePath = exports.removeAllFiles = exports.removeFile = exports.uploadLocal = void 0;
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        // This storage needs public/images folder in the root directory
        // Else it will throw an error saying cannot find path public/images
        cb(null, "Public");
    },
    // Store file in a .png/.jpeg/.jpg format instead of binary
    filename: function (req, file, cb) {
        let fileExtension = "";
        const fileDetails = file.originalname.split(".");
        if (fileDetails[1].length > 1) {
            fileExtension = file.originalname.substring(file.originalname.lastIndexOf("."));
        }
        const filenameWithoutExtension = fileDetails[0];
        cb(null, filenameWithoutExtension +
            Date.now() +
            fileExtension);
    },
});
// Middleware responsible to read form data and upload the File object to the mentioned path
exports.uploadLocal = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 1 * 1000 * 1000,
    },
});
const removeFile = (localPath) => __awaiter(void 0, void 0, void 0, function* () {
    if (!localPath)
        return null;
    try {
        yield fs_1.default.unlinkSync(localPath);
        return true;
    }
    catch (error) {
        return null;
    }
});
exports.removeFile = removeFile;
const removeAllFiles = () => __awaiter(void 0, void 0, void 0, function* () {
    const files = fs_1.default.readdirSync('./Public');
    try {
        files.map((path) => __awaiter(void 0, void 0, void 0, function* () {
            fs_1.default.unlinkSync(`./Public/${path}`);
        }));
        return true;
    }
    catch (error) {
        return null;
    }
});
exports.removeAllFiles = removeAllFiles;
const getStaticFilePath = (req, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return `${req.protocol}://${req.get("host")}/${fileName}`;
    }
    catch (error) {
        return null;
    }
});
exports.getStaticFilePath = getStaticFilePath;
const getLocalPath = (fileName) => {
    return `/${fileName}`;
};
exports.getLocalPath = getLocalPath;
