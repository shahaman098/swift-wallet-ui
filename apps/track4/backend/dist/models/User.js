"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    walletId: {
        type: String,
        required: true,
    },
    entitySecret: {
        type: String,
        required: true,
    },
    activity: {
        type: [
            {
                type: {
                    type: String,
                    required: true,
                },
                amount: {
                    type: Number,
                    required: true,
                },
                status: {
                    type: String,
                    required: true,
                },
                txHash: String,
                from: String,
                to: String,
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        default: [],
    },
}, { timestamps: true });
userSchema.pre("save", async function (next) {
    if (!this.isModified("passwordHash")) {
        return next();
    }
    const salt = await bcryptjs_1.default.genSalt(10);
    this.passwordHash = await bcryptjs_1.default.hash(this.passwordHash, salt);
    next();
});
userSchema.methods.comparePassword = async function (candidate) {
    return bcryptjs_1.default.compare(candidate, this.passwordHash);
};
exports.User = mongoose_1.default.models.User || mongoose_1.default.model("User", userSchema);
exports.default = exports.User;
