/* eslint-disable no-console -- disabled */
/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments -- disabled */
/* eslint-disable @typescript-eslint/no-explicit-any -- disabled */
import type { QueryResult } from "pg";

/**
 * Utility function to help with debugging queries
 *
 * @param title - The title of the log
 * @param query - The query we are logging
 * @param result - The result of the query
 */
export const debugQuery = (
    title: string,
    query: string,
    result?: QueryResult<any>,
): void => {
    console.log(
        `-------------${title}-------------\n${query}\nSUCCEEDED: ${
            result ? result.rowCount > 0 : false
        }\n---------------------------------------`,
    );
};
