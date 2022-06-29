import { Request, Response, NextFunction} from "express";
import { Op } from "sequelize";

import User from "../models/user";
import UserFriend from "../models/user-friend";
import Friendship from "../models/friendship";

type RequestBody = {
  friendId: number;
  userFriendId: number;
  username: string;
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
      const userFriend = await UserFriend.findOne({
        where: {
          friendshipId: friendship.id,
          userId: {
            [Op.not]: req.userId
          }
        }
      });
      if (!userFriend) {
        return res.status(500).json({
          message: "Failed to find userfriend."
        });
      }
      const friend = await User.findOne({
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
    })
  } catch (error) {
    return res.status(500).json({
      message: "Failed to find friends."
    })
  }
}

const getUsers = async (req: any, res: Response) => {
  const body = req.body as RequestBody;
  console.log(body);
  try {
    const users = await User.findAll({
      where: {
        username: {
          [Op.like]: `%${body.username}%`
        }
      },
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
    const friend = await User.findByPk(body.friendId);
    if (!friend) {
      return res.status(500).json({
        message: "Failed to find friend."
      });
    }
    const myUserFriends = await UserFriend.findAll({
      where: {
        userId: req.userId
      }
    });
    if (!myUserFriends) {
      return res.status(500).json({
        message: "Failed to find current UserFriends to check if friend is already added."
      });
    }
    const myFriends = await Promise.all(myUserFriends.map(async uf => {
      return (
        await UserFriend.findOne({
          where: {
            userId: {
              [Op.not]: req.userId
            },
            friendshipId: uf.friendshipId
          }
        })
      )
    }));
    if (!myFriends) {
      return res.status(500).json({
        message: "Failed to fetch my userfriends."
      });
    }
    const friendIds = myFriends.map(f => {
      return f?.userId
    })
    if (friendIds.includes(body.friendId)) {
      return res.status(500).json({
        message: "This person is already your friend."
      })
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
    const returnUserFriend = await UserFriend.findOne({
      where: {
        id: sendUserFriend.id
      },
      include: [{
        model: User,
        attributes: ['username']
      }]
    });
    return res.status(201).json({
      message: "Successfully created friend request",
      friend: returnUserFriend
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
    return res.status(200).json({
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

const deleteFriendRequest = async (req: any, res: Response) => {
  const body = req.body as RequestBody;
  try {
    const userFriend = await UserFriend.findOne({
      where: {
        id: body.userFriendId
      }
    });
    if (!userFriend) {
      return res.status(500).json({
        message: "Failed to find userFriend."
      });
    }
    const friendship = await Friendship.findOne({
      where: {
        id: userFriend.friendshipId
      }
    });
    if (!friendship) {
      return res.status(500).json({
        message: "Could not find friendship."
      });
    }
    const invites = await UserFriend.findAll({
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
      await invites[i].destroy();
    }
    return res.status(200).json({
      message: "Deleted friend request",
      friend: userFriend
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete friend request."
    })
  }
}

const deleteFriend = async (req: any, res: Response) => {
  const body = req.body as RequestBody;
  try {
    const userFriend = await UserFriend.findOne({
      where: {
        id: body.userFriendId
      },
      include: [{
        model: User,
        attributes: ['username']
      }]
    });
    if (!userFriend) {
      return res.status(500).json({
        message: "Could not find userfriend"
      });
    }
    const friendship = await Friendship.findOne({
      where: {
        id: userFriend.friendshipId
      }
    });
    if (!friendship) {
      return res.status(500).json({
        message: "Failed to find friendship"
      });
    }
    const myUserFriend = await UserFriend.findOne({
      where: {
        friendshipId: friendship.id,
        userId: req.userId
      }
    });
    if (!myUserFriend) {
      return res.status(500).json({
        message: "Failed to find my userfriend."
      });
    }
    await myUserFriend.destroy();
    await userFriend.destroy();
    await friendship.destroy();
    return res.status(200).json({
      message: "Successfully deleted friend",
      friend: userFriend
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete friend.",
      error: error
    })
  }
}

export default { getFriends, sendFriendRequest, acceptFriendRequest, deleteFriendRequest, getUsers, deleteFriend };
