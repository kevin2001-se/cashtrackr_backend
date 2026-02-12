import { createRequest, createResponse } from 'node-mocks-http'
import { BudgetController } from '../../../controllers/BudgetController';
import { budgets } from '../../mocks/Budget';
import Budget from '../../../models/Budget';
import Expense from '../../../models/Expense';

jest.mock('../../../models/Budget', () => ({
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
}))

describe('BudgetController.getAll', () => {

    // Se ejecuta antes de que cada test se ejecuta
    beforeEach(() => {
        (Budget.findAll as jest.Mock).mockReset(); // Reinicia cada Mock cuando finalize
        (Budget.findAll as jest.Mock).mockImplementation((options) => {
            // Esto se ejecuta en automatico cuando el mock se ejecuta
            const updatedBudgets = budgets.filter(budget => budget.userId === options.where.userId);
            return Promise.resolve(updatedBudgets)
        });
    })

    test('should retrieve 2 budgets for user id 1', async () => {

        // Crea el request
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: { id: 1 }
        })

        // Crea la respuesta
        const res = createResponse();

        // Llama al servicio con los datos de prueba
        await BudgetController.getAll(req, res)

        // Obtiene la data
        const data = res._getJSONData();

        expect(data).toHaveLength(2)
        expect(res.statusCode).toBe(200)
        expect(res.status).not.toBe(404)
    })
    test('should retrieve 1 budget for user id 2', async () => {

        // Crea el request
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: { id: 2 }
        })

        // Crea la respuesta
        const res = createResponse();

        // Llama al servicio con los datos de prueba
        await BudgetController.getAll(req, res)

        // Obtiene la data
        const data = res._getJSONData();

        expect(data).toHaveLength(1)
        expect(res.statusCode).toBe(200)
        expect(res.status).not.toBe(404)
    })

    test('should handle errors when fetching budgets', async () => {

        // Crea el request
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: { id: 100 }
        })

        // Crea la respuesta
        const res = createResponse();

         (Budget.findAll as jest.Mock).mockRejectedValue(new Error());// Simula un error-
        // Llama al servicio con los datos de prueba
        await BudgetController.getAll(req, res)

        expect(res.statusCode).toBe(500)
        expect(res._getJSONData()).toEqual({error: "Hubo un error"})
    })
})

describe('BudgetController.create', () => {
    test('should create a new Budget and response with statusCode 201', async   () => {

        // Instancia del Budget
        const mockBudget = {
            save: jest.fn().mockResolvedValue(true)
        };
        (Budget.create as jest.Mock).mockResolvedValue(mockBudget)

        // Crea el request
        const req = createRequest({
            method: 'POST',
            url: '/api/budgets',
            user: { id: 1 },
            body: {
                name: 'Presupuesto prueba',
                amount: 1000
            }
        })

        // Crea la respuesta
        const res = createResponse();

        // Llama al servicio con los datos de prueba
        await BudgetController.create(req, res)

        const data = res._getJSONData();

        expect(res.statusCode).toBe(201)
        expect(data).toBe('Presupuesto creado correctamente.') // Regreso esa respuesta
        expect(mockBudget.save).toHaveBeenCalled() // Se esta llamando
        expect(mockBudget.save).toHaveBeenCalledTimes(1); // Se llama solo 1 ves
        expect(Budget.create).toHaveBeenCalledWith(req.body); // Se llama con el req
    })

    test('should create a new Budget and response with statusCode 500', async   () => {

        // Instancia del Budget
        const mockBudget = {
            save: jest.fn()
        };
        (Budget.create as jest.Mock).mockRejectedValue(new Error)

        // Crea el request
        const req = createRequest({
            method: 'POST',
            url: '/api/budgets',
            user: { id: 1 },
            body: {
                name: 'Presupuesto prueba',
                amount: 1000
            }
        })

        // Crea la respuesta
        const res = createResponse();

        // Llama al servicio con los datos de prueba
        await BudgetController.create(req, res)

        const data = res._getJSONData();

        expect(res.statusCode).toBe(500)
        expect(data).toEqual({error: "Hubo un error"})
        expect(mockBudget.save).not.toHaveBeenCalled() // Se esta llamando
        expect(mockBudget.save).not.toHaveBeenCalledTimes(1); // Se llama solo 1 ves
        expect(Budget.create).toHaveBeenCalledWith(req.body); // Se llama con el req
    })
})

describe('BudgetController.getById', () => {

    beforeEach(() => {
        (Budget.findByPk as jest.Mock).mockImplementation(id => {
            const budget = budgets.filter(b => b.id === id)[0];
            return Promise.resolve(budget);
        })
    })

    test('should return a buidget with ID 1 and 3 expenses ', async () => {

        // Crea el request
        const req = createRequest({
            method: 'POST',
            url: '/api/budgets/:budgetId',
            budget: {
                id: 1
            }
        })

        // Crea la respuesta
        const res = createResponse();

        // Llama al servicio con los datos de prueba
        await BudgetController.getBudgetById(req, res)

        const data = res._getJSONData();
        expect(res.statusCode).toBe(200);
        expect(data.expenses).toHaveLength(3);
        expect(Budget.findByPk).toHaveBeenCalled()
        expect(Budget.findByPk).toHaveBeenCalledTimes(1)
        expect(Budget.findByPk).toHaveBeenCalledWith(req.budget.id, {
            include: [Expense]
        })
    })

    test('should return a buidget with ID 2 and 2 expenses ', async () => {

        // Crea el request
        const req = createRequest({
            method: 'POST',
            url: '/api/budgets/:budgetId',
            budget: {
                id: 2
            }
        })

        // Crea la respuesta
        const res = createResponse();

        // Llama al servicio con los datos de prueba
        await BudgetController.getBudgetById(req, res)

        const data = res._getJSONData();
        expect(res.statusCode).toBe(200);
        expect(data.expenses).toHaveLength(2);
    })

    test('should return a buidget with ID 3 and 0 expenses ', async () => {

        // Crea el request
        const req = createRequest({
            method: 'POST',
            url: '/api/budgets/:budgetId',
            budget: {
                id: 3
            }
        })

        // Crea la respuesta
        const res = createResponse();

        // Llama al servicio con los datos de prueba
        await BudgetController.getBudgetById(req, res)

        const data = res._getJSONData();
        expect(res.statusCode).toBe(200);
        expect(data.expenses).toHaveLength(0);
    })
})

describe('BudgetController.updateById', () => {
    test('should update the budget and return a success message', async () => {

        // Instancia del Budget
        const mockBudget = {
            update: jest.fn().mockResolvedValue(true)
        };

        // Crea el request
        const req = createRequest({
            method: 'PUT',
            url: '/api/budgets/:budgetId',
            budget: mockBudget,
            body: {
                name: 'Presupuesto actualizado',
                amount: 5000
            }
        })

        // Crea la respuesta
        const res = createResponse();

        // Llama al servicio con los datos de prueba
        await BudgetController.updateById(req, res)

        const data = res._getJSONData();
        expect(res.statusCode).toBe(200);
        expect(data).toBe('Presupuesto actualizado correctamente.')
        expect(mockBudget.update).toHaveBeenCalled();
        expect(mockBudget.update).toHaveBeenCalledTimes(1); // Se llamo una vez
        expect(mockBudget.update).toHaveBeenCalledWith(req.body); // Se llamo con el body
    })
})

describe('BudgetController.deleteById', () => {
    test('should delete the budget and return a success message', async () => {

        // Instancia del Budget
        const mockBudget = {
            destroy: jest.fn().mockResolvedValue(true)
        };

        // Crea el request
        const req = createRequest({
            method: 'DELETE',
            url: '/api/budgets/:budgetId',
            budget: mockBudget
        })

        // Crea la respuesta
        const res = createResponse();

        // Llama al servicio con los datos de prueba
        await BudgetController.deleteById(req, res)

        const data = res._getJSONData();
        expect(res.statusCode).toBe(200);
        expect(data).toBe('Presupuesto eliminado correctamente.')
        expect(mockBudget.destroy).toHaveBeenCalled();
        expect(mockBudget.destroy).toHaveBeenCalledTimes(1); // Se llamo una vez
    })
})