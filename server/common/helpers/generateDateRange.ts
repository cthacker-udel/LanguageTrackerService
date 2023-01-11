/* eslint-disable no-shadow -- disabled */
/* eslint-disable no-unused-vars -- disabled */
import { MillisecondConstants } from "../constants";

enum Dates {
    SUNDAY = 0,
    MONDAY = 1,
    TUESDAY = 2,
    WEDNESDAY = 3,
    THURSDAY = 4,
    FRIDAY = 5,
    SATURDAY = 6,
}

enum Direction {
    ASC = 0,
    DESC = 1,
}

/**
 *
 * @param date - The date to span it's surrounding dates for
 * @returns The day that is found from searching around the current date
 */
const findDay = (date: Date, day: Dates, direction: Direction): Date => {
    let foundDate = date.getDay() === day;
    let movingDate = new Date(date);
    while (!foundDate) {
        movingDate = new Date(
            movingDate.getTime() +
                (direction === Direction.ASC
                    ? MillisecondConstants.DAY
                    : -MillisecondConstants.DAY),
        );
        foundDate = movingDate.getDay() === day;
    }
    return movingDate;
};

/**
 * Generates the date range from the date supplied to it
 *
 * @param date - The date we are analyzing
 */
export const generateDateRange = (date: Date): Date[] => {
    const lowerDate: Date = findDay(
        new Date(date.getTime() - MillisecondConstants.WEEK),
        Dates.SATURDAY,
        Direction.ASC,
    );
    const upperDate: Date = findDay(
        new Date(date.getTime() + MillisecondConstants.WEEK),
        Dates.SUNDAY,
        Direction.DESC,
    );
    return [lowerDate, upperDate];
};
