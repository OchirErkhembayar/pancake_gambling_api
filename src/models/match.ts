import Sequelize from 'sequelize';

import sequelize from "../util/database";

const Match = sequelize.define('match', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
  },
  country: {
    type: Sequelize.STRING,
    allowNull: true
  },
  city: {
    type: Sequelize.STRING,
    allowNull: true
  },
  date: {
    type: Sequelize.DATE,
    allowNull: true
  },
  weightLimit: {
    type: Sequelize.INTEGER,
    allowNull: true
  }
}, { timestamps: true });

export default Match;
