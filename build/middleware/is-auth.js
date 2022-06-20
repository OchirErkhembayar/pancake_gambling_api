"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authUser = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jsonwebtoken_1.default.verify(token, `${process.env.JWT_PW}`);
    }
    catch (error) {
        // error.statusCode = 500;
        return res.status(500).json({
            message: "Failed to authenticate user!",
            error: error
        });
    }
    if (!decodedToken) {
        const error = new Error('Not authenticated;');
        error.statusCode = 401;
        return res.status(500).json({
            message: "Failed to authenticate user!",
            error: error
        });
    }
    req.userId = decodedToken.userId;
    next();
};
exports.authUser = authUser;
