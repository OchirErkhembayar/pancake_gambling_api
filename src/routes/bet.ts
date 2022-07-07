import express from "express";
import { body } from "express-validator";

import betController from "../controllers/bet";
import { authUser } from "../middleware/is-auth";

const router = express.Router();

router.get('/all-bets', betController.getAllBets);

router.get('/single-user/:userId', betController.getUserBets);

router.get('/single-match/:matchId', betController.getMatchBets);

router.get('/:betId', betController.getSingleBet);

router.post('/create-bet/:userId/:matchAthleteId', authUser, betController.createBet);

router.post('/create', authUser, betController.createPrivateBet);

router.patch('/accept', authUser, betController.acceptPrivateBet);

export default router;
