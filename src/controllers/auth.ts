import { Request, Response, NextFunction} from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import User from "../models/user";

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
      message: "Validation failed",
      error: error
    })
  }
  try {
    const hashedPw = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: email,
      username: username,
      password: hashedPw,
      admin: false,
      balance: 0
    });
    res.status(201).json({
      message: "User created.",
      user: user
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

export default { signup, login }
