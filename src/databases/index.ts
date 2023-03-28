import Sequelize from 'sequelize';
import {
  NODE_ENV,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_DATABASE,
} from '@config';
import fs from 'fs';
import path from 'path';

const sequelize = new Sequelize.Sequelize(DB_DATABASE, DB_USER, DB_PASSWORD, {
  dialect: 'postgres',
  host: DB_HOST,
  port: Number(DB_PORT),
  timezone: '+09:00',
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    underscored: true,
    freezeTableName: true,
  },
  pool: {
    min: 0,
    max: 5,
  },
  logQueryParameters: NODE_ENV === 'development',
  // logging: (query, time) => {
  //   logger.info(time + 'ms' + ' ' + query);
  // },
  logging: false,
  benchmark: true,
});

sequelize.authenticate();

const DB: any = {
  sequelize, // connection instance (RAW queries)
  Sequelize, // library
};

fs.readdirSync(path.resolve(__dirname, '../models/'))
  .filter((file) => file.indexOf('.') !== 0 && file.slice(-3) === '.ts')
  .forEach((file) => {
    const model = require(path.join(
      path.resolve(__dirname, '../models/'),
      file
    ));

    const tempModel = model(sequelize, Sequelize.DataTypes);
    DB[tempModel?.name] = tempModel;
  });

Object.keys(DB).forEach((modelName) => {
  if (DB[modelName]?.associate) {
    DB[modelName]?.associate(DB);
  }
});

export default DB;
