"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reffral = void 0;
const mongoose_1 = require("mongoose");
const ReffralSchem = new mongoose_1.Schema({
    reffralBy: {
        type: String,
        ref: "User",
    },
    reffred: {
        type: String,
        ref: "User",
    }
}, {
    timestamps: true
});
exports.Reffral = (0, mongoose_1.model)("Reffral", ReffralSchem);
