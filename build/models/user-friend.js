"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const database_1 = __importDefault(require("../util/database"));
const UserFriend = database_1.default.define('userFriend', {
    id: {
        type: sequelize_1.default.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    accepted: {
        type: sequelize_1.default.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    sender: {
        type: sequelize_1.default.BOOLEAN,
        allowNull: false
    }
}, { timestamps: true });
exports.default = UserFriend;
