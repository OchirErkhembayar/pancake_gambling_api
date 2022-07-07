"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const database_1 = __importDefault(require("../util/database"));
const PrivateBetUser = database_1.default.define('privateBetUser', {
    id: {
        type: sequelize_1.default.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    odds: {
        type: sequelize_1.default.FLOAT,
        allowNull: true
    },
    desiredResult: {
        type: sequelize_1.default.BOOLEAN,
        allowNull: false
    },
    amount: {
        type: sequelize_1.default.FLOAT,
        allowNull: false
    },
    confirmed: {
        type: sequelize_1.default.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
}, { timestamps: true });
exports.default = PrivateBetUser;
