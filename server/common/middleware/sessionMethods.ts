/* eslint-disable no-restricted-syntax -- disabled */
/* eslint-disable node/callback-return -- disabled */
import type { NextFunction, Request, Response } from "express";
import type { Client } from "pg";

import type { User } from "../../@types";
import { Logger } from "../../common/log";
import { EncryptionService } from "../../src/modules/encryption/encryptionService";
import type { UserService } from "../../src/modules/user/user.service";

const CONSTANTS = {
    COOKIE_KEY: "ltcookie",
    THREE_HOURS_IN_MS: 10_800_000,
    USERNAME_KEY: "ltusername",
};

/**
 * Generates cookie expiration time
 *
 * @returns The new cookie expiration
 */
const generateCookieExpiration = (): Date =>
    new Date(Date.now() + CONSTANTS.THREE_HOURS_IN_MS);

/**
 * Generates cookie expiration date in the past according to RFC-6265 https://www.rfc-editor.org/rfc/rfc6265.html
 *
 * @returns The new cookie expiration date, which is in the past so therefore cookie is then deleted
 */
const generateCookieDeletionExpiration = (): Date =>
    new Date(Date.now() - CONSTANTS.THREE_HOURS_IN_MS);

/**
 * Checks if the session exists in the request
 *
 * @param request - The request to check if the session exists on the request
 * @returns Whether or not the session exists
 */
const doesSessionExist = (request: Request): boolean =>
    ("cookie" in request.headers &&
        request.headers?.cookie?.includes(`${CONSTANTS.COOKIE_KEY}=`)) ??
    false;

/**
 * Gets the session from the user request sent
 *
 * @param request - The request to process
 * @returns The session acquired from the request header
 */
const getSession = (request: Request): string | undefined => {
    if (!doesSessionExist(request)) {
        return "";
    }
    return request.header("cookie");
};

/**
 * Gets the username from the session
 *
 * @param request - The request to parse
 * @returns The username if available
 */
const getSessionUsername = (request: Request): string | undefined => {
    const session = getSession(request);
    if (!session?.includes(CONSTANTS.USERNAME_KEY)) {
        return undefined;
    }
    const splitSession = session.split(`${CONSTANTS.USERNAME_KEY}=`);
    if (splitSession.length === 1) {
        return undefined;
    }
    return splitSession[1];
};

/**
 * Gets the session cookie from the session
 *
 * @param request - The request to parse
 * @returns The session cookie if available
 */
const getSessionCookie = (request: Request): string | undefined => {
    const session = getSession(request);
    if (!session?.includes(CONSTANTS.COOKIE_KEY)) {
        return undefined;
    }
    const splitSession = session.split(`; ${CONSTANTS.USERNAME_KEY}=`);
    if (splitSession.length === 1) {
        return undefined;
    }
    return splitSession[0];
};

/**
 * Rejects the session of the request passed into the function
 *
 * @param response - The response to populate the remove cookie methods
 * @returns Whether or not the rejection was successful
 */
const rejectSession = (request: Request, response: Response): boolean => {
    if (doesSessionExist(request)) {
        response.cookie(CONSTANTS.COOKIE_KEY, "deleted", {
            expires: generateCookieDeletionExpiration(),
        });
        response.cookie(CONSTANTS.USERNAME_KEY, "deleted", {
            expires: generateCookieDeletionExpiration(),
        });
        return true;
    }
    return false;
};

/**
 * Adds a session to the response if no session already exists
 *
 * @param request - The request to add the session to
 * @param response - The response to add the session to
 * @returns Whether the session was successfully added to the response
 */
const addSession = async (
    request: Request,
    response: Response,
    client: Client,
    userService: UserService,
): Promise<boolean> => {
    const { username } = request.body as Partial<User>;
    if (username === undefined) {
        return false;
    }

    const sessionSecret = await userService.findUserSessionEncryptionData(
        client,
        username,
    );

    if (sessionSecret === undefined) {
        rejectSession(request, response);
        return false;
    }

    const encryptedSession = EncryptionService.sessionEncryption(
        username,
        sessionSecret,
    );

    response.cookie(CONSTANTS.COOKIE_KEY, encryptedSession, {
        expires: generateCookieExpiration(),
        sameSite: "lax",
    });
    response.cookie(CONSTANTS.USERNAME_KEY, username, {
        expires: generateCookieExpiration(),
        sameSite: "lax",
    });

    return true;
};

/**
 *
 * @param request
 */
const validateSession = async (
    request: Request,
    client: Client,
    userService: UserService,
): Promise<boolean> => {
    if (request.method === "OPTIONS") {
        return true;
    }

    const username = getSessionUsername(request);
    if (username === undefined || !(typeof username === "string")) {
        return false;
    }

    const result = await userService.findUserSessionEncryptionData(
        client,
        username,
    );

    if (result === undefined) {
        return false;
    }

    const encryptedSession = EncryptionService.sessionEncryption(
        username,
        result,
    );
    const userCookie = getSessionCookie(request);
    if (userCookie === undefined) {
        return false;
    }
    const userCookieEncryptedValue = userCookie.replace(
        `${CONSTANTS.COOKIE_KEY}=`,
        "",
    );
    return userCookieEncryptedValue === encryptedSession;
};

/**
 * The middleware function to validate the cookies
 *
 * @param request - The request being processed
 * @param response - The response being processed
 * @param next - The next function in the middleware chain
 */
const cookieMiddleware = (
    request: Request,
    response: Response,
    next: NextFunction,
    client: Client,
    userService: UserService,
): void => {
    try {
        if (
            (request.url.includes("login") ||
                request.url.includes("addUser") ||
                request.url.includes("validateSession")) &&
            !doesSessionExist(request)
        ) {
            next();
        } else {
            validateSession(request, client, userService)
                .then((result: boolean) => {
                    if (result) {
                        next();
                    } else {
                        Logger.log(
                            `${request.url} - ${request.ip} - unauthorized`,
                        );
                        rejectSession(request, response);
                        response.status(401);
                        response.send({ result: "Unauthorized" });
                    }
                })
                .catch((error: unknown) => {
                    Logger.log(`${request.url} - ${request.ip} - unauthorized`);
                    rejectSession(request, response);
                    Logger.error("Failed to validate session cookie", error);
                    response.status(401);
                    response.send({ result: "Unauthorized" });
                });
        }
    } catch (error: unknown) {
        Logger.error("Failed to validate session", error);
        response.status(401);
        response.send({ result: "Login to use application" });
    }
};

export {
    addSession,
    cookieMiddleware,
    doesSessionExist,
    getSession,
    getSessionCookie,
    getSessionUsername,
    rejectSession,
    CONSTANTS as SESSION_CONSTANTS,
    validateSession,
};
