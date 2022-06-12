import { Request, Response, NextFunction} from "express";
import { validationResult } from "express-validator";
import { IntegerDataType } from "sequelize/types";

import Athlete from "../models/athlete";
import Bet from "../models/bet";
import User from "../models/user";
import Match from "../models/match";
import MatchAthlete from "../models/match-athlete";
import athlete from "./athlete";

type RequestBody = {
  title: string;
  description: string;
  country: string;
  city: string;
  date: Date;
  weightLimit: number;
  athleteOne: athleteObject;
  athleteTwo: athleteObject;
  winnerId: number;
  loserId: number;
}

type athleteObject = {
  athleteId: number;
  odds: number;
}

type RequestParams = {
  matchId: string;
}

const getMatches = async (req: Request, res: Response) => {
  try {
    const matches = await Match.findAll();
    if (!matches) {
      return res.status(500).json({
        message: "Failed to fetch matches."
      });
    }
    return res.status(200).json({
      message: "Successfully retrieved matches.",
      matches: matches
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch matches.",
      error: error
    });
  }
}

const getMatch = async (req: Request, res: Response) => {
  const params = req.params as RequestParams;
  try {
    const match = await Match.findByPk(params.matchId);
    if (!match) {
      return res.status(500).json({
        message: "Could not find match with that ID."
      });
    }
    const matchAthletes = await MatchAthlete.findAll({
      where: {
        matchId: match.id
      },
      include: Athlete
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
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve match."
    });
  }
}

const createMatch = async (req: Request, res: Response) => {
  const body = req.body as RequestBody;
  try {
    const match = await Match.create({
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
    const athleteOne = await Athlete.findByPk(body.athleteOne.athleteId);
    if (!athleteOne) {
      return res.status(500).json({
        message: "Couldn't find athlete one with given ID."
      });
    }
    const matchAthleteOne = await MatchAthlete.create({
      matchId: match.id,
      athleteId: athleteOne.id,
      odds: body.athleteOne.odds
    });
    if (!matchAthleteOne) {
      return res.status(500).json({
        message: "Failed to create match-athlete 1 instance."
      });
    }
    const athleteTwo = await Athlete.findByPk(body.athleteTwo.athleteId);
    if (!athleteTwo) {
      return res.status(500).json({
        message: "Could not find athlete two with that ID."
      });
    }
    const matchAthleteTwo = await MatchAthlete.create({
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
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create match.",
      error: error
    })
  }
}

const matchResult = async (req: Request, res: Response) => {
  const body = req.body as RequestBody;
  try {
    const winner = await MatchAthlete.findByPk(
      body.winnerId,
      { include: Athlete }
      );
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
    const loser = await MatchAthlete.findByPk(
      body.loserId,
      { include: Athlete }
      );
    if (!loser) {
      return res.status(500).json({
        message: "Could not find the loser of the match by ID."
      });
    }
    winner.result = true;
    winner.athlete.wins++;
    loser.result = false;
    loser.athlete.losses++;
    await winner.save();
    await loser.save();
    await winner.athlete.save();
    await loser.athlete.save();
    const wonBets = await Bet.findAll({
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
      let user = await User.findOne({
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
      await user.save();
      await wonBets[i].save();
    }
    const lostBets = await Bet.findAll({
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
      await lostBets[i].save();
    }
    return res.status(500).json({
      message: "Successfully set match results and paid of winnings.",
      winner: winner,
      loser: loser,

    })
  } catch (error) {
    return res.status(500).json({
      message: "Failed to set match winner.",
      error: error
    })
  }
}

const deleteMatch = async (req: Request, res: Response) => {
  const params = req.params as RequestParams;
  try {
    const resultTwo = await MatchAthlete.destroy({
      where: {
        matchId: params.matchId
      }
    });
    if (resultTwo === 0) {
      return res.status(500).json({
        message: "Failed to delete matchAthletes."
      });
    }
    const result = await Match.destroy({
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
  } catch (error) {

  }
}

export default { getMatches, getMatch, createMatch, matchResult, deleteMatch };
