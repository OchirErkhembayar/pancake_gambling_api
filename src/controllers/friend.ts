import { Request, Response, NextFunction} from "express";

import User from "../models/user";
import UserFriend from "../models/user-friend";
import Friendship from "../models/friendship";

type RequestBody = {
  friendId: number;
  userFriendId: number;
}

const getFriends = async (req: any, res: Response) => {
  try {
    const userFriends = await UserFriend.findAll({
      where: {
        userId: req.userId
      }
    });
    if (!userFriends) {
      return res.status(500).json({
        message: "Failed to find friends."
      })
    }
    let friendships = [];
    for (let i = 0; i < userFriends.length; i++) {
      const friendship = await Friendship.findOne({
        where: {
          id: userFriends[i].friendshipId
        }
      });
      if (!friendship) {
        return res.status(500).json({
          message: "Failed to fetch friendship."
        });
      }
      const userFriendsArray = await UserFriend.findAll({
        where: {
          friendshipId: friendship.id
        }
      });
      if (!userFriendsArray || userFriendsArray.length < 2) {
        return res.status(500).json({
          message: "Failed to find userfriends."
        });
      }
      const singleUserFriend = userFriendsArray.find(uf => uf.userId !== req.userId);
      friendships.push(singleUserFriend);
    }
    return res.status(200).json({
      message: "Successfully fetched friends.",
      friendships: friendships
    })
  } catch (error) {
    return res.status(500).json({
      message: "Failed to find friends."
    })
  }
}

const getUsers = async (req: any, res: Response) => {
  try {
    const users = await User.findAll({})
    if (!users) {
      return res.status(500).json({
        message: "Failed to fetch users"
      });
    }
    const filteredUsers = users.filter(user => user.id !== req.userId);
    return res.status(200).json({
      message: "Successfully fetched users",
      users: users
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch users",
      error: error
    })
  }
}

const sendFriendRequest = async (req: any, res: Response) => {
  const body = req.body as RequestBody;
  try {
    const friend = await User.findByPk(req.userId);
    if (!friend) {
      return res.status(500).json({
        message: "Failed to find friend."
      });
    }
    const friendship = await Friendship.create();
    if (!friendship) {
      return res.status(500).json({
        message: "Failed to create friendship."
      });
    }
    const myUserFriend = await UserFriend.create({
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
    const sendUserFriend = await UserFriend.create({
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
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create friend request",
      error: error
    })
  }
}

const acceptFriendRequest = async (req: any, res: Response) => {
  const body = req.body as RequestBody;
  try {
    const myUserFriend = await UserFriend.findByPk(body.userFriendId);
    if (!myUserFriend) {
      return res.status(500).json({
        message: "Failed to fetch user friend"
      });
    }
    const allUserFriends = await UserFriend.findAll({
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
      await allUserFriends[i].save();
    }
    const otherUserFriend = allUserFriends.find(uf => uf.userId !== req.userId);
    return res.status(500).json({
      message: "Friend request accepted",
      friend: otherUserFriend
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to accept friend request",
      error: error
    })
  }
}

const deleteFriendRequest = async (req: Request, res: Response) => {
  const body = req.body as RequestBody;
  try {
    const friendship = await Friendship.findOne({
      where: {
        id: body.userFriendId
      }
    });
    if (!friendship) {
      return res.status(500).json({
        message: "Failed to find friendship."
      });
    }
    const friendRequests = await UserFriend.findAll({
      where: {
        friendshipId: friendship.id
      }
    });
    if (!friendRequests || friendRequests.length < 2) {
      return res.status(500).json({
        message: "Failed to find friend requests."
      })
    }
    for (let i = 0; i < friendRequests.length; i++) {
      await friendRequests[i].destroy();
    }
    return res.status(500).json({
      message: "Deleted friend requests"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete friend request."
    })
  }
}

export default { getFriends, sendFriendRequest, acceptFriendRequest, deleteFriendRequest, getUsers };
