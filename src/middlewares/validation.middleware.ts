import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const validateData = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body, {
            abortEarly: true, // include all errors
            allowUnknown: true, // ignore unknown props
            stripUnknown: false, // remove unknown props
        });
        if (error) {
            const errorMessage = error.details
                .map((detail) => detail.message)
                .join(", ");

            return res.status(400).json({ msg: errorMessage } as any);
        }
        next();
    };
};


