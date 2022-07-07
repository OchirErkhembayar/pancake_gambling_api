import Sequelize from 'sequelize';

import sequelize from "../util/database";

import { IAthlete } from "./athlete";
import { IMatch } from "./match";

interface IMatchAthlete extends Sequelize.Model {
  id: number;
  matchId: number;
  odds: number;
  result: boolean;
  athlete: IAthlete;
  match: IMatch;
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
