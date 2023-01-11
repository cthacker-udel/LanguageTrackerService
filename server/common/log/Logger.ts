/* eslint-disable no-console -- disabled */
/* eslint-disable @typescript-eslint/no-extraneous-class -- disabled solely for this class */

/**
 * The logger class, which reduces the amount of rule disabling we have to do, while housing the logging logic to one class
 */
export class Logger {
    /**
     * Console logs whichever output is given to it
     *
     * @param message - The message to log
     * @param error - The error to log
     */
    public static log = (message: string, error?: unknown): void => {
        console.log(
            `${new Date().toString()} --$ [${message}] | ${
                (error as Error)?.stack
            }`,
        );
    };

    /**
     * Console info logs whichever output is given to it
     *
     * @param message - The message to log
     * @param error - The error to log
     */
    public static info = (message: string, error?: unknown): void => {
        console.info(
            `${new Date().toTimeString()} --$ [${message}] | ${
                (error as Error)?.stack
            }`,
        );
    };

    /**
     * Console debugs logs whichever output is given to it
     *
     * @param message - The message to log
     * @param error - The error to log
     */
    public static debug = (message: string, error?: unknown): void => {
        console.debug(
            `${new Date().toTimeString()} --$ [${message}] | ${
                (error as Error)?.stack
            }`,
        );
    };

    /**
     * Console error logs whichever output is given to it
     *
     * @param message - The message to log
     * @param error - The error to log
     */
    public static error = (message: string, error?: unknown): void => {
        console.error(
            `${new Date().toTimeString()} --$ [${message}] | ${
                (error as Error)?.stack
            }`,
        );
    };
}
