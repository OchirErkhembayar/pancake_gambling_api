import express from "express";
import { body } from "express-validator";

const router = express.Router();

router.get('/all-matches')

router.get('/:matchId')

router.post('/new-match')

router.patch('/result/:matchId')

router.delete('/delete/:matchId')

export default router;
