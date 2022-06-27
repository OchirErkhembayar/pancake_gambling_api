"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const friend_1 = __importDefault(require("../controllers/friend"));
const is_auth_1 = require("../middleware/is-auth");
const router = express_1.default.Router();
router.get('/all-friends', is_auth_1.authUser, friend_1.default.getFriends);
router.get('/users', is_auth_1.authUser, friend_1.default.getUsers);
router.post('/send-request', is_auth_1.authUser, friend_1.default.sendFriendRequest);
router.patch('/accept', is_auth_1.authUser, friend_1.default.acceptFriendRequest);
router.delete('/decline', is_auth_1.authUser, friend_1.default.deleteFriendRequest);
exports.default = router;
