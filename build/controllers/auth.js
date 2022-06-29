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
const sequelize_1 = require("sequelize");
const user_1 = __importDefault(require("../models/user"));
const database_1 = __importDefault(require("../util/database"));
const bet_1 = __importDefault(require("../models/bet"));
const match_athlete_1 = __importDefault(require("../models/match-athlete"));
const athlete_1 = __importDefault(require("../models/athlete"));
const user_friend_1 = __importDefault(require("../models/user-friend"));
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
            message: error.data[0].msg,
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
                error: error,
                message: error.data[0].msg
            });
        }
        const hashedPw = yield bcrypt_1.default.hash(password, 12);
        const user = yield user_1.default.create({
            email: email,
            username: username,
            password: hashedPw,
            admin: false,
            balance: 10000
        });
        const token = jsonwebtoken_1.default.sign({
            email: user.email,
            userId: user.id
        }, `${process.env.JWT_PW}`, { expiresIn: '1h' });
        res.status(201).json({
            message: "User created.",
            token: token,
            userId: user.id
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
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const params = req.params;
    try {
        const user = yield user_1.default.findOne({
            where: {
                id: params.userId
            }
        });
        if (!user) {
            return res.status(500).json({
                message: "Could not find user with that ID."
            });
        }
        ;
        const bets = yield bet_1.default.findAll({
            where: {
                userId: user.id
            },
            include: [{
                    model: match_athlete_1.default,
                    include: [{
                            model: athlete_1.default
                        }]
                }],
            order: database_1.default.col('id')
        });
        if (!bets) {
            return res.status(500).json({
                message: "Failed to retrieve bets for the user."
            });
        }
        const userFriends = yield user_friend_1.default.findAll({
            where: {
                userId: req.userId
            }
        });
        if (!userFriends) {
            return res.status(500).json({
                message: "Failed to find userfriends."
            });
        }
        const myUserFriends = yield Promise.all(userFriends.map((uf) => __awaiter(void 0, void 0, void 0, function* () {
            return (yield user_friend_1.default.findOne({
                where: {
                    friendshipId: uf.friendshipId,
                    userId: {
                        [sequelize_1.Op.not]: req.userId
                    }
                },
                include: [{
                        model: user_1.default,
                        attributes: ['username']
                    }]
            }));
        })));
        if (!myUserFriends) {
            return res.status(500).json({
                message: "Failed to fetch friends."
            });
        }
        return res.status(200).json({
            message: "Successfully found user",
            user: {
                id: user.id,
                balance: user.balance,
                username: user.username,
                bets: bets.reverse(),
                friends: myUserFriends
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to find user with that ID.",
            error: error
        });
    }
});
const richestUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const topUsers = yield user_1.default.findAll({
            order: [['balance', 'DESC']],
            limit: 10
        });
        if (!topUsers) {
            return res.status(500).json({
                message: "Unable to fetch top users."
            });
        }
        return res.status(200).json({
            message: "Successfully fetched top users",
            topUsers: topUsers.map(user => {
                return {
                    username: user.username,
                    balance: user.balance
                };
            })
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch top users",
            error: error
        });
    }
});
exports.default = { signup, login, richestUsers, getUser };
