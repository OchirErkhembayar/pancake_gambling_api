import Sequelize from "sequelize";

import sequelize from "../util/database";

interface IFriendship extends Sequelize.Model {
  id: number;
}

const Friendship = sequelize.define<IFriendship>('friendship', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  }
}, { timestamps: true });

export default Friendship;
