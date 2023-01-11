import type { Request } from "express";

import { getSessionUsername } from "./sessionMethods";

/**
 * Checks whether the request coming in contains the same username as is existent in the request
 *
 * @param request - The request to analyze
 * @param username - The username we are sending in our request
 * @returns Whether or not both users match
 */
export const analyzeUser = (
    request: Request,
    username: string | undefined,
): boolean => {
    const session_username = getSessionUsername(request);
    if (session_username === undefined || username === undefined) {
        return false;
    }
    return session_username === username;
};
