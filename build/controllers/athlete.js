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
const athlete_1 = __importDefault(require("../models/athlete"));
const user_1 = __importDefault(require("../models/user"));
const getAthletes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const athletes = yield athlete_1.default.findAll();
        if (!athletes) {
            const error = new Error("Failed to fetch athletes.");
            error.statusCode = 422;
            throw error;
        }
        ;
        res.status(200).json({
            message: "Successfully fetched athletes",
            athletes: athletes
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch athletes",
            error: error
        });
    }
});
const getAthlete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const params = req.params;
    try {
        const athlete = yield athlete_1.default.findByPk(params.athleteId);
        if (!athlete) {
            return res.status(404).json({
                message: "Athlete with that ID not found",
                id: params.athleteId
            });
        }
        return res.status(200).json({
            message: "Successfully fetched athlete.",
            athlete: athlete
        });
    }
    catch (error) {
        res.status(404).json({
            message: "Failed to fetch athlete.",
            error: error
        });
    }
});
const createAthlete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findOne({
        where: {
            id: req.userId
        }
    });
    if (!user) {
        return res.status(500).json({
            message: "Could not find user."
        });
    }
    if (user.admin === false) {
        return res.status(401).json({
            message: "You are not authorized.",
            user: user
        });
    }
    const body = req.body;
    const wins = body.wins;
    const losses = body.losses;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.data = errors.array();
        return res.status(422).json({
            error: error
        });
    }
    try {
        const athlete = yield athlete_1.default.create({
            firstName: body.firstName,
            lastName: body.lastName,
            nickName: body.nickName,
            age: body.age,
            nationality: body.nationality,
            gender: body.gender,
            wins: wins ? wins : 0,
            losses: losses ? losses : 0
        });
        return res.status(201).json({
            message: "Athlete successfully created.",
            athlete: athlete
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Athlete creation failed."
        });
    }
});
const updateAthlete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findOne({
        where: {
            id: req.userId
        }
    });
    if (!user) {
        return res.status(500).json({
            message: "Could not find user."
        });
    }
    if (user.admin === false) {
        return res.status(401).json({
            message: "You are not authorized.",
            user: user
        });
    }
    const body = req.body;
    const params = req.params;
    try {
        const loadedAthlete = yield athlete_1.default.findByPk(params.athleteId);
        if (!loadedAthlete) {
            return res.status(404).json({
                message: "Athlete with that ID not found."
            });
        }
        if (body.age) {
            loadedAthlete.age = body.age;
        }
        if (body.firstName) {
            loadedAthlete.firstName = body.firstName;
        }
        if (body.lastName) {
            loadedAthlete.lastName = body.lastName;
        }
        if (body.gender) {
            loadedAthlete.gender = body.gender;
        }
        if (body.nationality) {
            loadedAthlete.nationality = body.nationality;
        }
        if (body.wins !== undefined) {
            loadedAthlete.wins = body.wins;
        }
        if (body.losses !== undefined) {
            loadedAthlete.losses = body.losses;
        }
        yield loadedAthlete.save();
        return res.status(200).json({
            message: "Successfully updated athlete.",
            athlete: loadedAthlete
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to update athlete",
            error: error
        });
    }
});
const deleteAthlete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findOne({
        where: {
            id: req.userId
        }
    });
    if (!user) {
        return res.status(500).json({
            message: "Could not find user."
        });
    }
    if (user.admin === false) {
        return res.status(401).json({
            message: "You are not authorized.",
            user: user
        });
    }
    const params = req.params;
    try {
        const result = yield athlete_1.default.destroy({
            where: {
                id: params.athleteId
            },
            force: true
        });
        if (result === 0) {
            return res.status(500).json({
                message: "Failed to delete athlete",
            });
        }
        res.status(200).json({
            message: "Athlete successfully destroyed.",
            result: result
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to delete athlete",
            error: error
        });
    }
});
exports.default = { getAthletes, createAthlete, getAthlete, updateAthlete, deleteAthlete };
