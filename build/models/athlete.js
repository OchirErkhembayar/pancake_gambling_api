"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const database_1 = __importDefault(require("../util/database"));
const Athlete = database_1.default.define('athlete', {
    id: {
        type: sequelize_1.default.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    firstName: {
        type: sequelize_1.default.STRING,
        allowNull: false
    },
    lastName: {
        type: sequelize_1.default.STRING,
        allowNull: false
    },
    // nickName: {
    //   type: Sequelize.STRING,
    //   allowNull: true
    // },
    age: {
        type: sequelize_1.default.INTEGER,
        allowNull: false
    },
    gender: {
        type: sequelize_1.default.STRING,
        allowNull: false
    },
    wins: {
        type: sequelize_1.default.INTEGER,
        allowNull: false
    },
    losses: {
        type: sequelize_1.default.INTEGER,
        allowNull: false
    },
    nationality: {
        type: sequelize_1.default.STRING,
        allowNull: false
    }
}, { timestamps: true });
exports.default = Athlete;
