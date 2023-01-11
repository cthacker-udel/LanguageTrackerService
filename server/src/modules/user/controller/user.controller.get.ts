import type { Route, User } from "@types";
import type { Request, Response } from "express";
import type { Client } from "pg";

import type { BaseControllerSpec } from "../../../../common";
import { Logger } from "../../../../common/log/Logger";
import type { UserService } from "../user.service";

/**
 * Houses all the get requests for the user controller
 */
export class UserControllerGet implements BaseControllerSpec<UserService> {
    public service: UserService;

    public client: Client;

    /**
     * Constructs a UserControllerGet instance given the postgres client and the user service
     *
     * @param _client - The postgres client
     * @param userService - The user service
     */
    public constructor(_client: Client, _service: UserService) {
        this.client = _client;
        this.service = _service;
    }

    /**
     * GET request finding the user by field labeled after "By"
     *
     * @param request - The request the user is sending to the server
     * @param response - The response the user is receiving from the server
     */
    public findUserByUsername = async (
        request: Request,
        response: Response,
    ): Promise<void> => {
        try {
            const { username } = request.query;
            if (username === undefined) {
                response.status(400);
                response.send({
                    result: "Must supply username with request to find user",
                });
            } else {
                const foundUser: Partial<User> | undefined =
                    await this.service.findUserByUsername(
                        this.client,
                        username as string,
                    );
                if (foundUser === undefined) {
                    response.status(400);
                    response.send({
                        result: "Unable to find user via username",
                    });
                } else {
                    response.status(200);
                    response.send({ ...foundUser });
                }
            }
        } catch (error: unknown) {
            Logger.error("Error while searching for username", error);
            response.status(400);
            response.send({
                result: "Error searching for user via username",
            });
        }
    };

    /**
     * GET request finding the user by field labeled after "By"
     *
     * @param request - The request the user is sending to the server
     * @param response - The response the user is receiving from the server
     */
    public findUserByFirstName = async (
        request: Request,
        response: Response,
    ): Promise<void> => {
        try {
            const { firstName } = request.query;
            if (firstName === undefined) {
                response.status(400);
                response.send({
                    result: "Must supply firstName with request to find user",
                });
            } else {
                const foundUser: Partial<User[]> | undefined =
                    await this.service.findUsersByFirstName(
                        this.client,
                        firstName as string,
                    );
                if (foundUser === undefined) {
                    response.status(400);
                    response.send({
                        result: "Unable to find user via firstName",
                    });
                } else {
                    response.status(200);
                    response.send({ ...foundUser });
                }
            }
        } catch (error: unknown) {
            Logger.error("Error while searching for firstName", error);
            response.status(400);
            response.send({
                result: "Error searching for user via firstName",
            });
        }
    };

    /**
     * GET request finding the user by field labeled after "By"
     *
     * @param request - The request the user is sending to the server
     * @param response - The response the user is receiving from the server
     */
    public findUserByLastName = async (
        request: Request,
        response: Response,
    ): Promise<void> => {
        try {
            const { lastName } = request.query;
            if (lastName === undefined) {
                response.status(400);
                response.send({
                    result: "Must supply lastName with request to find user",
                });
            } else {
                const foundUser: Partial<User[]> | undefined =
                    await this.service.findUsersByLastName(
                        this.client,
                        lastName as string,
                    );
                if (foundUser === undefined) {
                    response.status(400);
                    response.send({
                        result: "Unable to find user via lastName",
                    });
                } else {
                    response.status(200);
                    response.send({ ...foundUser });
                }
            }
        } catch (error: unknown) {
            Logger.error("Error while searching for lastName", error);
            response.status(400);
            response.send({
                result: "Error searching for user via lastName",
            });
        }
    };

    /**
     * GET request finding the user by field labeled after "By"
     *
     * @param request - The request the user is sending to the server
     * @param response - The response the user is receiving from the server
     */
    public findUserByEmail = async (
        request: Request,
        response: Response,
    ): Promise<void> => {
        try {
            const { email } = request.query;
            if (email === undefined) {
                response.status(400);
                response.send({
                    result: "Must supply email with request to find user",
                });
            } else {
                const foundUser: Partial<User> | undefined =
                    await this.service.findUserByEmail(
                        this.client,
                        email as string,
                    );
                if (foundUser === undefined) {
                    response.status(400);
                    response.send({
                        result: "Unable to find user via email",
                    });
                } else {
                    response.status(200);
                    response.send({ ...foundUser });
                }
            }
        } catch (error: unknown) {
            Logger.error("Error while searching for email", error);
            response.status(400);
            response.send({
                result: "Error searching for user via email",
            });
        }
    };

    /**
     * GET request finding the user by field labeled after "By"
     *
     * @param request - The request the user is sending to the server
     * @param response - The response the user is receiving from the server
     */
    public findUserByUserId = async (
        request: Request,
        response: Response,
    ): Promise<void> => {
        try {
            const { userId } = request.query;
            if (userId === undefined) {
                response.status(400);
                response.send({
                    result: "Must supply userId with request to find user",
                });
            } else {
                const foundUser: Partial<User> | undefined =
                    await this.service.findUserByUserId(
                        this.client,
                        Number.parseInt(userId as string, 10),
                    );
                if (foundUser === undefined) {
                    response.status(400);
                    response.send({
                        result: "Unable to find user via userId",
                    });
                } else {
                    response.status(200);
                    response.send({ ...foundUser });
                }
            }
        } catch (error: unknown) {
            Logger.error("Error while searching for userId", error);
            response.status(400);
            response.send({
                result: "Error searching for user via userId",
            });
        }
    };

    /**
     * Test method, for debugging only
     *
     * @param request - testing request
     * @param response - testing response
     */
    // eslint-disable-next-line require-await, class-methods-use-this -- disabled
    public test = async (
        request: Request,
        response: Response,
        // eslint-disable-next-line @typescript-eslint/require-await -- disabled
    ): Promise<void> => {
        try {
            response.status(200);
            response.send({});
        } catch (error: unknown) {
            Logger.error("Failed test", error);
            response.status(400);
            response.send({ result: "Failed test" });
        }
    };

    public getRoutes = (): Route[] => [
        ["findByUsername", this.findUserByUsername],
        ["findByFirstName", this.findUserByFirstName],
        ["findByLastName", this.findUserByLastName],
        ["findByEmail", this.findUserByEmail],
        ["findByUserId", this.findUserByUserId],
        ["test", this.test],
    ];
}
