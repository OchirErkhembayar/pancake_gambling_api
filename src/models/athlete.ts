import Sequelize from "sequelize";

import sequelize from "../util/database";

const Athlete = sequelize.define('athlete', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  firstName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  age: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  gender: {
    type: Sequelize.STRING,
    allowNull: false
  },
  wins: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  losses: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  nationality: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {timestamps: true});

export default Athlete;
