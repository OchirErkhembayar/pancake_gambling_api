import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cors from "cors";
import fs from "fs";
import path from "path";

import friendRoutes from "./routes/friend";
import authRoutes from "./routes/auth";
import athleteRoutes from "./routes/athlete";
import matchRoutes from "./routes/match";
import betRoutes from "./routes/bet";
import sequelize from "./util/database";
import Match from "./models/match";
import Athlete from "./models/athlete";
import Friendship from "./models/friendship";
import UserFriend from "./models/user-friend";
import User from "./models/user";
import MatchAthlete from "./models/match-athlete";
import Bet from "./models/bet";

const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
)

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/athlete', athleteRoutes);
app.use('/match', matchRoutes);
app.use('/bet', betRoutes);
app.use('/friend', friendRoutes);

User.hasMany(Bet, { onDelete: 'cascade' });
Friendship.belongsToMany(User, { through: UserFriend });
User.hasMany(Friendship, { onDelete: 'cascade' });
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
    console.log(`App running on ${process.env.PORT}`);
    app.listen(process.env.PORT || 8000);
  })
  .catch(err => {
    console.log(err, `${process.env.DB_NAME}`)
  });
