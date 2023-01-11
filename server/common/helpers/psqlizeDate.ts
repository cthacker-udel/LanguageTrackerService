/**
 * Converts a nodejs date to a date that is compliant with psql queries
 *
 * @param date - The date to convert
 * @returns The psql compliant date
 */
export const psqlizeDate = (date: Date): string =>
    `'${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}'`;
