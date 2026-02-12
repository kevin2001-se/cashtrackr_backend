import { Sequelize } from "sequelize-typescript";
import dotenv from 'dotenv';

dotenv.config();

export const db = new Sequelize( process.env.DATABASE_URL, {
    models: [__dirname + '/../models/**/*'],// Incluye todos los archivos que incluye en model
    dialectOptions: {
        ssl: {
            require: false
        }
    },
    logging: false
})