import Sequelize from 'sequelize';

import sequelize from "../util/database";

import { IAthlete } from "./athlete";

interface IMatchAthlete extends Sequelize.Model {
  id: number;
  matchId: number;
  odds: number;
  result: boolean;
  athlete: IAthlete
}

const MatchAthlete = sequelize.define<IMatchAthlete>('matchAthlete', {
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
