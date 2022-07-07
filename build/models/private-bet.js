"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const database_1 = __importDefault(require("../util/database"));
const PrivateBet = database_1.default.define('privateBet', {
    id: {
        type: sequelize_1.default.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    pot: {
        type: sequelize_1.default.FLOAT,
        allowNull: true
    },
    result: {
        type: sequelize_1.default.BOOLEAN,
        defaultValue: false,
        allowNull: true
    }
}, { timestamps: true });
exports.default = PrivateBet;
