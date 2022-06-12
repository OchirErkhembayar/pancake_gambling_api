import Sequelize from "sequelize";

import sequelize from "../util/database";

interface IAthlete extends Sequelize.Model {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  wins: number;
  losses: number;
  nationality: string;
}

export { IAthlete };

const Athlete = sequelize.define<IAthlete>('athlete', {
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
  // nickName: {
  //   type: Sequelize.STRING,
  //   allowNull: true
  // },
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
