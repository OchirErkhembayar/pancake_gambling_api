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
const match_1 = __importDefault(require("../models/match"));
const match_athlete_1 = __importDefault(require("../models/match-athlete"));
const private_bet_1 = __importDefault(require("../models/private-bet"));
const private_bet_user_1 = __importDefault(require("../models/private-bet-user"));
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
            },
            include: match_1.default
        });
        if (!matchAthlete) {
            return res.status(500).json({
                message: "Failed to find athlete having that match."
            });
        }
        if (matchAthlete.match.date <= new Date(Date.now() - (3600 * 1000 * 12)) || matchAthlete.result !== null) {
            return res.status(500).json({
                message: "Cannot create bet for this match."
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
const createPrivateBet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    try {
        // Create a private bet
        const amount = +body.myAmount + +body.theirAmount;
        const user = yield user_1.default.findByPk(req.userId);
        if (!user) {
            return res.status(500).json({
                message: "Failed to find user with req.id"
            });
        }
        if (user.balance < body.myAmount) {
            return res.status(500).json({
                message: "Not enough balance."
            });
        }
        const privateBet = yield private_bet_1.default.create({
            pot: amount
        });
        if (!privateBet) {
            return res.status(500).json({
                message: "Failed to create bet"
            });
        }
        // Create my instance of private bet
        const myPrivateBet = yield private_bet_user_1.default.create({
            desiredResult: true,
            confirmed: false,
            amount: body.myAmount,
            privateBetId: privateBet.id,
            userId: req.userId,
            matchAthleteId: body.matchAthleteId,
            sender: true
        });
        if (!myPrivateBet) {
            yield private_bet_1.default.destroy({
                where: {
                    id: privateBet.id
                }
            });
            return res.status(500).json({
                message: "Failed to create my private bet"
            });
        }
        const theirPrivateBet = yield private_bet_user_1.default.create({
            desiredResult: false,
            amount: body.theirAmount,
            confirmed: false,
            privateBetId: privateBet.id,
            userId: body.friendId,
            matchAthleteId: body.matchAthleteId,
            sender: false
        });
        if (!theirPrivateBet) {
            yield myPrivateBet.destroy();
            yield privateBet.destroy();
            return res.status(500).json({
                message: "Failed to create their private bet"
            });
        }
        const finalPrivateBet = yield private_bet_1.default.findOne({
            where: {
                id: myPrivateBet.privateBetId,
            },
            include: [{
                    model: private_bet_user_1.default,
                    include: [
                        {
                            model: user_1.default,
                            attributes: ['username']
                        },
                        {
                            model: match_athlete_1.default,
                            include: [{
                                    model: match_1.default,
                                    include: [{
                                            model: athlete_1.default
                                        }]
                                },
                                {
                                    model: athlete_1.default
                                }]
                        }
                    ]
                }]
        });
        if (!finalPrivateBet) {
            return res.status(500).json({
                message: "Failed to retrieve new private bet"
            });
        }
        user.balance -= myPrivateBet.amount;
        yield user.save();
        return res.status(200).json({
            message: "Successfully created private bet request.",
            privateBet: finalPrivateBet
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create private bet",
            error: error
        });
    }
});
const acceptPrivateBet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    try {
        const privateBet = yield private_bet_1.default.findByPk(body.privateBetId);
        if (!privateBet) {
            return res.status(500).json({
                message: "Failed to find private bet"
            });
        }
        const privateBetUsers = yield private_bet_user_1.default.findAll({
            where: {
                privateBetId: privateBet.id
            }
        });
        if (!privateBetUsers || privateBetUsers.length !== 2) {
            return res.status(500).json({
                message: "Failed to find all private bets"
            });
        }
        for (let i = 0; i < privateBetUsers.length; i++) {
            const user = yield user_1.default.findByPk(privateBetUsers[i].userId);
            if (!user) {
                return res.status(500).json({
                    message: "Failed to find user for privatbetuser"
                });
            }
            if (privateBetUsers[i].userId === req.userId) {
                if (user.balance < privateBetUsers[i].amount) {
                    return res.status(500).json({
                        message: `${user.username} does not have enough balance.`
                    });
                }
                user.balance -= privateBetUsers[i].amount;
                yield user.save();
            }
            privateBetUsers[i].confirmed = true;
            privateBetUsers[i].save();
        }
        const myPrivateBet = privateBetUsers.find(pb => pb.userId === req.userId);
        return res.status(200).json({
            message: "Successfully accepted private bet",
            privateBet: myPrivateBet
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to accept bet."
        });
    }
});
const declinePrivateBet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const privateBet = yield private_bet_1.default.findByPk(body.privateBetId);
        if (!privateBet) {
            return res.status(500).json({
                message: "Failed to find privateBet"
            });
        }
        const privateBetSenderUser = yield private_bet_user_1.default.findOne({
            where: {
                privateBetId: privateBet.id,
                userId: {
                    [sequelize_1.Op.not]: req.userId
                }
            }
        });
        if (!privateBetSenderUser) {
            return res.status(500).json({
                message: "Failed to find the sender privateBetUser instance."
            });
        }
        const sender = yield user_1.default.findByPk(privateBetSenderUser.userId);
        if (!sender) {
            return res.status(500).json({
                message: "Failed to find the sender user instance."
            });
        }
        sender.balance += privateBetSenderUser.amount;
        yield sender.save();
        yield private_bet_user_1.default.destroy({
            where: {
                privatebetId: privateBet.id
            }
        });
        yield privateBet.destroy();
        return res.status(200).json({
            message: "Private bet successfully destroyed"
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to decline private bet.",
            error: error
        });
    }
});
exports.default = { getAllBets, getMatchBets, getUserBets, getSingleBet, createBet, createPrivateBet, acceptPrivateBet, declinePrivateBet };
