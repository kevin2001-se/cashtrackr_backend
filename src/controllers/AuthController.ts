import type { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";

export class AuthController {
    static createAccount  = async (req: Request, res: Response) => {
        try {

            const { email, password } = req.body;

            const userExists = await User.findOne({ where: { email } })

            if (userExists) {
                const error = new Error('El usuario con ese email ya esta registrado.')
                return res.status(409).json({error: error.message})
            }

            const user = new User(req.body)

            user.password = await hashPassword(password);
            user.token = generateToken();

            await user.save();

            await AuthEmail.sendConfirmationEmail({
                name: user.name,
                email: user.email,
                token: user.token
            });

            res.json('Cuenta creada correctamente.')
        } catch (error) {
            // console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static confirmAccount  = async (req: Request, res: Response) => {
        try {
            const { token } = req.body;
            
            const user = await User.findOne({where: {token}})

            if (!user) {
                const error = new Error('Token no valido');
                return res.status(401).json({error: error.message})
            }

            user.confirmed = true;
            user.token = null;
            
            await user.save();

            res.json("Cuenta confirmada correctamente")
        } catch (error) {
            // console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }
    
    static login  = async (req: Request, res: Response) => {
        try {

            const { email } = req.body;

            const user = await User.findOne({ where: { email } })

            if (!user) {
                const error = new Error('Usuario no encontrado.')
                return res.status(404).json({error: error.message})
            }

            if (!user.confirmed) {
                const error = new Error('La cuenta no ha sido confirmada.')
                return res.status(403).json({error: error.message})
            }

            const isPasswordCorrect = await checkPassword(req.body.password, user.password);

            if (!isPasswordCorrect) {
                const error = new Error('La contraseña es incorrecta.')
                return res.status(401).json({error: error.message})
            }

            const token = generateJWT(user.id);

            res.json(token)
            
        } catch (error) {
            // console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static forgotPassword  = async (req: Request, res: Response) => {
        try {

            const { email } = req.body;

            const user = await User.findOne({ where: { email } })

            if (!user) {
                const error = new Error('Usuario no encontrado.')
                return res.status(404).json({error: error.message})
            }

            user.token = generateToken();

            await user.save();

            await AuthEmail.sendPasswordResetToken({
                name: user.name,
                email: user.email,
                token: user.token
            })

            res.json('Revisa tu email para instrucciones.')

        } catch (error) {
            // console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static validateToken  = async (req: Request, res: Response) => {
        try {

            const { token } = req.body;
            
            const tokenExists = await User.findOne({where: {token}})

            if (!tokenExists) {
                const error = new Error('Token no valido');
                return res.status(401).json({error: error.message})
            }

            res.json("Token valido")
            
        } catch (error) {
            // console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static resetPassword  = async (req: Request, res: Response) => {
        try {

            const { token } = req.params;
            const { password } = req.body;
            
            const user = await User.findOne({where: {token}})

            if (!user) {
                const error = new Error('Token no valido');
                return res.status(401).json({error: error.message})
            }

            user.password = await hashPassword(password)
            user.token = null;

            await user.save();

            res.json("Contraseña actualizada correctamente.")
            
        } catch (error) {
            // console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static user  = async (req: Request, res: Response) => {
        res.json(req.user)
    }

    static updateCurrentUserPassword  = async (req: Request, res: Response) => {

        try {
            const { current_password, password } = req.body;

            const { id } = req.user;

            const user = await User.findByPk(id);

            const isPasswordCorrect = await checkPassword(current_password, user.password);

            if (!isPasswordCorrect) {
                const error = new Error('La contraseña actual es incorrecto.');
                return res.status(401).json({error: error.message})
            }

            user.password = await hashPassword(password)

            await user.save();

            res.json("Contraseña actualizada correctamente.")
        } catch (error) {
            // console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static checkPassword  = async (req: Request, res: Response) => {

        try {
            const { password } = req.body;

            const { id } = req.user;

            const user = await User.findByPk(id);

            const isPasswordCorrect = await checkPassword(password, user.password);

            if (!isPasswordCorrect) {
                const error = new Error('La contraseña actual es incorrecto.');
                return res.status(401).json({error: error.message})
            }

            res.json("Contraseña actual correcto.")
        } catch (error) {
            // console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }
}