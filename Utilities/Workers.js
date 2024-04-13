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
exports.addResetPasswordEmailQueue = exports.addEmailVerificationQueue = exports.addOnBoardingEmailQueue = void 0;
const bullmq_1 = require("bullmq");
const SendMail_1 = require("./SendMail");
const options = {
    host: process.env.REDIS_URL,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
};
const onboardEmailQueue = new bullmq_1.Queue("email_queue", {
    connection: {
        host: options.host,
        port: options.port,
        password: options.password
    },
});
const verificationEmailQueue = new bullmq_1.Queue("verification_email_queue", {
    connection: {
        host: options.host,
        port: options.port,
        password: options.password
    },
});
const resetPasswordEmailQueue = new bullmq_1.Queue("reset_password_queue", {
    connection: {
        host: options.host,
        port: options.port,
        password: options.password
    },
});
function addOnBoardingEmailQueue(email, userName, name) {
    return __awaiter(this, void 0, void 0, function* () {
        yield onboardEmailQueue.add("sendEmail", {
            email,
            userName,
            name
        });
    });
}
exports.addOnBoardingEmailQueue = addOnBoardingEmailQueue;
function addEmailVerificationQueue(email, otp, name) {
    return __awaiter(this, void 0, void 0, function* () {
        yield verificationEmailQueue.add("emailVerification", {
            email,
            otp,
            name,
        });
    });
}
exports.addEmailVerificationQueue = addEmailVerificationQueue;
function addResetPasswordEmailQueue(email, redirectLink, name) {
    return __awaiter(this, void 0, void 0, function* () {
        yield resetPasswordEmailQueue.add("sendResetPasswordEmail", {
            email,
            redirectLink,
            name,
        });
    });
}
exports.addResetPasswordEmailQueue = addResetPasswordEmailQueue;
new bullmq_1.Worker("email_queue", (job) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, SendMail_1.sendEmail)(job.data.email, "Welcome", (0, SendMail_1.WelcomeEmailSend)(job.data.name, job.data.userName));
}), {
    connection: {
        host: options.host,
        port: options.port,
        password: options.password
    }
});
new bullmq_1.Worker("verification_email_queue", (job) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, SendMail_1.sendEmail)(job.data.email, "Email Verification ", (0, SendMail_1.emailVerificationEmailProducer)(job.data.name, job.data.otp));
}), {
    connection: {
        host: options.host,
        port: options.port,
        password: options.password
    }
});
new bullmq_1.Worker("reset_password_queue", (job) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, SendMail_1.sendEmail)(job.data.email, "Welcome", (0, SendMail_1.passwordResetEmail)(job.data.name, job.data.redirectLink));
}), {
    connection: {
        host: options.host,
        port: options.port,
        password: options.password
    }
});
