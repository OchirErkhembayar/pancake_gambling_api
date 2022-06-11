import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import path from "path";

import authRoutes from "./routes/auth";
import sequelize from "./util/database";
import Match from "./models/match";
import Athlete from "./models/athlete";
import User from "./models/user";
import MatchAthlete from "./models/match-athlete";
import Bet from "./models/bet";

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRoutes);

User.hasMany(Bet, { onDelete: 'cascade' });
Bet.belongsTo(User);
Bet.belongsTo(MatchAthlete);
MatchAthlete.hasMany(Bet);
Match.belongsToMany(Athlete, { through: MatchAthlete });
Athlete.hasMany(Match);

sequelize
  .sync()
  .then(result => {
    app.listen(8000);
  })
  .catch(err => {
    console.log(err, `${process.env.DB_NAME}`)
  });
