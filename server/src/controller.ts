import express, { type Router } from "express";
import type { Client } from "pg";

import { ActivityController } from "./modules/activity/controller/activity.controller";
import { UserController } from "./modules/user/controller/user.controller";
import { UserService } from "./modules/user/user.service";

/**
 * The main controller for the application houses all the route logic and DI-ish implementation
 */
export class AppController {
    // eslint-disable-next-line new-cap -- disabled, express naming should not be overridden
    private readonly router: express.Router = express.Router();

    private readonly userController: UserController;

    private readonly activityController: ActivityController;

    private readonly userService: UserService;

    /**
     * Constructs the app controller which will be used for instantiating all the controller classes
     *
     * @param _client - The postgres client
     */
    public constructor(_client: Client) {
        this.userService = new UserService();
        this.userController = new UserController(_client);
        this.activityController = new ActivityController(
            _client,
            this.userService,
        );

        this.userController.addRoutes(this.router);
        this.activityController.addRoutes(this.router);
    }

    public getRouter = (): Router => this.router;
}
