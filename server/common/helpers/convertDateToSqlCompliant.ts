/**
 * Converts a supplied date to postgres sql compliant
 *
 * @param date - The date to convert
 * @returns The converted date to postgres-sql compliant
 */
export const convertDateToSqlCompliant = (date: Date): string =>
    `'${date.getUTCFullYear()}-${
        date.getUTCMonth() + 1
    }-${date.getUTCDate()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}'`;
