import type { Route } from "@types";
import type { Client } from "pg";

export type BaseControllerSpec<T> = {
    service: T;
    client: Client;
    getRoutes: () => Route[];
};
