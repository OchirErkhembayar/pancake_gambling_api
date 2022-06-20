import { match } from "assert";
import { Request, Response, NextFunction} from "express";
import { validationResult } from "express-validator";
import { where } from "sequelize/types";
import Athlete from "../models/athlete";

import Bet from "../models/bet";
import Match from "../models/match";
import MatchAthlete from "../models/match-athlete";
import User from "../models/user";

type RequestParams = {
  userId: string;
  matchId: string;
  matchAthleteId: string;
  betId: string;
}

type RequestBody = {
  amount: number;
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
      }
    });
    if (!matchAthlete) {
      return res.status(500).json({
        message: "Failed to find athlete having that match."
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

export default { getAllBets, getMatchBets, getUserBets, getSingleBet, createBet }
