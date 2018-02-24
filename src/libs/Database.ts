import * as Client from "mariasql";
import { AppConfig } from "./AppConfig";
import { Logger } from "./Log";

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

        const dbConfig = AppConfig.get('maria_db');

        try {
            this.connection = new Client({
                db      : dbConfig.database,
                host    : dbConfig.host,
                password: dbConfig.password,
                user    : dbConfig.username
            });
        } catch (dbException) {
            const logMessage = `
                db connection error:
                ${__filename}
                username: ${dbConfig.username},
                password: ${dbConfig.password},
                host    : ${dbConfig.host},
                database: ${dbConfig.database}`;

            this.logProvider
                .log(Logger.LOG_DEBUG, logMessage);
        }
    }

}
