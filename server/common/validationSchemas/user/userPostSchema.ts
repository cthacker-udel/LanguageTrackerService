/* eslint-disable newline-per-chained-call -- disabled */

import Joi from "joi";

export const userPostSchema = Joi.object({
    dob: Joi.date().optional(),
    email: Joi.string()
        .optional()
        .max(100)
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }),
    firstName: Joi.string().optional().max(50),
    lastName: Joi.string().optional().max(50),
    password: Joi.string().required().max(385),
    username: Joi.string().required().max(50),
});
