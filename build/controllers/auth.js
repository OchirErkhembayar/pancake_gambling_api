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
const express_validator_1 = require("express-validator");
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = __importDefault(require("../models/user"));
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const email = body.email;
    const username = body.username;
    const password = body.password;
    const confirmedPassword = body.confirmedPassword;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        return res.status(422).json({
            message: "Validation failed",
            error: error
        });
    }
    try {
        const hashedPw = yield bcrypt_1.default.hash(password, 12);
        const user = yield user_1.default.create({
            email: email,
            username: username,
            password: hashedPw,
            admin: false,
            balance: 0
        });
        res.status(201).json({
            message: "User created.",
            user: user
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to create user.",
            error: error
        });
    }
});
exports.default = { signup };
