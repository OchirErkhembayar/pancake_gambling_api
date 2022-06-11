import Sequelize from 'sequelize';

import sequelize from "../util/database";

const Bet = sequelize.define('bet', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  amount: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  result: {
    type: Sequelize.BOOLEAN,
    allowNull: true
  },
  winnings: {
    type: Sequelize.FLOAT,
    allowNull: true
  }
}, {timestamps: true});

export default Bet;
