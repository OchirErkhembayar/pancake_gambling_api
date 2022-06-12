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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
        if (confirmedPassword !== password) {
            const error = new Error('Passwords do not match.');
            error.statusCode = 422;
            error.data = [{
                    value: "******",
                    msg: "Passwords do not match!",
                    params: "confirmedPassword",
                    location: "body"
                }];
            return res.status(422).json({
                error: error
            });
        }
        const hashedPw = yield bcrypt_1.default.hash(password, 12);
        const user = yield user_1.default.create({
            email: email,
            username: username,
            password: hashedPw,
            admin: false,
            balance: 1000
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
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const username = body.username;
    const password = body.password;
    try {
        const loadedUser = yield user_1.default.findOne({
            where: { username: username }
        });
        if (!loadedUser) {
            const error = new Error("No user with this username found.");
            error.statusCode = 422;
            throw error;
        }
        const isEqual = yield bcrypt_1.default.compare(password, loadedUser.password);
        if (!isEqual) {
            const error = new Error("Wrong password.");
            error.statusCode = 422;
            throw error;
        }
        const token = jsonwebtoken_1.default.sign({
            email: loadedUser.email,
            userId: loadedUser.id
        }, `${process.env.JWT_PW}`, { expiresIn: '1h' });
        res.status(200).json({
            token: token,
            userId: loadedUser.id
        });
    }
    catch (error) {
        res.status(500).json({
            error: error,
            message: "Failed to login."
        });
    }
});
exports.default = { signup, login };
