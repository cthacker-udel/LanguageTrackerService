/* eslint-disable @typescript-eslint/brace-style -- disabled */
/* eslint-disable brace-style -- disabled */
/* eslint-disable @typescript-eslint/indent -- disabled */

import type { Activity, Route } from "@types";
import type { Request, Response } from "express";
import type { Client } from "pg";

import { type BaseControllerSpec, Logger } from "../../../../common";
import type { ActivityService } from "../service/activity.service";

/**
 *
 */
export class ActivityControllerGet
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

    public findActivity = async (
        request: Request,
        response: Response,
    ): Promise<void> => {
        const failureMessage = "Failed searching for activity";
        const failedSearchMessage = "Failed finding activity, does not exist.";
        try {
            const { id } = request.query;
            if (id === undefined) {
                response.status(400);
                response.send({ result: failedSearchMessage });
            } else {
                const result: Activity | undefined =
                    await this.service.findActivity(
                        this.client,
                        Number.parseInt(id as string, 10),
                    );
                if (result === undefined) {
                    response.status(400);
                    response.send({ result: failedSearchMessage });
                } else {
                    response.status(200);
                    response.send({ result });
                }
            }
        } catch (error: unknown) {
            Logger.error("Error while searching for activity", error);
            response.status(400);
            response.send({ result: failureMessage });
        }
    };

    public getDashboardActivities = async (
        request: Request,
        response: Response,
    ): Promise<void> => {
        const failureMessage = "Failed searching for dashboard activities";
        try {
            const { currentday } = request.query;
            if (currentday === undefined) {
                response.status(400);
                response.send({ result: failureMessage });
            } else {
                const result: Activity[] =
                    await this.service.getDashboardActivities(
                        this.client,
                        new Date(currentday as string),
                    );
                if (result.length === 0) {
                    response.status(204);
                    response.send({});
                } else {
                    response.status(200);
                    response.send(result);
                }
            }
        } catch (error: unknown) {
            Logger.error(failureMessage, error);
            response.status(400);
            response.send({ result: failureMessage });
        }
    };

    public getRoutes = (): Route[] => [
        ["findActivity", this.findActivity],
        ["dashboard", this.getDashboardActivities],
    ];
}
