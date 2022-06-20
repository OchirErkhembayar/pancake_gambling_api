import { match } from "assert";
import express from "express";
import { body } from "express-validator";
import { authUser } from "../middleware/is-auth";

import matchController from "../controllers/match";

const router = express.Router();

router.get('/all-matches', matchController.getMatches);

router.get('/upcoming-matches', matchController.getUpcomingMatches);

router.get('/:matchId', matchController.getMatch);

router.post('/new-match', authUser, matchController.createMatch);

router.patch('/result/', authUser, matchController.matchResult);

router.delete('/delete/:matchId', authUser, matchController.deleteMatch);

export default router;
