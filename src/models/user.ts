import Sequelize from 'sequelize';

import sequelize from "../util/database";

const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  resetToken: {
    type: Sequelize.STRING,
    allowNull: true
  },
  resetTokenExpiration: {
    type: Sequelize.DATE,
    allowNull: true
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  admin: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
  balance: {
    type: Sequelize.FLOAT,
    allowNull: false
  }
}, {timestamps: true});

export default User;
