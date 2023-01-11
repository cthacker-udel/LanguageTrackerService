/* eslint-disable @typescript-eslint/brace-style -- disabled */
/* eslint-disable brace-style -- disabled */
/* eslint-disable @typescript-eslint/indent -- disabled */
import type { Activity, Route } from "@types";
import type { Request, Response } from "express";
import type { Client } from "pg";

import {
    type BaseControllerSpec,
    activityPostSchema,
    analyzeUser,
    Logger,
} from "../../../../common";
import type { ActivityService } from "../service/activity.service";

/**
 *
 */
export class ActivityControllerPost
    implements BaseControllerSpec<ActivityService>
{
    public service: ActivityService;

    public client: Client;

    /**
     * Instantiates an instance of the ActivityControllerPost class
     *
     * @param _client - The postgresql client
     * @param service - The instantiated service
     */
    public constructor(_client: Client, service: ActivityService) {
        this.service = service;
        this.client = _client;
    }

    public addActivity = async (
        request: Request,
        response: Response,
    ): Promise<void> => {
        const failureMessage = "Failed to add an activity";
        try {
            const {
                activity_date,
                description,
                language_type,
                activity_level,
                title,
                total_time,
                time_type,
                activity_type,
                username,
            } = request.body as Activity & { username: string };
            const isSameUsername = analyzeUser(request, username);
            if (isSameUsername) {
                const validationResult = activityPostSchema.validate(
                    request.body as Activity & { username: string },
                );
                if (
                    activity_date === undefined ||
                    title === undefined ||
                    description === undefined ||
                    activity_level === undefined ||
                    total_time === undefined ||
                    time_type === undefined ||
                    activity_type === undefined ||
                    language_type === undefined ||
                    username === undefined ||
                    validationResult.error !== undefined
                ) {
                    const constructedErrorResponse: {
                        result: string;
                        error?: string;
                    } = { result: failureMessage };
                    if (validationResult.error !== undefined) {
                        constructedErrorResponse.error =
                            validationResult.error.message;
                    }
                    response.status(400);
                    response.send(constructedErrorResponse);
                } else {
                    const addingActivityResult = await this.service.addActivity(
                        this.client,
                        request.body as Activity,
                        username,
                    );
                    if (addingActivityResult) {
                        response.status(204);
                        response.send({});
                    } else {
                        response.status(400);
                        response.send({ result: failureMessage });
                    }
                }
            } else {
                response.status(401);
                response.send({
                    result: "Must make request with username within cookie",
                });
            }
        } catch (error: unknown) {
            Logger.error(failureMessage, error);
            response.status(400);
            response.send({ result: failureMessage });
        }
    };

    public getRoutes = (): Route[] => [["addActivity", this.addActivity]];
}
