import Sequelize from "sequelize";

import sequelize from "../util/database";

type user = {
  id: number;
  username: string;
}

interface IUserFriend extends Sequelize.Model {
  id: number;
  friendshipId: number;
  userId: number;
  accepted: boolean;
  user: user
}

const UserFriend = sequelize.define<IUserFriend>('userFriend', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  accepted: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  sender: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  }
}, { timestamps: true });

export default UserFriend;
