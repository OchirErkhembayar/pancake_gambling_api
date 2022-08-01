import express, { NextFunction } from "express";
import { body } from "express-validator";

import betController from "../controllers/bet";
import { authUser } from "../middleware/is-auth";

const router = express.Router();

router.get('/all-bets', betController.getAllBets);

router.get('/single-user/:userId', betController.getUserBets);

router.get('/single-match/:matchId', betController.getMatchBets);

router.get('/:betId', betController.getSingleBet);

router.post('/new-private-bet', authUser, betController.createPrivateBet);

router.post('/create-bet/:userId/:matchAthleteId', authUser, betController.createBet);

router.patch('/accept-private-bet', authUser, betController.acceptPrivateBet);

router.delete('/decline-private-bet', authUser, betController.declinePrivateBet);

export default router;
