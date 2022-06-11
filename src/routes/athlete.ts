import express from "express";
import { body } from "express-validator";

import athleteController from "../controllers/athlete";

const router = express.Router();

const athleteValidation = [
  body('firstName')
    .trim()
    .not()
    .isEmpty(),
  body('lastName')
    .trim()
    .not()
    .isEmpty(),
  body('age')
    .trim()
    .not()
    .isEmpty(),
  body('nationality')
    .trim()
    .not()
    .isEmpty(),
  body('gender')
    .trim()
    .not()
    .isEmpty()
];

router.get('/all-athletes', athleteController.getAthletes);

router.get('/:athleteId', athleteController.getAthlete);

router.post('/new-athlete', athleteValidation, athleteController.createAthlete);

router.patch('/update/:athleteId', athleteController.updateAthlete);

router.delete('/delete/:athleteId', athleteController.deleteAthlete);

export default router;
