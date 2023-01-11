/* eslint-disable @typescript-eslint/no-explicit-any -- disabled */

import type { Activity } from "@types";
import type { Client } from "pg";
import type { UserService } from "src/modules/user/user.service";

import { BaseService, psqlizeDate } from "../../../../common";
import { generateDateRange } from "../../../../common/helpers/generateDateRange";

/**
 *
 */
export class ActivityService extends BaseService {
    protected userService: UserService;

    /**
     *
     */
    public constructor(userService: UserService) {
        super("ACTIVITY");
        this.userService = userService;
    }

    /**
     * Finds the activity given the id of the activity
     *
     * @param client - The postgresql client
     * @param id - The id of the activity
     * @returns The found activity, or undefined if it does not exist
     */
    public findActivity = async (
        client: Client,
        id: number,
    ): Promise<Activity | undefined> => {
        this.setTableName("ACTIVITY");
        const findQueryConstructor = `SELECT * FROM ${this.TABLE_NAME} WHERE id=${id}`;
        const findResult = await client.query(findQueryConstructor);
        if (findResult.rows.length === 0) {
            return undefined;
        }
        return findResult.rows[0] as Activity;
    };

    /**
     * Checks if the activity type exists
     *
     * @param client - The postgres client
     * @param type - The type the user is searching for
     * @returns Whether or not the activity type exists
     */
    public doesActivityTypeExist = async (
        client: Client,
        type: number,
    ): Promise<boolean> => {
        this.setTableName("ACTIVITY_TYPE");
        const findActivityTypeQuery = `SELECT * FROM ${this.TABLE_NAME} WHERE id=${type}`;
        const findResult = await client.query(findActivityTypeQuery);
        return findResult.rowCount > 0;
    };

    /**
     * Checks if the activity language exists
     *
     * @param client - The postgres client
     * @param language - The language the user is searching for
     * @returns Whether or not the language exists
     */
    public doesActivityLanguageExist = async (
        client: Client,
        language: number,
    ): Promise<boolean> => {
        this.setTableName("ACTIVITY_LANGUAGE");
        const findActivityLanguageQuery = `SELECT * FROM ${this.TABLE_NAME} WHERE id=${language}`;
        const findActivityLanguageResult = await client.query(
            findActivityLanguageQuery,
        );
        return findActivityLanguageResult.rowCount > 0;
    };

    /**
     * Checks if the activity level exists
     *
     * @param client - The postgres client
     * @param level - The level the user is searching for
     * @returns Whether or not the level exists
     */
    public doesActivityLevelExist = async (
        client: Client,
        level: number,
    ): Promise<boolean> => {
        this.setTableName("ACTIVITY_LEVEL");
        const findActivityLevelQuery = `SELECT * FROM ${this.TABLE_NAME} WHERE id=${level}`;
        const findActivityLevelResult = await client.query(
            findActivityLevelQuery,
        );
        return findActivityLevelResult.rowCount > 0;
    };

    /**
     * Checks if the time measurement exists
     *
     * @param client - The postgres client
     * @param level - The time measurement the user is searching for
     * @returns Whether or not the time measurement exists
     */
    public doesTimeMeasurementExist = async (
        client: Client,
        measurement: number,
    ): Promise<boolean> => {
        this.setTableName("TIME_MEASUREMENT");
        const findTimeMeasurementQuery = `SELECT * FROM ${this.TABLE_NAME} WHERE id=${measurement}`;
        const findTimeMeasurementResult = await client.query(
            findTimeMeasurementQuery,
        );
        return findTimeMeasurementResult.rowCount > 0;
    };

    /**
     * Added an activity to the database
     *
     * @param client - postgresql client
     * @param activity - The activity we are adding
     * @returns Whether the activity was added successfully or not
     */
    public addActivity = async (
        client: Client,
        activity: Activity,
        username: string,
    ): Promise<boolean> => {
        this.setTableName("ACTIVITY");
        const foundUser = await this.userService.findUserByUsername(
            client,
            username,
        );

        if (foundUser === undefined) {
            return false;
        }
        const insertionSetup = `INSERT INTO ${this.TABLE_NAME} (title, ${
            activity.description === undefined ? "" : "description,"
        } activity_type, total_time, time_type, language_type, activity_level, ${
            activity.link === undefined ? "" : "link,"
        } activity_date, user_id) VALUES `;
        const insertionValues = `('${activity.title}', ${
            activity.description === undefined
                ? ""
                : `'${activity.description}',`
        } ${activity.activity_type}, ${activity.total_time}, ${
            activity.time_type
        }, ${activity.language_type}, ${activity.activity_level}, ${
            activity.link === undefined ? "" : `'${activity.link}',`
        } to_timestamp(${new Date(activity.activity_date).getTime() / 1000}), ${
            foundUser.user_id
        });`;

        const insertionQuery = `${insertionSetup}${insertionValues}`;

        const insertResult = await client.query(insertionQuery);
        return insertResult.rowCount > 0;
    };

    public getDashboardActivities = async (
        client: Client,
        currentDate: Date,
    ): Promise<Activity[]> => {
        this.setTableName("ACTIVITY");
        const [startDate, endDate] = generateDateRange(currentDate);
        const dateQuery = `SELECT * FROM "ACTIVITY" WHERE activity_date BETWEEN ${psqlizeDate(
            startDate,
        )} AND ${psqlizeDate(endDate)}`;

        const queryResult = await client.query(dateQuery);

        return queryResult.rows;
    };
}
