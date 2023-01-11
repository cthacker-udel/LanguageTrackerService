/* eslint-disable node/no-process-env -- disabled */
/* eslint-disable @typescript-eslint/no-extraneous-class -- disabled */
import { createHmac, pbkdf2Sync, randomBytes, randomInt } from "node:crypto";

import type { EncryptionData } from "@types";

import { normalizeText } from "../../../common";

/**
 * Handles all encryption of the user data
 */
export class EncryptionService {
    /**
     *
     * @param password - The password we are encrypting
     */
    public static encrypt = (password: string): EncryptionData => {
        const pbkdf2Salt: string = normalizeText(
            randomBytes(32).toString("ascii"),
        );
        const pbkdf2Iterations: number = randomInt(1, 1000);
        const shaSalt: string = normalizeText(
            randomBytes(32).toString("ascii"),
        );
        const shaIterations: number = randomInt(1, 1000);
        const caesarRotations: number = randomInt(1, 1000);
        const caesarIterations: number = randomInt(1, 1000);

        let hashResult = pbkdf2Sync(
            password,
            pbkdf2Salt,
            pbkdf2Iterations,
            32,
            "sha512",
        ).toString("hex");

        for (let iter = 0; iter < shaIterations; iter += 1) {
            hashResult = createHmac("sha256", hashResult)
                .update(shaSalt)
                .digest("hex");
        }

        for (let iter = 0; iter < caesarIterations; iter += 1) {
            hashResult = [...hashResult]
                .map((eachLetter: string) =>
                    String.fromCodePoint(
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- disabled
                        (eachLetter.codePointAt(0)! + caesarRotations) % 65_535,
                    ),
                )
                .join("");
        }

        const encryptionResult: EncryptionData = {
            caesar_iterations: caesarIterations,
            caesar_rotations: caesarRotations,
            hash_result: hashResult,
            pbkdf2_iterations: pbkdf2Iterations,
            pbkdf2_salt: pbkdf2Salt,
            sha_iterations: shaIterations,
            sha_salt: shaSalt,
        };

        return encryptionResult;
    };

    /**
     * Executes a fixed encryption on the password supplied alongside the encryption information, used commonly when logging in or validating
     * the password supplied
     *
     * @param password - The password supplied by the user
     * @param pbkdf2Salt - The pbkdf2Salt supplied by the user
     * @param pbkdf2Iterations - The pbkdf2Iterations supplied by the user
     * @param shaIterations - The sha iterations supplied by the user
     * @param caesarRotations - The caesar rotations supplied by the user
     * @param caesarIterations - The caesar iterations supplied by the user
     */
    public static fixedEncryption(
        password: string,
        pbkdf2Salt: string,
        pbkdf2Iterations: number,
        shaSalt: string,
        shaIterations: number,
        caesarRotations: number,
        caesarIterations: number,
    ): string {
        let hashResult = pbkdf2Sync(
            password,
            pbkdf2Salt,
            pbkdf2Iterations,
            32,
            "sha512",
        ).toString("hex");

        for (let iter = 0; iter < shaIterations; iter += 1) {
            hashResult = createHmac("sha256", hashResult)
                .update(shaSalt)
                .digest("hex");
        }

        for (let iter = 0; iter < caesarIterations; iter += 1) {
            hashResult = [...hashResult]
                .map((eachLetter: string) =>
                    String.fromCodePoint(
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- disabled
                        (eachLetter.codePointAt(0)! + caesarRotations) % 65_535,
                    ),
                )
                .join("");
        }

        return hashResult;
    }

    /**
     * Encrypts the username and password into the session token to pass back to the user
     *
     * @param username - The username to hash
     * @param secret - The secret to generate the hash
     * @returns The encrypted session of the username + password
     */
    public static sessionEncryption(username: string, secret: string): string {
        const hashResult = pbkdf2Sync(
            `${secret}${username}`,
            `${username}${secret}`,
            process.env.SESSION_HASH_ITER
                ? Number.parseInt(process.env.SESSION_HASH_ITER, 10)
                : 1,
            16,
            "sha512",
        ).toString("hex");

        return hashResult;
    }

    public static generateSessionSecret = (): string => {
        const randomSessionSecret = randomBytes(16);
        const currentDateSalt = Date.now().toString();
        const sessionSecret = pbkdf2Sync(
            `${randomSessionSecret}${currentDateSalt}`,
            `${currentDateSalt}${randomSessionSecret}`,
            process.env.SESSION_HASH_ITER
                ? Number.parseInt(process.env.SESSION_HASH_ITER, 10)
                : 1,
            16,
            "sha512",
        ).toString("hex");
        return sessionSecret;
    };
}
