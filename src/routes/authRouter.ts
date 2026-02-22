import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { limiter } from "../config/limiter";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(limiter)


router.post('/create-account', 
    body('name')
        .notEmpty().withMessage('El nombre no puede ir vacio.'),
    body('password')
        .isLength({min: 8}).withMessage('La contraseña es muy corto, mínimo 8 caracteres.'),
    body('email')
        .isEmail().withMessage('E-mail no válido.'),
    handleInputErrors,
    AuthController.createAccount)

router.post('/confirm-account', 
    // limiter,
    body('token')
        .isLength({min: 6, max: 6})
        .withMessage('Token no válido'),
    handleInputErrors,
    AuthController.confirmAccount)

router.post('/login',
    body('email')
        .isEmail().withMessage('E-mail no válido'),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatorio.'),
    handleInputErrors,
    AuthController.login
)

router.post('/forgot-password',
    body('email')
        .isEmail().withMessage('E-mail no válido'),
    handleInputErrors,
    AuthController.forgotPassword
)

router.post('/validate-token',
    body('token')
        .notEmpty()
        .isLength({min: 6, max: 6})
        .withMessage('Token no válido'),
    handleInputErrors,
    AuthController.validateToken
)

router.post('/reset-password/:token',
    param('token')
        .notEmpty()
        .isLength({min: 6, max: 6})
        .withMessage('Token no válido'),
    body('password')
        .isLength({min: 8}).withMessage('La contraseña es muy corto, mínimo 8 caracteres.'),
    handleInputErrors,
    AuthController.resetPassword
)

router.get('/user',
    authenticate,
    AuthController.user
)

router.post('/update-password', 
    authenticate,
    body('current_password')
        .notEmpty().withMessage('La contraseña actual no puede estar vacio.'),
    body('password')
        .isLength({min: 8}).withMessage('La contraseña es muy corto, mínimo 8 caracteres.'),
    handleInputErrors,
    AuthController.updateCurrentUserPassword
)

router.post('/check-password', 
    authenticate,
    body('password')
        .notEmpty().withMessage('La contraseña actual no puede estar vacio.'),
    handleInputErrors,
    AuthController.checkPassword
)

router.put('/user', 
    authenticate,
    body('name')
        .notEmpty().withMessage('El nombre no puede estar vacío.'),
    body('email')
        .notEmpty().withMessage('El email no puede estar vacío.')
        .isEmail().withMessage('E-mail no válido'),
    handleInputErrors,
    AuthController.updateUser
)

export default router;