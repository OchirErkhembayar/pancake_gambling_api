"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const user_1 = __importDefault(require("../models/user"));
const user_friend_1 = __importDefault(require("../models/user-friend"));
const friendship_1 = __importDefault(require("../models/friendship"));
const getFriends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userFriends = yield user_friend_1.default.findAll({
            where: {
                userId: req.userId
            }
        });
        if (!userFriends) {
            return res.status(500).json({
                message: "Failed to find friends."
            });
        }
        let friendships = [];
        for (let i = 0; i < userFriends.length; i++) {
            const friendship = yield friendship_1.default.findOne({
                where: {
                    id: userFriends[i].friendshipId
                }
            });
            if (!friendship) {
                return res.status(500).json({
                    message: "Failed to fetch friendship."
                });
            }
            const userFriend = yield user_friend_1.default.findOne({
                where: {
                    friendshipId: friendship.id,
                    userId: {
                        [sequelize_1.Op.not]: req.userId
                    }
                }
            });
            if (!userFriend) {
                return res.status(500).json({
                    message: "Failed to find userfriend."
                });
            }
            const friend = yield user_1.default.findOne({
                where: {
                    id: userFriend.userId
                },
                attributes: ['username']
            });
            if (!friend) {
                return res.status(500).json({
                    message: "Failed to find friend."
                });
            }
            friendships.push({
                userFriend: userFriend,
                friend: friend
            });
        }
        return res.status(200).json({
            message: "Successfully fetched friends.",
            friendships: friendships
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to find friends."
        });
    }
});
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_1.default.findAll({
            attributes: ['username', 'id']
        });
        if (!users) {
            return res.status(500).json({
                message: "Failed to fetch users"
            });
        }
        const filteredUsers = users.filter(user => user.id !== req.userId);
        return res.status(200).json({
            message: "Successfully fetched users",
            users: filteredUsers
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch users",
            error: error
        });
    }
});
const sendFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    try {
        const friend = yield user_1.default.findByPk(req.userId);
        if (!friend) {
            return res.status(500).json({
                message: "Failed to find friend."
            });
        }
        const friendship = yield friendship_1.default.create();
        if (!friendship) {
            return res.status(500).json({
                message: "Failed to create friendship."
            });
        }
        const myUserFriend = yield user_friend_1.default.create({
            userId: req.userId,
            friendshipId: friendship.id,
            accepted: false,
            sender: true
        });
        if (!myUserFriend) {
            return res.status(500).json({
                message: "Failed to create myUserFriend"
            });
        }
        const sendUserFriend = yield user_friend_1.default.create({
            userId: body.friendId,
            friendshipId: friendship.id,
            accepted: false,
            sender: false
        });
        if (!sendUserFriend) {
            return res.status(500).json({
                message: "Failed to create friend request"
            });
        }
        return res.status(201).json({
            message: "Successfully created friend request",
            friendRequest: sendUserFriend
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to create friend request",
            error: error
        });
    }
});
const acceptFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    try {
        const myUserFriend = yield user_friend_1.default.findByPk(body.userFriendId);
        if (!myUserFriend) {
            return res.status(500).json({
                message: "Failed to fetch user friend"
            });
        }
        const allUserFriends = yield user_friend_1.default.findAll({
            where: {
                friendshipId: myUserFriend.friendshipId,
            }
        });
        if (!allUserFriends || allUserFriends.length < 2) {
            return res.status(500).json({
                message: "Failed to find both user friend instances."
            });
        }
        for (let i = 0; i < allUserFriends.length; i++) {
            allUserFriends[i].accepted = true;
            yield allUserFriends[i].save();
        }
        const otherUserFriend = allUserFriends.find(uf => uf.userId !== req.userId);
        return res.status(500).json({
            message: "Friend request accepted",
            friend: otherUserFriend
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to accept friend request",
            error: error
        });
    }
});
const deleteFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    try {
        const userFriend = yield user_friend_1.default.findOne({
            where: {
                id: body.userFriendId
            }
        });
        if (!userFriend) {
            return res.status(500).json({
                message: "Failed to find userFriend."
            });
        }
        const friendship = yield friendship_1.default.findOne({
            where: {
                id: userFriend.friendshipId
            }
        });
        if (!friendship) {
            return res.status(500).json({
                message: "Could not find friendship."
            });
        }
        const invites = yield user_friend_1.default.findAll({
            where: {
                friendshipId: friendship.id
            }
        });
        if (!invites) {
            return res.status(500).json({
                message: "Failed to find friend request."
            });
        }
        for (let i = 0; i < invites.length; i++) {
            yield invites[i].destroy();
        }
        return res.status(500).json({
            message: "Deleted friend request"
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to delete friend request."
        });
    }
});
exports.default = { getFriends, sendFriendRequest, acceptFriendRequest, deleteFriendRequest, getUsers };
