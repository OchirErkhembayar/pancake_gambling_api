import Sequelize from 'sequelize';

import sequelize from "../util/database";

const MatchAthlete = sequelize.define('matchAthlete', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  odds: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  result: {
    type: Sequelize.BOOLEAN,
    allowNull: true
  }
}, { timestamps: true });

export default MatchAthlete;
