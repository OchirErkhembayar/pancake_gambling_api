import { Request, Response, NextFunction} from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

import User from "../models/user";
import sequelize from "../util/database";
import Bet from "../models/bet";
import MatchAthlete from "../models/match-athlete";
import Athlete from "../models/athlete";
import Match from "../models/match";
import { token } from "morgan";
import UserFriend from "../models/user-friend";

interface CustomError extends Error {
  statusCode?: number;
  data?: any[];
}

type RequestBody = {
  email: string;
  password: string;
  username: string;
  confirmedPassword?: string;
  token?: string;
}

type RequestParams = {
  userId: string;
}

const signup = async (req: Request, res: Response) => {
  const body = req.body as RequestBody;
  const email = body.email;
  const username = body.username;
  const password = body.password;
  const confirmedPassword = body.confirmedPassword;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.') as CustomError;
    error.statusCode = 422;
    error.data = errors.array();
    return res.status(422).json({
      message: error.data[0].msg,
      error: error
    })
  }
  try {
    if (confirmedPassword !== password) {
      const error = new Error('Passwords do not match.') as CustomError;
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
      })
    }
    const hashedPw = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: email,
      username: username,
      password: hashedPw,
      admin: false,
      balance: 10000
    });
    const token = jwt.sign({
      email: user.email,
      userId: user.id
    }, `${process.env.JWT_PW}`,
    { expiresIn: '1h' });
    res.status(201).json({
      message: "User created.",
      token: token,
      userId: user.id
    })
  } catch (error) {
    res.status(500).json({
      message: "Failed to create user.",
      error: error
    })
  }
};

const login = async (req: Request, res: Response) => {
  const body = req.body as RequestBody;
  const username = body.username;
  const password = body.password;
  try {
    const loadedUser = await User.findOne({
      where: { username: username }
    });
    if (!loadedUser) {
      const error = new Error("No user with this username found.") as CustomError;
      error.statusCode = 422;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, loadedUser.password);
    if (!isEqual) {
      const error = new Error("Wrong password.") as CustomError;
      error.statusCode = 422;
      throw error;
    }
    const token = jwt.sign({
      email: loadedUser.email,
      userId: loadedUser.id
    }, `${process.env.JWT_PW}`,
    { expiresIn: '1h' });
    res.status(200).json({
      token: token,
      userId: loadedUser.id
    });
  } catch (error) {
    res.status(500).json({
      error: error,
      message: "Failed to login."
    })
  }
}

const getUser = async (req: any, res: Response) => {
  const params = req.params as RequestParams;
  try {
    console.log(params.userId);
    const user = await User.findOne({
      where: {
        id: params.userId
      }
    });
    if (!user) {
      return res.status(500).json({
        message: "Could not find user with that ID."
      })
    };
    const bets = await Bet.findAll({
      where: {
        userId: user.id
      },
      include: [{
        model: MatchAthlete,
        include: [{
          model: Athlete
        }]
      }],
      order: sequelize.col('id')
    });
    const userFriends = await UserFriend.findAll({
      where: {
        userId: req.userId
      }
    });
    if (!userFriends) {
      return res.status(500).json({
        message: "Failed to find userfriends."
      });
    }
    const myUserFriends = await Promise.all(userFriends.map(async uf => {
      return (
        await UserFriend.findOne({
          where: {
            friendshipId: uf.friendshipId,
            userId: {
              [Op.not]: req.userId
            }
          },
          include: [{
            model: User,
            attributes: ['username']
          }]
        })
      )
    }));
    if (!myUserFriends) {
      return res.status(500).json({
        message: "Failed to fetch friends."
      })
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
  } catch (error) {
    return res.status(500).json({
      message: "Failed to find user with that ID.",
      error: error
    })
  }
}

const richestUsers = async (req: Request, res: Response) => {
  try {
    const topUsers = await User.findAll({
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
        }
      })
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch top users",
      error: error
    });
  }
}

export default { signup, login, richestUsers, getUser }
