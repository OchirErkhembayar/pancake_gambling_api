"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const database_1 = __importDefault(require("../util/database"));
const MatchAthlete = database_1.default.define('matchAthlete', {
    id: {
        type: sequelize_1.default.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    odds: {
        type: sequelize_1.default.INTEGER,
        allowNull: false
    },
    result: {
        type: sequelize_1.default.BOOLEAN,
        allowNull: true
    }
}, { timestamps: true });
exports.default = MatchAthlete;
