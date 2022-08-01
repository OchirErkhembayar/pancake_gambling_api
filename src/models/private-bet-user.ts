import Sequelize from "sequelize";

import sequelize from "../util/database";

interface IPrivateBetUser extends Sequelize.Model {
  userId: number;
  amount: number;
  confirmed: boolean;
  desiredResult: boolean;
  result: boolean;
  privateBetId: number;
}

const PrivateBetUser = sequelize.define<IPrivateBetUser>('privateBetUser', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  desiredResult: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
  amount: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  result: {
    type: Sequelize.BOOLEAN,
    defaultValue: null,
    allowNull: true
  },
  confirmed: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  sender: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  }
}, { timestamps: true });

export default PrivateBetUser;
