import * as FileSystem from "fs";
import { config as Config } from "../etc/config";

/**
 * Log Module
 *
 * @export
 * @class Logger
 */
export class Logger {

    /**
     *
     * @static
     * @memberof Logger
     */
    public static LOG_ERROR = "error";

    /**
     *
     * @static
     * @memberof Logger
     */
    public static LOG_DEBUG = "debug";

    /**
     *
     *
     * @private
     * @static
     * @memberof Logger
     */
    private static instance = new Logger();

    /**
     *
     *
     * @private
     * @type {string}
     * @memberof Logger
     */
    private path: string;

    /**
     *
     * @private
     * @type {Map<string, FileSystem.WriteStream>}
     * @memberof Logger
     */
    private streams: Map<string, FileSystem.WriteStream>

    /**
     * Creates an instance of Logger.
     * @memberof Logger
     */
    constructor() {
        if (Logger.instance) {
            throw new Error("could not create instance of Logger");
        }

        this.streams = new Map<string, FileSystem.WriteStream>();
        this.path    = Config.paths.logs;
        Logger.instance = this;
    }

    /**
     * get instance
     *
     * @static
     * @returns {Logger}
     * @memberof Logger
     */
    public static getInstance(): Logger {
        return Logger.instance;
    }

    /**
     *
     * @param {string} type
     * @param {*} body
     * @returns {Promise<void>}
     * @memberof Logger
     * @throws Error
     */
    public log(type: string, body: any, path: string = null): Promise<void> {

        return new Promise<void>((resolve, reject) => {
            let pathStat = null;

            try {
                pathStat = FileSystem.statSync( path || this.path);
            } catch (e) { pathStat = null; }

            if (!pathStat || !pathStat.isDirectory()) {
                throw new Error(`${path || this.path} is not an directory`);
            }

            const stream: FileSystem.WriteStream = this.getWriteStream(type, path);
            stream.write(this.createLogMessage(type, body), () => {
                resolve();
            });

            stream.on("error", (err) => {
                throw new Error(err);
            });
        });
    }

    /**
     *
     * @private
     * @param {string} type
     * @param {string} body
     * @returns {string}
     * @memberof Logger
     */
    private createLogMessage(type: string, body: string): string {
        let logMessage: string;

        const date = new Date();

        // create date string
        const dateString = `
        ${this.addLeadingZero(date.getDate().toString())}.
        ${this.addLeadingZero((date.getMonth() + 1).toString())}.
        ${date.getFullYear()}
        `.replace(/[\r\n\s]/g, "");

        // create time string
        const timeString = `
        ${this.addLeadingZero(date.getHours().toString())}:
        ${this.addLeadingZero(date.getMinutes().toString())}:
        ${this.addLeadingZero(date.getSeconds().toString())}
        `.replace(/[\r\n\s]/g, "");

        logMessage = `
----------------------------------------------------------------------
${dateString} ${timeString}:
${body}`;
        return logMessage;
    }

    /**
     *
     * @private
     * @param {any} type
     * @returns {FileSystem.WriteStream}
     * @memberof Logger
     */
    private getWriteStream(type, path: string = null): FileSystem.WriteStream {

        const name = `${path || this.path}/${type}`;

        if (this.streams.has(name)) {
            return this.streams.get(name);
        }

        const stream = FileSystem.createWriteStream(`${name}.log`, {
            defaultEncoding: "utf8",
            flags: "a+"
        });

        this.streams.set(name, stream);
        return stream;
    }

    /**
     * helper function to add leading zero
     *
     * @private
     * @param {string} value
     * @returns {string}
     * @memberof Logger
     */
    private addLeadingZero(value: string): string {
        return value.replace(/^(\d(?!\d))$/, "0$1");
    }
}
