"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const auth_1 = __importDefault(require("./routes/auth"));
const athlete_1 = __importDefault(require("./routes/athlete"));
const match_1 = __importDefault(require("./routes/match"));
const bet_1 = __importDefault(require("./routes/bet"));
const database_1 = __importDefault(require("./util/database"));
const match_2 = __importDefault(require("./models/match"));
const athlete_2 = __importDefault(require("./models/athlete"));
const user_1 = __importDefault(require("./models/user"));
const match_athlete_1 = __importDefault(require("./models/match-athlete"));
const bet_2 = __importDefault(require("./models/bet"));
const app = (0, express_1.default)();
const accessLogStream = fs_1.default.createWriteStream(path_1.default.join(__dirname, 'access.log'), { flags: 'a' });
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined', { stream: accessLogStream }));
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use('/auth', auth_1.default);
app.use('/athlete', athlete_1.default);
app.use('/match', match_1.default);
app.use('/bet', bet_1.default);
user_1.default.hasMany(bet_2.default, { onDelete: 'cascade' });
bet_2.default.belongsTo(user_1.default);
bet_2.default.belongsTo(match_athlete_1.default, { onDelete: 'cascade' });
match_athlete_1.default.hasMany(bet_2.default);
match_2.default.belongsToMany(athlete_2.default, { through: match_athlete_1.default });
athlete_2.default.belongsToMany(match_2.default, { through: match_athlete_1.default });
match_athlete_1.default.belongsTo(match_2.default, { onDelete: 'cascade' });
match_athlete_1.default.belongsTo(athlete_2.default, { onDelete: 'cascade' });
database_1.default
    .sync()
    .then(result => {
    app.listen(process.env.PORT || 8000);
})
    .catch(err => {
    console.log(err, `${process.env.DB_NAME}`);
});
