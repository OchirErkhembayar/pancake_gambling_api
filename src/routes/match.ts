import { match } from "assert";
import express from "express";
import { body } from "express-validator";

import matchController from "../controllers/match";

const router = express.Router();

router.get('/all-matches', matchController.getMatches);

router.get('/upcoming-matches', matchController.getUpcomingMatches);

router.get('/:matchId', matchController.getMatch);

router.post('/new-match', matchController.createMatch);

router.patch('/result/', matchController.matchResult);

router.delete('/delete/:matchId', matchController.deleteMatch);

export default router;
