"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bet_1 = __importDefault(require("../controllers/bet"));
const is_auth_1 = require("../middleware/is-auth");
const router = express_1.default.Router();
router.get('/all-bets', bet_1.default.getAllBets);
router.get('/single-user/:userId', bet_1.default.getUserBets);
router.get('/single-match/:matchId', bet_1.default.getMatchBets);
router.get('/:betId', bet_1.default.getSingleBet);
router.post('/create-bet/:userId/:matchAthleteId', is_auth_1.authUser, bet_1.default.createBet);
exports.default = router;
