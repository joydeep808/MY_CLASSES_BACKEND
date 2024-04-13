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
exports.demoClassBook = exports.studentInquiredForTeacher = exports.getTeacherByUsername = exports.searchTeacher = exports.applyForTeacherInquary = exports.showTeachers = exports.checkReffralsUsers = exports.StudentLogin = exports.registerAStudent = void 0;
const Student_Models_1 = require("../Models/Student.Models");
const Utilities_1 = require("../Utilities");
const AsyncHandler_1 = require("../Utilities/AsyncHandler");
const Responses_1 = require("../Utilities/Responses");
const crypto_1 = __importDefault(require("crypto"));
const User_Models_1 = require("../Models/User.Models");
const Teacher_Models_1 = require("../Models/Teacher.Models");
const bcrypt_1 = __importDefault(require("bcrypt"));
const Workers_1 = require("../Utilities/Workers");
const RedisConnection_1 = require("../Redis/RedisConnection");
exports.registerAStudent = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, name, phoneNumber, currentClass, reffralId, password } = req.body;
        try {
            const UUID = crypto_1.default.randomUUID().split("-");
            const hashPassword = bcrypt_1.default.hashSync(password, 10);
            const newUser = yield User_Models_1.User.create({
                email,
                name,
                phoneNumber,
                currentClass,
                userName: UUID[4],
                password: hashPassword
            });
            const newStudent = yield Student_Models_1.Student.create({
                studentId: newUser.userName,
                currentClass,
                reffralId: reffralId
            });
            const { otp, tokenExpiry } = yield (0, Utilities_1.generateVerificationTokens)();
            newUser.EmailOtp = otp;
            newUser.emailVerificationExpiry = tokenExpiry;
            // await addOnBoardingEmailQueue(newUser.email ,password ,  UUID[4] , newUser.name)
            yield (0, Workers_1.addEmailVerificationQueue)(newUser.email, otp, newUser.name);
            yield newUser.save();
            yield newStudent.save();
            (0, Responses_1.ApiSuccessResponse)(res, 200, "OTP send to you email ");
        }
        catch (error) {
            if (error.code) {
                if (error.keyPattern.email) {
                    throw new Responses_1.ApiErrorResponse(400, "Email already exist with us");
                }
                throw new Responses_1.ApiErrorResponse(400, "Phone already exist with us");
            }
            throw new Responses_1.ApiErrorResponse(400, error);
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.StudentLogin = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("okay");
        const { email, password } = req.body;
        const isStudentFound = yield User_Models_1.User.findOne({ $or: [{ email }, { userName: email }] }).select("  -refreshToken -forgotPasswordToken -forgotPasswordExpiry -emailVerificationToken -emailVerificationExpiry    ");
        if (!isStudentFound) {
            throw new Responses_1.ApiErrorResponse(404, "No Student Found With this details");
        }
        if (isStudentFound.role !== "STUDENT")
            throw new Responses_1.ApiErrorResponse(400, "You are not able to login in student site");
        if (isStudentFound.isAccountBlocked) {
            throw new Responses_1.ApiErrorResponse(401, "Your Account is Blocked please contact our team");
        }
        if (isStudentFound.emailVerified == false) {
            throw new Responses_1.ApiErrorResponse(403, "Please verify your email");
        }
        if (isStudentFound.isAccountFreez === true && isStudentFound.accountFreezTime > Date.now()) {
            throw new Responses_1.ApiErrorResponse(401, "Your account freezed try again 24 hours for security purpose ");
        }
        const isPasswordValid = yield (0, Utilities_1.isValidPassword)(password, isStudentFound.password);
        if (!isPasswordValid) {
            if (isStudentFound.incorrectPasswordCounter === 0) {
                isStudentFound.isAccountFreez = true;
                yield isStudentFound.save({ validateBeforeSave: false });
                throw new Responses_1.ApiErrorResponse(400, "Your account is freez due to multiple incorrect password tries");
            }
            if (isStudentFound.incorrectPasswordCounter > 0) {
                isStudentFound.incorrectPasswordCounter -= 1;
                yield isStudentFound.save({ validateBeforeSave: false });
                throw new Responses_1.ApiErrorResponse(400, `Your Password is incorrect ${isStudentFound.incorrectPasswordCounter} tries left`);
            }
        }
        const { refreshToken, sessionToken } = yield (0, Utilities_1.generateSessionTokens)(isStudentFound);
        isStudentFound.refreshToken = refreshToken;
        isStudentFound.incorrectPasswordCounter = 5;
        yield isStudentFound.save({ validateBeforeSave: false });
        const Details = {
            name: isStudentFound.name,
            email: isStudentFound.email,
            userName: isStudentFound.userName,
            phone: isStudentFound.phoneNumber,
            role: isStudentFound.role,
            accessToken: sessionToken,
            refreshToken: refreshToken
        };
        return res
            .cookie("accessToken", sessionToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })
            .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })
            .json(new Responses_1.ApiResponse(200, "Login successfully Done ", Details));
    }
    catch (error) {
        next(error);
    }
}));
// export const checkOwnDetails= asyncHandler(async(req,res,next)=>{
//  try {
//    const student = req.user as Document<unknown> & TUser
//    const selectedOptions = {
//      _id:student._id,
//      email:student.email,
//      name:student.name,
//      userName:student.userName,
//      currentClass:student.currentClass,
//      phoneNunber:student.phoneNunber,
//    }
//    ApiSuccessResponse(res , 200 , "Successfully Fetch user details" , selectedOptions)
//  } catch (error) {
//   next(error)
//  }
// })
exports.checkReffralsUsers = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const reffralUsers = yield Student_Models_1.Student.find({ reffralId: user.userName }).select("-password -sessionToken -refreshToken -forgotPasswordToken -forgotPasswordExpiry -emailVerificationToken -emailVerificationExpiry -isAccountFreez -accountFreezTime -incorrectPasswordCounter -isAccountBlocked");
        if (reffralUsers.length === 0) {
            throw new Responses_1.ApiErrorResponse(404, "You haven't reffered any people");
        }
        (0, Responses_1.ApiSuccessResponse)(res, 200, "Successfully Found", reffralUsers);
    }
    catch (error) {
        next(error);
    }
}));
// 1 limit 10 
exports.showTeachers = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { limit = 10, page = 1 } = req.query;
        // if(typeof +limit !== "number" && typeof +page !== "number"){
        //   page = 1
        //   limit = 10
        // }
        // page <= 0 ? page = 1 : page
        // limit <= 0 ? limit = 10 :limit
        // redisConnection.expire("teachers" , 1)
        const catchedValues = yield RedisConnection_1.redisConnection.get("teachers");
        if (catchedValues) {
            const jsonCatchedValue = JSON.parse(catchedValues);
            try {
                const filterdTeacherDetails = jsonCatchedValue.slice(+page - 1 * +limit, +page * +limit);
                return (0, Responses_1.ApiSuccessResponse)(res, 200, "Teachers found from catched", filterdTeacherDetails);
            }
            catch (error) {
                const filterdTeacherDetails = jsonCatchedValue.slice(1, 10);
                return (0, Responses_1.ApiSuccessResponse)(res, 200, "Teachers found from catched", JSON.parse(filterdTeacherDetails));
            }
        }
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
        RedisConnection_1.redisConnection.expire("teachers", 24 * 60 * 1000);
        if (Teachers.length === 0) {
            throw new Responses_1.ApiErrorResponse(404, "No Teacher Found");
        }
        (0, Responses_1.ApiSuccessResponse)(res, 200, "Teacher Found", Teachers);
    }
    catch (error) {
        next(error);
    }
}));
exports.applyForTeacherInquary = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const student = req.user;
        const { teacherId } = req.body;
        if (!teacherId) {
            throw new Responses_1.ApiErrorResponse(400, "Please provide the teacher id ");
        }
        const isTeacherFound = yield Teacher_Models_1.Teacher.findOne({ $and: [{ teacherId }, { status: "SUCCESS" }] });
        if (!isTeacherFound)
            throw new Responses_1.ApiErrorResponse(404, "Teacher not found ");
        const newInquary = yield Student_Models_1.Inquary.create({
            student: student.userName,
            teacher: isTeacherFound.teacherId
        });
        yield newInquary.save();
        (0, Responses_1.ApiSuccessResponse)(res, 200, "Successfully Quary Submited");
    }
    catch (error) {
        next(error);
    }
}));
exports.searchTeacher = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { quary } = req.query;
        if (!quary) {
            throw new Responses_1.ApiErrorResponse(400, "Please provide the valid quary");
        }
        const foundSearchTeacher = yield Teacher_Models_1.Teacher.aggregate([
            {
                $match: {
                    userName: { $regex: quary, $options: 'i' },
                    locality: { $regex: quary, $options: 'i' },
                    status: "SUCCESS"
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
        if (foundSearchTeacher.length === 0)
            throw new Responses_1.ApiErrorResponse(404, "No Teacher Found ");
        (0, Responses_1.ApiSuccessResponse)(res, 200, "Teacher found Teacher ", foundSearchTeacher);
    }
    catch (error) {
        next(error);
    }
}));
exports.getTeacherByUsername = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userName } = req.params;
        const TeacherDetails = yield Teacher_Models_1.Teacher.aggregate([
            {
                $match: {
                    teacherId: userName
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
                            $project: {
                                name: 1,
                                email: 1,
                                phoneNumber: 1
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
        if (TeacherDetails.length === 0) {
            throw new Responses_1.ApiErrorResponse(404, "Teacher not found with this userName");
        }
        (0, Responses_1.ApiSuccessResponse)(res, 200, "Successfully found the teacher", TeacherDetails);
    }
    catch (error) {
        next(error);
    }
}));
exports.studentInquiredForTeacher = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const student = req.user;
        if (student.role !== "STUDENT")
            throw new Responses_1.ApiErrorResponse(401, "You are not able to check because you are not student ");
        const allInquary = yield Student_Models_1.Inquary.aggregate([
            {
                $match: {
                    student: student.userName,
                }
            },
            {
                $lookup: {
                    from: "teachers",
                    localField: "teacher",
                    foreignField: "teacherId",
                    as: "Teachers",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "teacherId",
                                foreignField: "userName",
                                as: "TeachersInfo",
                                pipeline: [
                                    {
                                        $project: {
                                            name: 1,
                                            email: 1,
                                            phoneNumber: 1
                                        },
                                    },
                                ]
                            },
                        },
                        {
                            $addFields: {
                                teacherInfo: { $first: "$TeachersInfo" },
                            },
                        },
                    ],
                },
            },
            {
                $addFields: {
                    Teachers: { $first: "$Teachers" },
                },
            },
        ]);
        if (allInquary.length === 0)
            throw new Responses_1.ApiErrorResponse(404, "You haven't apply for any teacher ");
        (0, Responses_1.ApiSuccessResponse)(res, 200, "Successfully Found", allInquary);
    }
    catch (error) {
        next(error);
    }
}));
exports.demoClassBook = (0, AsyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { TeacherId } = req.body;
}));
