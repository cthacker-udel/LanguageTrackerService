import type { Route, RouteMapping } from "@types";
import { type Router } from "express";

/**
 * The base controller class, meant to enforce a standard for every controller that is made, must contain these 2 methods
 */
export type BaseController = {
    ROUTE_PREFIX: string;
    getRouteMapping: () => RouteMapping;
    addRoutes: (_router: Router) => void;
};

/**
 * Updates the router instance to have the routes and their prefixes and middleware initialized properly
 *
 * @param _router - The router instance
 * @param routeMapping - The mapping of all the routes provided via the controller
 * @param routePrefix - The prefix we are adding to the route
 */
export const updateRoutes = (
    _router: Router,
    routeMapping: RouteMapping,
    routePrefix: string,
): void => {
    for (const eachKey of Object.keys(routeMapping)) {
        const routes: Route[] = routeMapping[eachKey];
        switch (eachKey) {
            case "get": {
                for (const eachRoute of routes) {
                    if (eachRoute[2] && eachRoute[2].length > 0) {
                        _router.get(`${routePrefix}${eachRoute[0]}`, [
                            ...eachRoute[2],
                            eachRoute[1],
                        ]);
                    } else {
                        _router.get(
                            `${routePrefix}${eachRoute[0]}`,
                            eachRoute[1],
                        );
                    }
                }
                break;
            }
            case "put": {
                for (const eachRoute of routes) {
                    if (eachRoute[2] && eachRoute[2].length > 0) {
                        _router.put(`${routePrefix}${eachRoute[0]}`, [
                            ...eachRoute[2],
                            eachRoute[1],
                        ]);
                    } else {
                        _router.put(
                            `${routePrefix}${eachRoute[0]}`,
                            eachRoute[1],
                        );
                    }
                }
                break;
            }
            case "post": {
                for (const eachRoute of routes) {
                    if (eachRoute[2] && eachRoute[2].length > 0) {
                        _router.post(`${routePrefix}${eachRoute[0]}`, [
                            ...eachRoute[2],
                            eachRoute[1],
                        ]);
                    } else {
                        _router.post(
                            `${routePrefix}${eachRoute[0]}`,
                            eachRoute[1],
                        );
                    }
                }
                break;
            }
            case "delete": {
                for (const eachRoute of routes) {
                    if (eachRoute[2] && eachRoute[2].length > 0) {
                        _router.delete(`${routePrefix}${eachRoute[0]}`, [
                            ...eachRoute[2],
                            eachRoute[1],
                        ]);
                    } else {
                        _router.delete(
                            `${routePrefix}${eachRoute[0]}`,
                            eachRoute[1],
                        );
                    }
                }
                break;
            }
            default: {
                break;
            }
        }
    }
};
