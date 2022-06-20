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
const sequelize_1 = require("sequelize");
const athlete_1 = __importDefault(require("../models/athlete"));
const bet_1 = __importDefault(require("../models/bet"));
const user_1 = __importDefault(require("../models/user"));
const match_1 = __importDefault(require("../models/match"));
const match_athlete_1 = __importDefault(require("../models/match-athlete"));
const database_1 = __importDefault(require("../util/database"));
const getMatches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const matches = yield match_1.default.findAll({
            include: [{
                    all: true
                }]
        });
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
const getUpcomingMatches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const date = new Date(Date.now() - (3600 * 1000 * 24));
        const matches = yield match_1.default.findAll({
            where: {
                date: {
                    [sequelize_1.Op.gte]: date
                },
                completed: false
            },
            include: [{
                    all: true
                }],
            order: database_1.default.col('date')
        });
        if (!matches) {
            return res.status(500).json({
                message: "Failed to fetch upcoming matches."
            });
        }
        res.status(200).json({
            message: "Upcoming matches successfully retrieved.",
            matches: matches
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch upcoming matches.",
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
// Change req type back to Request when possible
const createMatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
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
    try {
        const match = yield match_1.default.create({
            title: body.title,
            description: body.description,
            country: body.country ? body.country : null,
            city: body.city ? body.city : null,
            date: body.date ? body.date : null,
            weightLimit: body.weightLimit ? body.weightLimit : null,
            completed: false
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
const matchResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
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
    try {
        const winner = yield match_athlete_1.default.findByPk(body.winnerId, { include: athlete_1.default });
        if (!winner) {
            return res.status(500).json({
                message: "Could not find the winner of the match by ID."
            });
        }
        if (winner.result !== null) {
            return res.status(500).json({
                message: "This result of this match has already been decided."
            });
        }
        const match = yield match_1.default.findOne({
            where: {
                id: winner.matchId
            }
        });
        if (!match) {
            return res.status(500).json({
                message: "Could not find match."
            });
        }
        match.completed = true;
        yield match.save();
        const loser = yield match_athlete_1.default.findByPk(body.loserId, { include: athlete_1.default });
        if (!loser) {
            return res.status(500).json({
                message: "Could not find the loser of the match by ID."
            });
        }
        winner.result = true;
        winner.athlete.wins++;
        loser.result = false;
        loser.athlete.losses++;
        yield winner.save();
        yield loser.save();
        yield winner.athlete.save();
        yield loser.athlete.save();
        const wonBets = yield bet_1.default.findAll({
            where: {
                matchAthleteId: winner.id
            }
        });
        if (!wonBets) {
            return res.status(500).json({
                message: "Failed to fetch won bets."
            });
        }
        for (let i = 0; i < wonBets.length; i++) {
            wonBets[i].result = true;
            let user = yield user_1.default.findOne({
                where: {
                    id: wonBets[i].userId
                }
            });
            if (!user) {
                return res.status(500).json({
                    message: `Failed to update balance for ${wonBets[i]}`
                });
            }
            if (winner.odds > 0) {
                wonBets[i].winnings = wonBets[i].amount * (winner.odds / 100);
                user.balance += wonBets[i].winnings;
            }
            if (winner.odds < 0) {
                wonBets[i].winnings = Math.abs(wonBets[i].amount / (winner.odds / 100));
                user.balance += Math.abs(wonBets[i].winnings);
            }
            user.balance += wonBets[i].amount;
            yield user.save();
            yield wonBets[i].save();
        }
        const lostBets = yield bet_1.default.findAll({
            where: {
                matchAthleteId: loser.id
            }
        });
        if (!lostBets) {
            return res.status(500).json({
                message: "Failed to retrieve loser bets."
            });
        }
        for (let i = 0; i < lostBets.length; i++) {
            lostBets[i].result = false;
            lostBets[i].winnings -= lostBets[i].amount;
            yield lostBets[i].save();
        }
        return res.status(500).json({
            message: "Successfully set match results and paid of winnings.",
            winner: winner,
            loser: loser,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to set match winner.",
            error: error
        });
    }
});
const deleteMatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const params = req.params;
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
        return res.status(500).json({
            message: "Failed to delete match.",
            error: error
        });
    }
});
exports.default = { getMatches, getUpcomingMatches, getMatch, createMatch, matchResult, deleteMatch };
