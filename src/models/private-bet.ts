import Sequelize from "sequelize";

import sequelize from "../util/database";

interface IPrivateBet extends Sequelize.Model {
  id: number;
  pot: number;
}

const PrivateBet = sequelize.define<IPrivateBet>('privateBet', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  pot: {
    type: Sequelize.FLOAT,
    allowNull: true
  },
  result: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: true
  }
}, { timestamps: true });

export default PrivateBet;
