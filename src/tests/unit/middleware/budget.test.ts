import { createRequest, createResponse } from 'node-mocks-http';
import { hasAccess, validateBudgetExists } from '../../../middleware/budget';
import Budget from '../../../models/Budget';
import { budgets } from '../../mocks/Budget';

jest.mock('../../../models/Budget', () => ({
    findByPk: jest.fn(),
}))

describe('budget - validateBudgetExists', () => {
    test('should handle non-existent budget', async () => {

        (Budget.findByPk as jest.Mock).mockResolvedValue(null)

        const req = createRequest({
            params: {
                budgetId: 1
            }
        })

        const res = createResponse(); 

        const next = jest.fn() //Simulamos la función next
        
        await validateBudgetExists(req, res, next)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(404)
        expect(data).toEqual({error: 'Presupuesto no encontrado.'})
        expect(next).not.toHaveBeenCalled() // Como retorna 404 no se debe ejecutar la función next
    })

    test('should proceed to next middleware if budget exists', async () => {

        (Budget.findByPk as jest.Mock).mockResolvedValue(budgets[0]);

        const req = createRequest({
            params: {
                budgetId: 1
            }
        })

        const res = createResponse(); 

        const next = jest.fn() //Simulamos la función next
        
        await validateBudgetExists(req, res, next)
        expect(next).toHaveBeenCalled()
        expect(req.budget).toEqual(budgets[0])
    })

    test('should handle error budget', async () => {

        // Reject fuerza el error
        (Budget.findByPk as jest.Mock).mockRejectedValue(new Error)

        const req = createRequest({
            params: {
                budgetId: 1
            }
        })

        const res = createResponse(); 

        const next = jest.fn() //Simulamos la función next
        
        await validateBudgetExists(req, res, next)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(500)
        expect(data).toEqual({error: 'Hubo un error'})
        expect(next).not.toHaveBeenCalled() // Como retorna 500 no se debe ejecutar la función next
    })
})

describe('budget - hasAccess', () => {
    test('should handle proceed to next middleware if user has access', () => {
        const req = createRequest({
            budget: budgets[0],
            user: { id: 1 }
        })

        const res = createResponse(); 

        const next = jest.fn() //Simulamos la función next

        hasAccess(req, res, next);

        expect(next).toHaveBeenCalled()
        expect(next).toHaveBeenCalledTimes(1);
    })
    test('should return 401 error if userId dows not have access to budget', () => {
        const req = createRequest({
            budget: budgets[0],
            user: { id: 2 }
        })

        const res = createResponse(); 

        const next = jest.fn() //Simulamos la función next
        
        hasAccess(req, res, next);

        const data = res._getJSONData()
        expect(res.statusCode).toBe(401)
        expect(data).toEqual({error: "Acción no válida."})
        expect(next).not.toHaveBeenCalled()
    })

    test('should prevent unauthorized users from adding expenses', async () => { 

        const req = createRequest({
            method: 'POST',
            url: '/api/budgets/:budgetId/expenses',
            budget: budgets[0],
            user: {
                id: 20
            },
            body: {
                name: 'Expenses tests',
                amount: 3000
            }
        })

        const res = createResponse(); 

        const next = jest.fn() //Simulamos la función next

        hasAccess(req, res, next)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(401)
        expect(data).toEqual({error: "Acción no válida."})
        expect(next).not.toHaveBeenCalled();
    })
})