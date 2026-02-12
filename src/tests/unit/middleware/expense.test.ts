import { createRequest, createResponse } from 'node-mocks-http';
import { validateExpenseExists } from '../../../middleware/expense';
import Expense from '../../../models/Expense';
import { expenses } from '../../mocks/Expenses';
import { hasAccess } from '../../../middleware/budget';
import { budgets } from '../../mocks/Budget';

jest.mock("../../../models/Expense", () => ({
    findByPk: jest.fn()
}))

describe('Expenses Middleware - validateExpenseExists', () => {
    beforeEach(() => {
        (Expense.findByPk as jest.Mock).mockImplementation((id) => {
            const expense = expenses.filter(e => e.id === id)[0] ?? null;
            return Promise.resolve(expense);
        })
    })

    test('should handle a non-existent budget', async () => {

        const req = createRequest({
            params: {
                expenseId: 120
            }
        })

        const res = createResponse(); 

        const next = jest.fn() //Simulamos la función next

        await validateExpenseExists(req, res, next)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(404)
        expect(data).toEqual({error: 'Gasto no encontrado.'})
        expect(next).not.toHaveBeenCalled() // Como retorna 404 no se debe ejecutar la función next
    })

    test('should call next middleware if expense exists', async () => {

        const req = createRequest({
            params: {
                expenseId: 1
            }
        })

        const res = createResponse(); 

        const next = jest.fn() //Simulamos la función next

        await validateExpenseExists(req, res, next)

        expect(next).toHaveBeenCalled() // Como retorna 404 no se debe ejecutar la función next
        expect(req.expense).toEqual(expenses[0])
    })

    test('should handle internal set error', async () => {

        (Expense.findByPk as jest.Mock).mockRejectedValue(new Error)

        const req = createRequest({
            params: {
                expenseId: 1
            }
        })

        const res = createResponse(); 

        const next = jest.fn() //Simulamos la función next

        await validateExpenseExists(req, res, next)
        const data = res._getJSONData()

        expect(next).not.toHaveBeenCalled() // Como retorna 404 no se debe ejecutar la función next
        expect(res.statusCode).toBe(500)
        expect(data).toEqual({error: 'Hubo un error'})
    })
})