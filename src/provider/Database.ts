import * as Client from "mariasql";
import {config as Config} from "../etc/config";
import { Logger } from "./Logger";

export class Database {

    private static readonly instance: Database = new Database();

    private connection;

    private logProvider: Logger;

    constructor()
    {
        if ( Database.instance ) {
            throw new Error("use Database.getInstance()");
        }
        this.logProvider = Logger.getInstance();
        this.connect();
    }

    public static getInstance(): Database {
        return this.instance;
    }

    public getConnection() {
        return this.connection;
    }

    /**
     * send db query
     *
     * @param {string} query
     * @param {*} [args={}] query arguments
     * @returns {Promise<any[]>} resolved rows
     * @memberof Database
     */
    public query(query: string, args: any = {}): Promise<any[]> {

        const dbQuery: Promise<any[]> = new Promise( (resolve, reject) => {
            this.connection.query(query, args, (err, rows: any[]) => {
                if ( err ) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
        return dbQuery;
    }

    private connect() {

        try {
            this.connection = new Client({
                db: Config.maria_db.database,
                host: Config.maria_db.host,
                password: Config.maria_db.password,
                user: Config.maria_db.username
            });
        } catch (dbException) {

            const logMessage = `
                db connection error:
                ${__filename}
                username: ${Config.maria_db.username},
                password: ${Config.maria_db.password},
                host    : ${Config.maria_db.host},
                database: ${Config.maria_db.database}`;

            this.logProvider
                .log(Logger.LOG_DEBUG, logMessage);
        }
    }
}
