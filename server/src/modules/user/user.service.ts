/* eslint-disable class-methods-use-this -- disabled */
/* eslint-disable max-statements -- disabled */
/* eslint-disable camelcase -- disabled */
import type { Client } from "pg";

import type { EncryptionData, User } from "../../../@types";
import { BaseService, convertDateToSqlCompliant } from "../../../common";
import { EncryptionService } from "../encryption/encryptionService";

/**
 * The User Service, which controls all operations regarding users within the application
 */
export class UserService extends BaseService {
    /**
     * No-arg constructor of the user service, which constructs the service and assigns the table name of USER to the service
     */
    public constructor() {
        super("USER_DATA");
    }

    /**
     * Finds a user via the username passed in
     *
     * @param client - The postgres client we are utilizing to find the user
     * @param username - The username we are searching for
     * @returns Whether or not the user exists
     */
    public findUserByUsername = async (
        client: Client,
        username: string,
    ): Promise<Partial<User> | undefined> => {
        const result = await client.query(
            `SELECT first_name, last_name, dob, user_id, email from ${this.TABLE_NAME} WHERE username='${username}';`,
        );
        return result.rowCount > 0 ? result.rows[0] : undefined;
    };

    /**
     * Searches for a user within the database given the first name
     *
     * @param client - The postgres client
     * @param firstName - The first name we are searching for
     * @returns The partial user that is found from searching in the database
     */
    public findUsersByFirstName = async (
        client: Client,
        firstName: string,
    ): Promise<Partial<User[]> | undefined> => {
        const result = await client.query(
            `SELECT first_name, last_name, dob, user_id, email from ${this.TABLE_NAME} WHERE first_name='${firstName}';`,
        );
        return result.rowCount > 0 ? result.rows : undefined;
    };

    /**
     * Searches for a user within the database given the last name
     *
     * @param client - The postgres client
     * @param lastName - The last name we are searching for
     * @returns The partial user that is found searching in the database
     */
    public findUsersByLastName = async (
        client: Client,
        lastName: string,
    ): Promise<Partial<User[]> | undefined> => {
        const result = await client.query(
            `SELECT first_name, last_name, dob, user_id, email from ${this.TABLE_NAME} WHERE last_name='${lastName}';`,
        );
        return result.rowCount > 0 ? result.rows : undefined;
    };

    /**
     * Searches for a user within the database given the user id
     *
     * @param client - The postgres client
     * @param userId - The user id we are searching for
     * @returns The partial user that is found searching in the database
     */
    public findUserByUserId = async (
        client: Client,
        userId: number,
    ): Promise<Partial<User> | undefined> => {
        const result = await client.query(
            `SELECT first_name, last_name, dob, user_id, email from ${this.TABLE_NAME} WHERE user_id=${userId};`,
        );
        return result.rowCount > 0 ? result.rows[0] : undefined;
    };

    /**
     * Searches for a user within the database given the email
     *
     * @param client - The postgres client
     * @param email - The email we are searching for
     * @returns The partial user that is found searching in the database
     */
    public findUserByEmail = async (
        client: Client,
        email: string,
    ): Promise<Partial<User> | undefined> => {
        const result = await client.query(
            `SELECT first_name, last_name, dob, user_id, email from ${this.TABLE_NAME} WHERE email='${email}';`,
        );
        return result.rowCount > 0 ? result.rows[0] : undefined;
    };

    public doesUserExist = async (
        client: Client,
        username: string,
    ): Promise<boolean> => {
        const result = await this.findUserByUsername(client, username);
        return result !== undefined;
    };

    public addUser = async (client: Client, user: User): Promise<boolean> => {
        const isExisting = await this.doesUserExist(client, user.username);

        if (isExisting) {
            return false;
        }

        const { firstName, lastName, dob, email, username, password } = user;

        const { hash_result: hashResult, ..._rest } =
            EncryptionService.encrypt(password);

        let values = [`'${username}'`];

        if (firstName !== undefined) {
            values.push(`'${firstName}'`);
        }

        if (lastName !== undefined) {
            values.push(`'${lastName}'`);
        }

        if (dob !== undefined) {
            values.push(convertDateToSqlCompliant(dob));
        }

        if (email !== undefined) {
            values.push(`'${email}'`);
        }

        values = [
            ...values,
            `'${hashResult}'`,
            convertDateToSqlCompliant(new Date()),
            convertDateToSqlCompliant(new Date()),
            convertDateToSqlCompliant(new Date()),
        ];

        const query = `INSERT INTO ${this.TABLE_NAME} (username, ${
            firstName === undefined ? "" : "first_name,"
        } ${lastName === undefined ? "" : "last_name,"} ${
            dob === undefined ? "" : "dob,"
        } ${
            email === undefined ? "" : "email,"
        } password, last_login, last_modified_by_date, created_date) VALUES (${values.join(
            ", ",
        )});`;

        const result = await client.query(query);

        if (result.rowCount > 0) {
            const foundRow = await this.findUserByUsername(client, username);
            if (foundRow !== undefined) {
                const { user_id } = foundRow;
                const encryptionQuery = `INSERT INTO "ENCRYPTION_DATA" (user_id, caesar_iterations, caesar_rotations, pbkdf2_iterations, pbkdf2_salt, sha_iterations, sha_salt) VALUES (${user_id}, ${Object.values(
                    _rest,
                )
                    .map((eachValue) => `'${eachValue}'`)
                    .join(", ")});`;
                const encryptionResult = await client.query(encryptionQuery);
                if (encryptionResult.rowCount > 0) {
                    const findEncryptionRowQuery =
                        await this.findUserEncryptionData(client, user_id);
                    const updateEncryptionIdQuery = `UPDATE ${this.TABLE_NAME} SET encryption_id=${findEncryptionRowQuery?.encryption_id} WHERE user_id=${user_id};`;
                    const updateEncryptionIdQueryResult = await client.query(
                        updateEncryptionIdQuery,
                    );
                    return updateEncryptionIdQueryResult.rowCount > 0;
                }
                const deleteUserQuery = `DELETE FROM ${this.TABLE_NAME} WHERE user_id=${user_id}`;
                const deleteResult = await client.query(deleteUserQuery);
                return !(deleteResult.rowCount === 1);
            }
            return false;
        }
        return false;
    };

    /**
     * Attempts to log the user in
     *
     * @param client - The postgres sql client
     * @param username - The username we are attempting to login
     * @param password - The password the user supplied
     */
    public login = async (
        client: Client,
        username: string,
        password: string,
    ): Promise<boolean> => {
        const doesUsernameExist = await this.doesUserExist(client, username);
        if (!doesUsernameExist) {
            return false;
        }
        const foundUser = await this.findUserByUsernameWithPassword(
            client,
            username,
        );
        const userEncryptionInformation = await this.findUserEncryptionData(
            client,
            foundUser?.user_id,
        );

        const {
            pbkdf2_salt,
            pbkdf2_iterations,
            sha_salt,
            sha_iterations,
            caesar_iterations,
            caesar_rotations,
        } = userEncryptionInformation as EncryptionData;

        const encryptedPassword = EncryptionService.fixedEncryption(
            password,
            pbkdf2_salt,
            pbkdf2_iterations,
            sha_salt,
            sha_iterations,
            caesar_rotations,
            caesar_iterations,
        );

        const addedSessionData = await this.addUserSessionSecretData(
            client,
            foundUser?.user_id,
        );

        return (
            addedSessionData &&
            foundUser?.password === encryptedPassword &&
            foundUser.username === username
        );
    };

    /**
     * Finds a user via the username passed in
     *
     * @param client - The postgres client we are utilizing to find the user
     * @param username - The username we are searching for
     * @returns Whether or not the user exists
     */
    public readonly findUserByUsernameWithPassword = async (
        client: Client,
        username: string,
    ): Promise<Partial<User> | undefined> => {
        const result = await client.query(
            `SELECT username, first_name, last_name, dob, user_id, password, email from ${this.TABLE_NAME} WHERE username='${username}';`,
        );
        return result.rowCount > 0 ? result.rows[0] : undefined;
    };

    public readonly findUserSessionEncryptionData = async (
        client: Client,
        username: string,
    ): Promise<string | undefined> => {
        const foundUser = await this.findUserByUsername(client, username);
        const findSessionEncryptionDataQuery = `SELECT session_secret FROM "SESSION_SECRET" WHERE user_id=${foundUser?.user_id};`;
        const foundSessionSecret = await client.query(
            findSessionEncryptionDataQuery,
        );
        return foundSessionSecret.rowCount > 0
            ? foundSessionSecret.rows[0].session_secret
            : undefined;
    };

    /**
     * Determines if a session is in the records for the user
     *
     * @param client - The psql client
     * @param user_id - The user_id we are analyzing if the session for that user exists
     * @returns Whether or not the session exists
     */
    public readonly doesSessionExist = async (
        client: Client,
        user_id: number,
    ): Promise<boolean> => {
        const findSessionQuery = `SELECT id, user_id FROM "SESSION_SECRET" WHERE user_id=${user_id}`;
        const foundSessionResult = await client.query(findSessionQuery);
        return foundSessionResult.rowCount > 0;
    };

    /**
     * Attempts to remove a session row from the database
     *
     * @param client - The psql client
     * @param user_id - The user_id we are using to remove the row
     * @returns Whether or not the row was removed
     */
    public readonly removeSession = async (
        client: Client,
        user_id: number,
    ): Promise<boolean> => {
        const removeSessionQuery = `DELETE FROM "SESSION_SECRET" WHERE user_id=${user_id}`;
        const removeSessionResult = await client.query(removeSessionQuery);
        return removeSessionResult.rowCount > 0;
    };

    /**
     * Finds the encryption data associated with the user
     *
     * @param client - The client we are using to execute the query to find the encryption data
     * @param user_id - The user id we are using to locate the encryption data
     */
    private readonly findUserEncryptionData = async (
        client: Client,
        user_id: number | undefined,
    ): Promise<Partial<EncryptionData | undefined>> => {
        if (user_id !== undefined) {
            const query = `SELECT encryption_id, user_id, pbkdf2_salt, pbkdf2_iterations, sha_salt, sha_iterations, caesar_rotations, caesar_iterations FROM "ENCRYPTION_DATA" WHERE user_id=${user_id};`;
            const result = await client.query(query);
            return result.rows[0] as Partial<EncryptionData>;
        }
        return undefined;
    };

    /**
     * Checks in the database for any session data entries with the same user_id that was passed in
     *
     * @param client - the postgres client
     * @param user_id - the user id we are checking if the session data already exists for
     */
    private readonly doesSessionSecretDataExist = async (
        client: Client,
        user_id: number,
    ): Promise<boolean> => {
        const doesSessionSecretExistQuery = `SELECT * FROM "SESSION_SECRET" WHERE user_id=${user_id};`;
        const result = await client.query(doesSessionSecretExistQuery);
        return result.rowCount > 0;
    };

    /**
     * Updates the row containing the user's session secret data
     *
     * @param client - The postgres client
     * @param user_id - The user_id
     * @returns Whether the session data was updated successfully or not
     */
    private readonly updateSessionSecretData = async (
        client: Client,
        user_id: number,
    ): Promise<boolean> => {
        const generatedSessionSecret =
            EncryptionService.generateSessionSecret();
        const updateQuery = `UPDATE "SESSION_SECRET" SET session_secret='${generatedSessionSecret}' WHERE user_id=${user_id};`;
        const updateResult = await client.query(updateQuery);
        return updateResult.rowCount > 0;
    };

    /**
     * Adds/updates the row containing the session data with new data or in regards to the table an entire new row
     *
     * @param client - The postgres client
     * @param user_id - The user_id
     * @returns Whether the session data was added/altered successfully
     */
    private readonly addUserSessionSecretData = async (
        client: Client,
        user_id: number | undefined,
    ): Promise<boolean> => {
        if (user_id === undefined) {
            return false;
        }
        const doesSessionDataExist = await this.doesSessionSecretDataExist(
            client,
            user_id,
        );
        if (doesSessionDataExist) {
            const updateResult = await this.updateSessionSecretData(
                client,
                user_id,
            );
            return updateResult;
        }
        const generatedSessionSecret =
            EncryptionService.generateSessionSecret();
        const addQuery = `INSERT INTO "SESSION_SECRET" (session_secret, user_id) VALUES ('${generatedSessionSecret}', ${user_id});`;
        const addResult = await client.query(addQuery);
        return addResult.rowCount > 0;
    };
}
