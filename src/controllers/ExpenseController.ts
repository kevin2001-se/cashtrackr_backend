import type { Request, Response } from 'express'
import Expense from '../models/Expense'

export class ExpensesController {
  
    static create = async (req: Request, res: Response) => {
        try {
            const expense = await Expense.create(req.body);
            expense.budgetId = req.budget.id
            await expense.save();
            res.status(201).json('Gasto agregado correctamente.')
        } catch (error) {
            // console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }
  
    static getById = async (req: Request, res: Response) => {
        res.json(req.expense);
    }

    static updateById = async (req: Request, res: Response) => {
        try {
            const expense = req.expense;

            // Escribir los cambios del body
            await expense.update(req.body);

            res.json('Gasto actualizado correctamente.')
        } catch (error) {
            // console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }
  
    static deleteById = async (req: Request, res: Response) => {
        try {
            const expense = req.expense;

            await expense.destroy();

            res.json('Gasto eliminado correctamente.')
        } catch (error) {
            // console.log(error)
            res.status(500).json({error: "Hubo un error"})
        }
    }
}