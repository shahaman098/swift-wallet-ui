"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = void 0;
const validateEnv = (key, fallback, options = {}) => {
    const value = process.env[key] ?? fallback ?? null;
    if (!value && !options.optional) {
        throw new Error(`Environment variable ${key} is required but was not provided.`);
    }
    return value;
};
exports.validateEnv = validateEnv;
