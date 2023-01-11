/* eslint-disable newline-per-chained-call -- disabled */

import Joi from "joi";

export const activityPostSchema = Joi.object({
    activity_date: Joi.date().required(),
    activity_level: Joi.number().required(),
    activity_type: Joi.number().required(),
    description: Joi.string().max(150).optional(),
    language_type: Joi.number().required(),
    link: Joi.string().optional().max(200).min(0),
    time_type: Joi.number().required(),
    title: Joi.string().required().max(75),
    total_time: Joi.number().required(),
    username: Joi.string().required(),
});
