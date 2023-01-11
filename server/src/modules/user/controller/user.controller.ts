import type { RouteMapping } from "@types";
import type { Router } from "express";
import type { Client } from "pg";

import { type BaseController, updateRoutes } from "../../../../common";
import { UserService } from "../user.service";
import { UserControllerGet } from "./user.controller.get";
import { UserControllerPost } from "./user.controller.post";

/**
 *
 */
export class UserController implements BaseController {
    public ROUTE_PREFIX = "/user/";

    public client: Client;

    public userService: UserService;

    public userGet: UserControllerGet;

    public userPost: UserControllerPost;

    /**
     * One-arg constructor for user controller to execute sql queries
     *
     * @param _client - The PSql client we are passing into the constructor in order to utilize sql operations
     */
    public constructor(_client: Client) {
        this.client = _client;
        this.userService = new UserService();
        this.userGet = new UserControllerGet(this.client, this.userService);
        this.userPost = new UserControllerPost(this.client, this.userService);
    }

    public getRouteMapping = (): RouteMapping => ({
        get: this.userGet.getRoutes(),
        post: this.userPost.getRoutes(),
    });

    public addRoutes = (_router: Router): void => {
        updateRoutes(_router, this.getRouteMapping(), this.ROUTE_PREFIX);
    };
}
