"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const athlete_1 = __importDefault(require("../controllers/athlete"));
const router = express_1.default.Router();
const athleteValidation = [
    (0, express_validator_1.body)('firstName')
        .trim()
        .not()
        .isEmpty(),
    (0, express_validator_1.body)('lastName')
        .trim()
        .not()
        .isEmpty(),
    (0, express_validator_1.body)('age')
        .trim()
        .not()
        .isEmpty(),
    (0, express_validator_1.body)('nationality')
        .trim()
        .not()
        .isEmpty(),
    (0, express_validator_1.body)('gender')
        .trim()
        .not()
        .isEmpty()
];
router.get('/all-athletes', athlete_1.default.getAthletes);
router.get('/:athleteId', athlete_1.default.getAthlete);
router.post('/new-athlete', athleteValidation, athlete_1.default.createAthlete);
router.patch('/update/:athleteId', athlete_1.default.updateAthlete);
router.delete('/delete/:athleteId', athlete_1.default.deleteAthlete);
exports.default = router;
