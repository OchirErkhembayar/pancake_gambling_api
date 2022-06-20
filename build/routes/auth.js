"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = __importDefault(require("../controllers/auth"));
const user_1 = __importDefault(require("../models/user"));
const is_auth_1 = require("../middleware/is-auth");
const router = express_1.default.Router();
router.post('/signup', [
    (0, express_validator_1.body)('username')
        .trim()
        .isLength({ min: 5 })
        .custom((value) => {
        return user_1.default.findOne({
            where: {
                email: value
            }
        })
            .then(userDoc => {
            if (userDoc) {
                return Promise.reject('Username is already taken.');
            }
        });
    }),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value) => {
        return user_1.default.findOne({
            where: {
                email: value
            }
        })
            .then(userDoc => {
            if (userDoc) {
                return Promise.reject('E-Mail is already taken.');
            }
        });
    })
], auth_1.default.signup);
router.post('/login', auth_1.default.login);
router.get('/get-user/:userId', is_auth_1.authUser, auth_1.default.getUser);
router.get('/top', auth_1.default.richestUsers);
exports.default = router;
