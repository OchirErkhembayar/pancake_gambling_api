"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const database_1 = __importDefault(require("../util/database"));
const Match = database_1.default.define('match', {
    id: {
        type: sequelize_1.default.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: {
        type: sequelize_1.default.STRING,
        allowNull: false
    },
    description: {
        type: sequelize_1.default.STRING,
        allowNull: false
    },
    country: {
        type: sequelize_1.default.STRING,
        allowNull: true
    },
    city: {
        type: sequelize_1.default.STRING,
        allowNull: true
    },
    date: {
        type: sequelize_1.default.DATE,
        allowNull: true
    },
    weightLimit: {
        type: sequelize_1.default.INTEGER,
        allowNull: true
    }
}, { timestamps: true });
exports.default = Match;
