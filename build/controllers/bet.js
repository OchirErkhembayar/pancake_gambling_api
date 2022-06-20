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
const bet_1 = __importDefault(require("../models/bet"));
const match_1 = __importDefault(require("../models/match"));
const match_athlete_1 = __importDefault(require("../models/match-athlete"));
const user_1 = __importDefault(require("../models/user"));
const getAllBets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bets = yield bet_1.default.findAll({
            include: {
                model: match_athlete_1.default,
                include: [
                    match_1.default,
                    athlete_1.default
                ]
            }
        });
        if (!bets) {
            return res.status(500).json({
                message: "Failed to fetch bets."
            });
        }
        return res.status(200).json({
            message: "Successfully retrieved bets.",
            bets: bets
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to retrieve all bets.",
            error: error
        });
    }
});
const getMatchBets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const params = req.params;
    try {
        const matchAthlete = yield match_athlete_1.default.findAll({
            where: {
                matchId: params.matchId
            }
        });
        if (!matchAthlete) {
            return res.status(500).json({
                message: "Could not find match with given ID"
            });
        }
        const bets = yield bet_1.default.findAll({
            where: {
                matchAthleteId: matchAthlete.map(a => a.id)
            },
            include: {
                model: match_athlete_1.default,
                include: [
                    match_1.default,
                    athlete_1.default
                ]
            }
        });
        if (!bets) {
            return res.status(500).json({
                message: "Failed to fetch bets."
            });
        }
        return res.status(200).json({
            message: "Successfully retrieved bets.",
            bets: bets
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to retrieve all bets."
        });
    }
});
const getUserBets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const params = req.params;
    try {
        const bets = yield bet_1.default.findAll({
            where: {
                userId: params.userId
            },
            include: {
                model: match_athlete_1.default,
                include: [
                    match_1.default,
                    athlete_1.default
                ]
            }
        });
        if (!bets) {
            return res.status(500).json({
                message: "Failed to fetch bets."
            });
        }
        return res.status(200).json({
            message: "Successfully retrieved bets.",
            bets: bets
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to retrieve all bets."
        });
    }
});
const getSingleBet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const params = req.params;
    try {
        const bets = yield bet_1.default.findOne({
            where: {
                id: params.betId
            },
            include: {
                model: match_athlete_1.default,
                include: [
                    match_1.default,
                    athlete_1.default
                ]
            }
        });
        if (!bets) {
            return res.status(500).json({
                message: "Failed to fetch bet.",
                bets: bets
            });
        }
        return res.status(200).json({
            message: "Successfully retrieved bet.",
            bets: bets
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to retrieve bet.",
            error: error
        });
    }
});
const createBet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const params = req.params;
    try {
        const user = yield user_1.default.findByPk(params.userId);
        if (!user) {
            return res.status(500).json({
                message: "Could not find user with that ID."
            });
        }
        if (user.balance < body.amount) {
            return res.status(404).json({
                message: "You don't have enough pancakes for this bet."
            });
        }
        const matchAthlete = yield match_athlete_1.default.findOne({
            where: {
                id: params.matchAthleteId
            }
        });
        if (!matchAthlete) {
            return res.status(500).json({
                message: "Failed to find athlete having that match."
            });
        }
        const bet = yield bet_1.default.create({
            amount: body.amount,
            userId: params.userId,
            matchAthleteId: matchAthlete.id
        });
        if (!bet) {
            return res.status(500).json({
                message: "Failed to create bet"
            });
        }
        let betDetails = yield bet_1.default.findOne({
            where: {
                id: bet.id
            },
            include: [{
                    model: match_athlete_1.default,
                    include: [{
                            model: athlete_1.default
                        }]
                }]
        });
        if (!betDetails) {
            return res.status(500).json({
                message: "Bet created. Failed to fetch bet details",
                bet: bet,
                matchAthlete: matchAthlete
            });
        }
        user.balance -= bet.amount;
        yield user.save();
        return res.status(200).json({
            message: "Successfully created bet",
            bet: betDetails
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to create bet"
        });
    }
});
exports.default = { getAllBets, getMatchBets, getUserBets, getSingleBet, createBet };
