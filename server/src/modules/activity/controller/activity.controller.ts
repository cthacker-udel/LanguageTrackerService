import type { RouteMapping } from "@types";
import type { Router } from "express";
import type { Client } from "pg";
import type { UserService } from "src/modules/user/user.service";

import { type BaseController, updateRoutes } from "../../../../common";
import { ActivityService } from "../service/activity.service";
import { ActivityControllerGet } from "./activity.controller.get";
import { ActivityControllerPost } from "./activity.controller.post";

/**
 *
 */
export class ActivityController implements BaseController {
    public ROUTE_PREFIX = "/activity/";

    public client: Client;

    public activityService: ActivityService;

    public activityGet: ActivityControllerGet;

    public activityPost: ActivityControllerPost;

    protected userService: UserService;

    /**
     * One-arg constructor that takes in the postgresql client, and instantiates necessary services from that value
     *
     * @param _client - The postgresql client
     */
    public constructor(_client: Client, _userService: UserService) {
        this.client = _client;
        this.userService = _userService;
        this.activityService = new ActivityService(this.userService);
        this.activityGet = new ActivityControllerGet(
            this.client,
            this.activityService,
        );
        this.activityPost = new ActivityControllerPost(
            this.client,
            this.activityService,
        );
    }

    public getRouteMapping = (): RouteMapping => ({
        get: this.activityGet.getRoutes(),
        post: this.activityPost.getRoutes(),
    });

    public addRoutes = (_router: Router): void => {
        updateRoutes(_router, this.getRouteMapping(), this.ROUTE_PREFIX);
    };
}
