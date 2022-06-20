import express from "express";
import { body } from "express-validator";

import athleteController from "../controllers/athlete";
import { authUser } from "../middleware/is-auth";

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

router.post('/new-athlete', authUser, athleteValidation, athleteController.createAthlete);

router.patch('/update/:athleteId', authUser, athleteController.updateAthlete);

router.delete('/delete/:athleteId', authUser, athleteController.deleteAthlete);

export default router;
