import Sequelize from "sequelize";

import sequelize from "../util/database";

interface IPrivateBetUser extends Sequelize.Model {
  userId: number;
  amount: number;
  confirmed: boolean;
}

const PrivateBetUser = sequelize.define<IPrivateBetUser>('privateBetUser', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  odds: {
    type: Sequelize.FLOAT,
    allowNull: true
  },
  desiredResult: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
  amount: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  confirmed: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false
  }
}, { timestamps: true });

export default PrivateBetUser;
