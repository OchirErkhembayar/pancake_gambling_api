import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import path from "path";

import authRoutes from "./routes/auth";
import athleteRoutes from "./routes/athlete";
import matchRoutes from "./routes/match";
import betRoutes from "./routes/bet";
import sequelize from "./util/database";
import Match from "./models/match";
import Athlete from "./models/athlete";
import User from "./models/user";
import MatchAthlete from "./models/match-athlete";
import Bet from "./models/bet";
import bet from "./controllers/bet";

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/athlete', athleteRoutes);
app.use('/match', matchRoutes);
app.use('/bet', betRoutes);

User.hasMany(Bet, { onDelete: 'cascade' });
Bet.belongsTo(User);
Bet.belongsTo(MatchAthlete, { onDelete: 'cascade' });
MatchAthlete.hasMany(Bet);
Match.belongsToMany(Athlete, { through: MatchAthlete });
Athlete.belongsToMany(Match, { through: MatchAthlete });
MatchAthlete.belongsTo(Match, {onDelete: 'cascade'});
MatchAthlete.belongsTo(Athlete, {onDelete: 'cascade'})

sequelize
  .sync()
  .then(result => {
    app.listen(8000);
  })
  .catch(err => {
    console.log(err, `${process.env.DB_NAME}`)
  });
