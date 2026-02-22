import { createRequest, createResponse } from 'node-mocks-http'
import User from '../../../models/User'
import { AuthController } from '../../../controllers/AuthController'
import { checkPassword, hashPassword } from '../../../utils/auth'
import { generateToken } from '../../../utils/token'
import { AuthEmail } from '../../../emails/AuthEmail'
import { generateJWT } from '../../../utils/jwt'

jest.mock('../../../utils/jwt')
jest.mock('../../../models/User')
jest.mock('../../../utils/auth')
jest.mock('../../../utils/token')

describe('AuthController.createAccount', () => {

    beforeEach(() => {
        jest.resetAllMocks()
    })

    test('should return a 409 status and an error message if the email is already registered', async () => {

        (User.findOne as jest.Mock).mockResolvedValue(true)

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/create-account',
            body: {
                email: 'prueba@prueba.com',
                password: '1000'
            }
        })

        const res = createResponse();

        await AuthController.createAccount(req, res);

        const data = res._getJSONData();
        expect(res.statusCode).toBe(409)
        expect(data).toHaveProperty('error', 'El usuario con ese email ya esta registrado.')
        expect(User.findOne).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalledTimes(1);
    })

    test('should register a new user and return a success message', async () => {

        // (User.findOne as jest.Mock).mockResolvedValue(null)

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/create-account',
            body: {
                email: 'prueba@prueba.com',
                password: '1000',
                name: 'test name'
            }
        })

        const res = createResponse();

        const mockUser = { ...req.body, save: jest.fn() };

        (User.create as jest.Mock).mockResolvedValue(mockUser);
        (hashPassword as jest.Mock).mockResolvedValue('hashedpassword');
        (generateToken as jest.Mock).mockReturnValue('123456');

        jest.spyOn(AuthEmail, 'sendConfirmationEmail').mockImplementation(() => Promise.resolve());
        
        await AuthController.createAccount(req, res);

        expect(User.create).toHaveBeenCalledWith(req.body);
        expect(User.create).toHaveBeenCalledTimes(1);
        expect(mockUser.save).toHaveBeenCalled();
        expect(mockUser.password).toBe('hashedpassword');
        expect(mockUser.token).toBe('123456');
        expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledWith({
            name: req.body.name,
            email: req.body.email,
            token: '123456'
        });
        expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledTimes(1);

        expect(res.statusCode).toBe(201)
    })
})

describe('AuthController.login', () => {

    test('should return a 404 if user is not found', async () => {

        (User.findOne as jest.Mock).mockResolvedValue(null)

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/login',
            body: {
                email: 'prueba@prueba.com',
                password: '1000'
            }
        })

        const res = createResponse();

        await AuthController.login(req, res);

        const data = res._getJSONData();
        expect(res.statusCode).toBe(404)
        expect(data).toHaveProperty('error', 'Usuario no encontrado.')
    })

    test('should return a 403 if the account has not been confirmed', async () => {

        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            email: 'prueba@prueba.com',
            password: 'password',
            confirmed: false
        })

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/login',
            body: {
                email: 'prueba@prueba.com',
                password: '1000'
            }
        })

        const res = createResponse();

        await AuthController.login(req, res);

        const data = res._getJSONData();
        expect(res.statusCode).toBe(403)
        expect(data).toHaveProperty('error', 'La cuenta no ha sido confirmada.')
    })

    test('should return a 401 if the password is incorrect', async () => {

        const userMock = {
            id: 1,
            email: 'prueba@prueba.com',
            password: 'password',
            confirmed: true
        };

        (User.findOne as jest.Mock).mockResolvedValue(userMock)

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/login',
            body: {
                email: 'prueba@prueba.com',
                password: '1000'
            }
        })

        const res = createResponse();

        (checkPassword as jest.Mock).mockResolvedValue(false)

        await AuthController.login(req, res);

        const data = res._getJSONData();
        expect(res.statusCode).toBe(401)
        expect(data).toHaveProperty('error', 'La contraseña es incorrecta.')
        expect(checkPassword).toHaveBeenCalledWith(req.body.password, userMock.password);
    })

    test('should return a JWT if authentication is successful', async () => {

        const userMock = {
            id: 1,
            email: 'prueba@prueba.com',
            password: 'hashed_password',
            confirmed: true
        };

        (User.findOne as jest.Mock).mockResolvedValue(userMock)

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/login',
            body: {
                email: 'prueba@prueba.com',
                password: 'password'
            }
        })

        const res = createResponse();

        const fake_jwt = 'fake_jwt';
        (checkPassword as jest.Mock).mockResolvedValue(true);
        (generateJWT as jest.Mock).mockReturnValue(fake_jwt);

        await AuthController.login(req, res);

        const data = res._getJSONData();
        expect(res.statusCode).toBe(200)
        expect(data).toEqual(fake_jwt)
    })
})