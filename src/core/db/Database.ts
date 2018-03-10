import * as Client from "mariasql";
import { Config, Log } from "rh-utils";

export class Database {

    private static readonly instance: Database = new Database();

    private connection;

    private logProvider: Log;

    private configProvider: Config;

    constructor()
    {
        if ( Database.instance ) {
            throw new Error("use Database.getInstance()");
        }
        this.logProvider    = Log.getInstance();
        this.configProvider = Config.getInstance();
    }

    public static getInstance(): Database {
        return this.instance;
    }

    public getConnection() {
        if ( ! this.connection ) {
            this.connect();
        }
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
    public async query(query: string, args: any = {}): Promise<any[]> {
        const connection = this.getConnection();
        const dbQuery: Promise<any[]> = new Promise( (resolve, reject) => {
            const q = connection.query(query, args, (err, rows: any[]) => {
                if ( err ) {
                    const errorData = {
                        message: err,
                        query: q.sql
                    }
                    reject(errorData);
                    return;
                }
                resolve(rows);
            });
        });
        return dbQuery;
    }

    private connect() {

        const dbConfig = this.configProvider.get("maria_db");

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
                .log(Log.LOG_DEBUG, logMessage);
        }
    }
}
