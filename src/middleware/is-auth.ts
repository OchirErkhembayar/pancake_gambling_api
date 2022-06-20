import { NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
}

export const authUser = (req: any, res: any, next: NextFunction) => {
  const token = req.headers.authorization.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, `${process.env.JWT_PW}`) as JwtPayload
  } catch (error: any) {
    // error.statusCode = 500;
    return res.status(500).json({
      message: "Failed to authenticate user!",
      error: error
    })
  }
  if (!decodedToken) {
    const error: any = new Error('Not authenticated;');
    error.statusCode = 401;
    return res.status(500).json({
      message: "Failed to authenticate user!",
      error: error
    })
  }
  req.userId = decodedToken.userId;
  next();
};
