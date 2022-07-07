import { match } from "assert";
import { Request, Response, NextFunction} from "express";
import { validationResult } from "express-validator";
import { where } from "sequelize/types";
import Athlete from "../models/athlete";

import Bet from "../models/bet";
import Match from "../models/match";
import MatchAthlete from "../models/match-athlete";
import PrivateBet from "../models/private-bet";
import PrivateBetUser from "../models/private-bet-user";
import User from "../models/user";

type RequestParams = {
  userId: string;
  matchId: string;
  matchAthleteId: string;
  betId: string;
}

type RequestBody = {
  amount: number;
  odds: number;
  desiredResult: boolean;
  privateBetUserId: number;
  privateBetId: number;
  friendId: number;
}

const getAllBets = async (req: Request, res: Response) => {
  try {
    const bets = await Bet.findAll({
      include: {
        model: MatchAthlete,
        include: [
          Match,
          Athlete
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
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve all bets.",
      error: error
    });
  }
}

const getMatchBets = async (req: Request, res: Response) => {
  const params = req.params as RequestParams;
  try {
    const matchAthlete = await MatchAthlete.findAll({
      where: {
        matchId: params.matchId
      }
    });
    if (!matchAthlete) {
      return res.status(500).json({
        message: "Could not find match with given ID"
      });
    }
    const bets = await Bet.findAll({
      where: {
        matchAthleteId: matchAthlete.map(a => a.id)
      },
      include: {
        model: MatchAthlete,
        include: [
          Match,
          Athlete
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
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve all bets."
    });
  }
}

const getUserBets = async (req: Request, res: Response) => {
  const params = req.params as RequestParams;
  try {
    const bets = await Bet.findAll({
      where: {
        userId: params.userId
      },
      include: {
        model: MatchAthlete,
        include: [
          Match,
          Athlete
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
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve all bets."
    });
  }
}

const getSingleBet = async (req: Request, res: Response) => {
  const params = req.params as RequestParams;
  try {
    const bets = await Bet.findOne({
      where: {
        id: params.betId
      },
      include: {
        model: MatchAthlete,
        include: [
          Match,
          Athlete
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
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve bet.",
      error: error
    });
  }
}

const createBet = async (req: Request, res: Response) => {
  const body = req.body as RequestBody;
  const params = req.params as RequestParams;
  try {
    const user = await User.findByPk(params.userId);
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
    const matchAthlete = await MatchAthlete.findOne({
      where: {
        id: params.matchAthleteId
      },
      include: Match
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
    const bet = await Bet.create({
      amount: body.amount,
      userId: params.userId,
      matchAthleteId: matchAthlete.id
    });
    if (!bet) {
      return res.status(500).json({
        message: "Failed to create bet"
      });
    }
    let betDetails = await Bet.findOne({
      where: {
        id: bet.id
      },
      include: [{
        model: MatchAthlete,
        include: [{
          model: Athlete
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
    await user.save();
    return res.status(200).json({
      message: "Successfully created bet",
      bet: betDetails
    })
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create bet"
    })
  }
}

const createPrivateBet = async (req: any, res: Response) => {
  const body = req.body as RequestBody;
  try {
    // Create a private bet
    // !!! Make sure odds are such that amount * odds = opponent's amount
    const privateBet = await PrivateBet.create();
    if (!privateBet) {
      return res.status(500).json({
        message: "Failed to create bet"
      });
    }
    // Create my instance of private bet
    const myPrivateBet = await PrivateBetUser.create({
      odds: body.odds,
      desiredResult: body.desiredResult,
      confirmed: false,
      amount: body.amount,
      privateBetId: privateBet.id,
      userId: req.userId
    });
    if (!myPrivateBet) {
      await PrivateBet.destroy({
        where: {
          id: privateBet.id
        }
      });
      return res.status(500).json({
        message: "Failed to create my private bet"
      });
    }
    const theirPrivateBet = await PrivateBetUser.create({
      odds: body.odds,
      desiredResult: body.desiredResult,
      amount: body.amount * body.odds,
      confirmed: false,
      privateBetId: privateBet.id,
      userId: body.friendId
    });
    if (!theirPrivateBet) {
      await myPrivateBet.destroy();
      await privateBet.destroy();
      return res.status(500).json({
        message: "Failed to create their private bet"
      });
    }
    return res.status(200).json({
      message: "Successfully created private bet request.",
      privateBet: myPrivateBet
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create private bet",
      error: error
    });
  }
}

const acceptPrivateBet = async (req: any, res: Response) => {
  const body = req.body as RequestBody;
  try {
    const privateBet = await PrivateBet.findByPk(body.privateBetId);
    if (!privateBet) {
      return res.status(500).json({
        message: "Failed to find private bet"
      });
    }
    const privateBetUsers = await PrivateBetUser.findAll({
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
      const user = await User.findByPk(privateBetUsers[i].userId);
      if (!user) {
        return res.status(500).json({
          message: "Failed to find user for privatbetuser"
        });
      }
      if (user.balance < privateBetUsers[i].amount) {
        return res.status(500).json({
          message: `${user.username} does not have enough balance.`
        });
      }
      user.balance -= privateBetUsers[i].amount;
      await user.save();
      privateBetUsers[i].confirmed = true;
      privateBetUsers[i].save();
    }
    privateBet.pot += privateBetUsers.reduce((a, b) => {
      return a + b.amount
    }, 0);
    privateBet.save();
    const myPrivateBet = privateBetUsers.find(pb => pb.userId === req.userId);
    return res.status(200).json({
      message: "Successfully accepted private bet",
      privateBet: myPrivateBet
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to accept bet."
    })
  }
}

export default { getAllBets, getMatchBets, getUserBets, getSingleBet, createBet, createPrivateBet, acceptPrivateBet }
