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
const athlete_1 = __importDefault(require("../models/athlete"));
const match_1 = __importDefault(require("../models/match"));
const match_athlete_1 = __importDefault(require("../models/match-athlete"));
const getMatches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const matches = yield match_1.default.findAll();
        if (!matches) {
            return res.status(500).json({
                message: "Failed to fetch matches."
            });
        }
        return res.status(200).json({
            message: "Successfully retrieved matches.",
            matches: matches
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch matches.",
            error: error
        });
    }
});
const getMatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const params = req.params;
    try {
        const match = yield match_1.default.findByPk(params.matchId);
        if (!match) {
            return res.status(500).json({
                message: "Could not find match with that ID."
            });
        }
        const matchAthletes = yield match_athlete_1.default.findAll({
            where: {
                matchId: match.id
            },
            include: athlete_1.default
        });
        if (!matchAthletes) {
            return res.status(500).json({
                message: "Could not find the athletes for that match."
            });
        }
        return res.status(200).json({
            message: "Successfully retrieved match.",
            match: match,
            matchAthletes: matchAthletes
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to retrieve match."
        });
    }
});
const createMatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    try {
        const match = yield match_1.default.create({
            title: body.title,
            description: body.description,
            country: body.country ? body.country : null,
            city: body.city ? body.city : null,
            date: body.date ? body.date : null,
            weightLimit: body.weightLimit ? body.weightLimit : null
        });
        if (!match) {
            return res.status(500).json({
                message: "Failed to create match."
            });
        }
        const athleteOne = yield athlete_1.default.findByPk(body.athleteOne.athleteId);
        if (!athleteOne) {
            return res.status(500).json({
                message: "Couldn't find athlete one with given ID."
            });
        }
        const matchAthleteOne = yield match_athlete_1.default.create({
            matchId: match.id,
            athleteId: athleteOne.id,
            odds: body.athleteOne.odds
        });
        if (!matchAthleteOne) {
            return res.status(500).json({
                message: "Failed to create match-athlete 1 instance."
            });
        }
        const athleteTwo = yield athlete_1.default.findByPk(body.athleteTwo.athleteId);
        if (!athleteTwo) {
            return res.status(500).json({
                message: "Could not find athlete two with that ID."
            });
        }
        const matchAthleteTwo = yield match_athlete_1.default.create({
            matchId: match.id,
            athleteId: athleteTwo.id,
            odds: body.athleteTwo.odds
        });
        if (!matchAthleteTwo) {
            return res.status(500).json({
                message: "Failed to create match-athlete 2 instance."
            });
        }
        return res.status(201).json({
            message: "Match successfully created.",
            match: match,
            matchAthleteOne: matchAthleteOne,
            matchAthleteTwo: matchAthleteTwo
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to create match.",
            error: error
        });
    }
});
const deleteMatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const params = req.params;
    try {
        const resultTwo = yield match_athlete_1.default.destroy({
            where: {
                matchId: params.matchId
            }
        });
        if (resultTwo === 0) {
            return res.status(500).json({
                message: "Failed to delete matchAthletes."
            });
        }
        const result = yield match_1.default.destroy({
            where: {
                id: params.matchId
            }
        });
        if (result === 0) {
            return res.status(500).json({
                message: "Failed to delete match."
            });
        }
        return res.status(200).json({
            message: "Successfully deleted match and match-athletes."
        });
    }
    catch (error) {
    }
});
exports.default = { getMatches, getMatch, createMatch, deleteMatch };
