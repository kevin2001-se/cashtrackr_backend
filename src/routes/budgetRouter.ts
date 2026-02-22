import { Router } from "express";
import { BudgetController } from "../controllers/BudgetController";
import { handleInputErrors } from '../middleware/validation';
import { hasAccess, validateBudgetExists, validateBudgetId, validateBudgetInput } from "../middleware/budget";
import { ExpensesController } from "../controllers/ExpenseController";
import { belongsToBudget, validateExpenseExists, validateExpenseId, validateExpenseInput } from "../middleware/expense";
import { authenticate } from "../middleware/auth";

const router = Router();

// Protege todos los metodos que tiene este router
router.use(authenticate);

// Cada que se utiliza el param en las rutas se ejecute ciertos middelware
router.param('budgetId', validateBudgetId)
router.param('budgetId', validateBudgetExists)
router.param('budgetId', hasAccess)

router.param('expenseId', validateExpenseId)
router.param('expenseId', validateExpenseExists)
router.param('expenseId', belongsToBudget)

router.get('/', BudgetController.getAll)

router.post('/', 
    validateBudgetInput,
    BudgetController.create
)

router.get('/:budgetId', 
    BudgetController.getBudgetById)

router.put('/:budgetId', 
    validateBudgetInput,
    handleInputErrors,
    BudgetController.updateById)
    
router.delete('/:budgetId', BudgetController.deleteById)

/* Router for expenses */
router.post('/:budgetId/expenses', 
    validateExpenseInput,
    handleInputErrors,
    ExpensesController.create)
router.get('/:budgetId/expenses/:expenseId', ExpensesController.getById)
router.put('/:budgetId/expenses/:expenseId', 
    validateExpenseInput,
    handleInputErrors,
    ExpensesController.updateById)
router.delete('/:budgetId/expenses/:expenseId', ExpensesController.deleteById)

export default router;