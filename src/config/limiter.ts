import { rateLimit } from "express-rate-limit";

export const limiter = rateLimit({
    windowMs: 60 * 1000, // Cuanto tiempo va a recordar los request
    limit: 5, //Cuantos request le permite al usuario hacer dentro de ese tiempo
    message: {"error": "Has alncanzado el límite de peticiones."}
})