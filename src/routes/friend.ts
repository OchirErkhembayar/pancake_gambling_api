import express from "express";

import friendController from "../controllers/friend";
import { authUser } from "../middleware/is-auth";

const router = express.Router();

router.get('/all-friends', authUser, friendController.getFriends);

router.post('/users', authUser, friendController.getUsers);

router.post('/send-request', authUser, friendController.sendFriendRequest);

router.patch('/accept', authUser, friendController.acceptFriendRequest);

router.delete('/decline', authUser, friendController.deleteFriendRequest);

export default router;
