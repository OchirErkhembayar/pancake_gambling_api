import { Sequelize } from "sequelize";

const sequelize = new Sequelize(`${process.env.DB}`, `${process.env.DB_USER}`, `${process.env.DB_PASSWORD}`, {
  dialect: 'mysql',
  host: `${process.env.DB_HOST}`
});

export default sequelize;
