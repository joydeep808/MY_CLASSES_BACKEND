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
exports.deleteImagefromCloudinary = exports.uploadImageinCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const uploadImageinCloudinary = (localFile) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!localFile)
            return null;
        const uplodedImage = yield cloudinary_1.v2.uploader.upload(localFile, {
            resource_type: "auto"
        });
        fs_1.default.unlinkSync(localFile);
        return uplodedImage;
    }
    catch (error) {
        fs_1.default.unlinkSync(localFile);
        return null;
    }
});
exports.uploadImageinCloudinary = uploadImageinCloudinary;
const deleteImagefromCloudinary = (publicId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!publicId)
            return null;
        yield cloudinary_1.v2.api.delete_resources([publicId], {
            resource_type: "image"
        });
        return true;
    }
    catch (error) {
        return null;
    }
});
exports.deleteImagefromCloudinary = deleteImagefromCloudinary;
