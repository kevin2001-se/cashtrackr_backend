import express from 'express' 
import colors from 'colors'
import morgan from 'morgan'
import { db } from "./config/db";
import budgetRouter from './routes/budgetRouter';
import authRouter from './routes/authRouter';

async function connectDb() {
    try {
        await db.authenticate();
        db.sync();// Sincroniza los cambios en automatico
        console.log(colors.blue.bold('Conexión exitosa a la BD'))
    } catch (error) {
        // console.log(error)
        console.log(colors.red.bold('Fallo la conexión a la BD'))
    }
}

connectDb();

const app = express()

app.use(morgan('dev'))

app.use(express.json())

// app.use(limiter)

app.use('/api/budgets', budgetRouter);
app.use('/api/auth', authRouter);

export default app