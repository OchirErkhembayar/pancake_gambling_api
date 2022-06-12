"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const match_1 = __importDefault(require("../controllers/match"));
const router = express_1.default.Router();
router.get('/all-matches', match_1.default.getMatches);
router.get('/upcoming-matches', match_1.default.getUpcomingMatches);
router.get('/:matchId', match_1.default.getMatch);
router.post('/new-match', match_1.default.createMatch);
router.patch('/result/', match_1.default.matchResult);
router.delete('/delete/:matchId', match_1.default.deleteMatch);
exports.default = router;
