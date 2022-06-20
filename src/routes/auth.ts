import express from "express";
import { body } from "express-validator";

import authController from "../controllers/auth";
import User from "../models/user";
import { authUser } from "../middleware/is-auth";

const router = express.Router();

router.post('/signup',
  [
    body('username')
      .trim()
      .isLength({ min: 5 })
      .custom((value) => {
        return User.findOne({
          where: {
            email: value
          }
        })
          .then(userDoc => {
            if (userDoc) {
              return Promise.reject('Username is already taken.')
            }
          })
      }),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value) => {
        return User.findOne({
          where: {
            email: value
          }
        })
          .then(userDoc => {
            if (userDoc) {
              return Promise.reject('E-Mail is already taken.')
            }
          })
      })
  ],
  authController.signup);

router.post('/login', authController.login);

router.get('/get-user/:userId', authUser, authController.getUser);

router.get('/top', authController.richestUsers);

export default router;
