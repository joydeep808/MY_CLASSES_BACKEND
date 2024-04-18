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
exports.addDemoVideo = exports.refreshTeacherDetails = exports.rejectTeacherAccount = exports.VerifyTeacher = exports.getAllUnVerifyedTeacher = exports.totalStudentinWebsite = exports.totalTeacherRegisterd = exports.connectUserToTeacher = exports.setYoutubeVideoLink = exports.blockUser = exports.unverifiedTeachers = exports.RegisterAdmin = void 0;
const Teacher_Models_1 = require("../Models/Teacher.Models");
const User_Models_1 = require("../Models/User.Models");
const Utilities_1 = require("../Utilities");
const AsyncHandler_1 = require("../Utilities/AsyncHandler");
const Responses_1 = require("../Utilities/Responses");
const RedisConnection_1 = require("../Redis/RedisConnection");
exports.RegisterAdmin = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, name, phone } = req.body;
        try {
            const UUID = crypto.randomUUID().split("-");
            const password = yield (0, Utilities_1.hashPassword)(UUID[0]);
            const newUser = yield User_Models_1.User.create({
                email,
                name,
                password,
                userName: UUID[4],
                phoneNunber: phone,
                role: "ADMIN"
            });
            yield newUser.save();
        }
        catch (error) {
            if (error.code)
                throw new Responses_1.ApiErrorResponse(402, "Email or phone already exist");
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.unverifiedTeachers = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allTeachers = yield Teacher_Models_1.Teacher.aggregate([
            { $match: { status: "PENDING" } },
            { $lookup: {
                    from: "users",
                    localField: "userName",
                    foreignField: "userName",
                    as: "Teachers"
                } },
            { $addFields: { Teachers: { $first: "$Teachers" } } },
            { $project: {
                    Teachers: {
                        avatar: 1,
                        name: 1,
                        phoneNunber: 1,
                    }
                } }
        ]);
        if (allTeachers.length === 0)
            throw new Responses_1.ApiErrorResponse(404, "No Teacher is found");
        return (0, Responses_1.ApiSuccessResponse)(res, 200, "Successfully Found ", allTeachers);
    }
    catch (error) {
        next(error);
    }
}));
exports.blockUser = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        if (!userId) {
            throw new Responses_1.ApiErrorResponse(400, "Please provide the user id  ");
        }
        const isUserBlocked = yield User_Models_1.User.findOneAndUpdate({ userName: userId }, { $set: { isAccountBlocked: true } }, { new: true });
        if (!isUserBlocked)
            throw new Responses_1.ApiErrorResponse(404, "User not found to block");
        return (0, Responses_1.ApiSuccessResponse)(res, 200, "Successfully blocked a user ");
    }
    catch (error) {
        next(error);
    }
}));
// export const allStudentsSignup
exports.setYoutubeVideoLink = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // set the youtube link to the teacher 
}));
exports.connectUserToTeacher = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
}));
exports.totalTeacherRegisterd = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalTeacher = yield Teacher_Models_1.Teacher.find({ status: "SUCCESS" });
        if (totalTeacher.length === 0)
            throw new Responses_1.ApiErrorResponse(404, "No teacher found ");
        return (0, Responses_1.ApiSuccessResponse)(res, 200, "found", totalTeacher.length);
    }
    catch (error) {
        next(error);
    }
}));
exports.totalStudentinWebsite = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalStudents = yield User_Models_1.User.find({ role: "STUDENT" });
        if (totalStudents.length === 0)
            throw new Responses_1.ApiErrorResponse(404, "No Student found in our website");
        return (0, Responses_1.ApiSuccessResponse)(res, 200, "found", totalStudents.length);
    }
    catch (error) {
        next(error);
    }
}));
exports.getAllUnVerifyedTeacher = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const unverifyedTeachers = yield Teacher_Models_1.Teacher.aggregate([
            {
                $match: {
                    status: "PENDING"
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "teacherId",
                    foreignField: "userName",
                    as: "Teachers",
                    pipeline: [
                        {
                            $match: {
                                emailVerified: true
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    Teachers: { $first: "$Teachers" },
                }
            },
            {
                $project: {
                    teacherId: 1,
                    videoLink: 1,
                    description: 1,
                    qualification: 1,
                    subjectTeaching: 1,
                    completeAddress: 1,
                    locality: 1,
                    status: 1,
                    teachingExperience: 1,
                    Teachers: {
                        email: 1,
                        name: 1,
                        avatar: 1,
                        userName: 1,
                        password: 1,
                        phoneNunber: 1
                    }
                }
            }
        ]);
        if (unverifyedTeachers.length === 0) {
            throw new Responses_1.ApiErrorResponse(404, "No teacher found");
        }
        return (0, Responses_1.ApiSuccessResponse)(res, 200, "found", exports.unverifiedTeachers);
    }
    catch (error) {
        next(error);
    }
}));
exports.VerifyTeacher = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teacherId, status } = req.body;
        if (status !== "SUCCESS")
            throw new Responses_1.ApiErrorResponse(400, "Please ");
        const isTeacherUpdated = yield Teacher_Models_1.Teacher.findOneAndUpdate({ $and: [{ teacherId }] }, { $set: { status } }, { new: true });
        if (!isTeacherUpdated)
            throw new Responses_1.ApiErrorResponse(500, "Details not updated");
        return (0, Responses_1.ApiSuccessResponse)(res, 200, "Teacher verified successfully ");
    }
    catch (error) {
        next(error);
    }
}));
exports.rejectTeacherAccount = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reason, teacherId } = req.body;
        const FoundTeacher = yield Teacher_Models_1.Teacher.findOneAndUpdate({ teacherId }, { $set: { reason, status: "REJECTED" } }, { new: true });
        if (!FoundTeacher) {
            throw new Responses_1.ApiErrorResponse(404, "Teacher not found with this id");
        }
        return (0, Responses_1.ApiSuccessResponse)(res, 200, "Status updated successfully done");
    }
    catch (error) {
        next(error);
    }
}));
exports.refreshTeacherDetails = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Teachers = yield Teacher_Models_1.Teacher.aggregate([
            {
                $match: {
                    status: "SUCCESS",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "teacherId",
                    foreignField: "userName",
                    as: "Teachers",
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    Teachers: { $first: "$Teachers" }
                }
            }
        ]);
        RedisConnection_1.redisConnection.set("teachers", JSON.stringify(Teachers));
        RedisConnection_1.redisConnection.expire("teachers", 24 * 60 * 60 * 1000);
        return (0, Responses_1.ApiSuccessResponse)(res, 200, "Successfully done ");
    }
    catch (error) {
        next(error);
    }
}));
exports.addDemoVideo = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { videoLink, teacherId } = req.body;
        const FoundTeacher = yield Teacher_Models_1.Teacher.findOne({ teacherId });
        if (!FoundTeacher) {
            throw new Responses_1.ApiErrorResponse(404, "Teacher not found with this id");
        }
        FoundTeacher.videoLink.push = videoLink;
        yield FoundTeacher.save({ validateBeforeSave: false });
        return (0, Responses_1.ApiSuccessResponse)(res, 200, "Successfully added video");
    }
    catch (error) {
        next(error);
    }
}));
