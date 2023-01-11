const letters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:<>,.?~~?.,><:;|}{][=-+_)(*&^%$#@!9876543210ZYXWVUTSRQPONMLKJIHGFEDCBAzyxwvutsrqponmlkjihgfedcba";

/**
 * Takes a string of varying code points, and
 *
 * @param text - The text to normalize
 * @returns The normalized text
 */
export const normalizeText = (text: string): string =>
    [...text]
        .map(
            (eachLetter: string) =>
                letters[(eachLetter.codePointAt(0) ?? 0) % letters.length],
        )
        .join("");
