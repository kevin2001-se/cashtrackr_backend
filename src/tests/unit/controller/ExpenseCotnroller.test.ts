import { createRequest, createResponse } from 'node-mocks-http'
import Expense from '../../../models/Expense'
import { ExpensesController } from '../../../controllers/ExpenseController'
import { expenses } from '../../mocks/Expenses'

jest.mock("../../../models/Expense", () => ({
    create: jest.fn()
}))

describe('ExpensesController.create', () => { 
    test('should create a new expense', async () => {
        const expenseMock = {
            save: jest.fn().mockResolvedValue(true)
        };

        (Expense.create as jest.Mock).mockResolvedValue(expenseMock)

        // Crea el request
        const req = createRequest({
            method: 'POST',
            url: '/api/budgets/:budgetId/expenses',
            budget: { id: 1 },
            body: {
                name: 'Test expenses',
                amount: 500
            }
        })

        // Crea la respuesta
        const res = createResponse();

        await ExpensesController.create(req, res)

        const data = res._getJSONData();

        expect(res.statusCode).toBe(201)
        expect(data).toBe('Gasto agregado correctamente.') // Regreso esa respuesta
        expect(expenseMock.save).toHaveBeenCalled() // Se esta llamando
        expect(expenseMock.save).toHaveBeenCalledTimes(1); // Se llama solo 1 ves
        expect(Expense.create).toHaveBeenCalledWith(req.body); // Se llama con el req
    })

    test('should handle expense creation error', async () => {
        const expenseMock = {
            save: jest.fn()
        };

        (Expense.create as jest.Mock).mockRejectedValue(new Error)

        // Crea el request
        const req = createRequest({
            method: 'POST',
            url: '/api/budgets/:budgetId/expenses',
            budget: { id: 1 },
            body: {
                name: 'Test expenses',
                amount: 500
            }
        })

        // Crea la respuesta
        const res = createResponse();

        await ExpensesController.create(req, res)

        const data = res._getJSONData();

        expect(res.statusCode).toBe(500)
        expect(data).toEqual({error: 'Hubo un error'}) // Regreso esa respuesta
        expect(expenseMock.save).not.toHaveBeenCalled() // Se esta llamando
        expect(Expense.create).toHaveBeenCalledWith(req.body); // Se llama con el req
    })
})

describe('ExpensesController.getById', () => {
    test('should return expense with ID', async () => {
        const expenseMock = {
            save: jest.fn().mockResolvedValue(true)
        };

        (Expense.create as jest.Mock).mockResolvedValue(expenseMock)
        
        // Crea el request
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:budgetId/expenses/:expenseId',
            expense: expenses[0]
        })

        // Crea la respuesta
        const res = createResponse();

        await ExpensesController.getById(req, res)

        const data = res._getJSONData();

        expect(res.statusCode).toBe(200)
        expect(data).toEqual(expenses[0])
    })
})

describe('ExpensesController.updateById', () => {
    test('should handle expense update', async () => {
        const expenseMock = {
            ...expenses[0],
            update: jest.fn()
        };
        
        // Crea el request
        const req = createRequest({
            method: 'PUT',
            url: '/api/budgets/:budgetId/expenses/:expenseId',
            expense: expenseMock,
            body: {
                name: 'Update expense',
                amount: 100
            }
        })

        // Crea la respuesta
        const res = createResponse();

        await ExpensesController.updateById(req, res)

        const data = res._getJSONData();

        expect(res.statusCode).toBe(200)
        expect(data).toBe('Gasto actualizado correctamente.') // Regreso esa respuesta
        expect(expenseMock.update).toHaveBeenCalled() // Se esta llamando
        expect(expenseMock.update).toHaveBeenCalledTimes(1); // Se llama solo 1 ves
    })
})

describe('ExpensesController.deleteBydId', () => {
    test('should delete expense and return success message', async () => {
        const expenseMock = {
            ...expenses[0],
            destroy: jest.fn()
        };
        
        // Crea el request
        const req = createRequest({
            method: 'DELETE',
            url: '/api/budgets/:budgetId/expenses/:expenseId',
            expense: expenseMock
        })

        // Crea la respuesta
        const res = createResponse();

        await ExpensesController.deleteById(req, res)

        const data = res._getJSONData();

        expect(res.statusCode).toBe(200)
        expect(data).toBe('Gasto eliminado correctamente.') // Regreso esa respuesta
        expect(expenseMock.destroy).toHaveBeenCalled() // Se esta llamando
        expect(expenseMock.destroy).toHaveBeenCalledTimes(1); // Se llama solo 1 ves
    })
})