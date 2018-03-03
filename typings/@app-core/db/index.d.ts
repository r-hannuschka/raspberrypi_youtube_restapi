import { IDataNode } from "rh-utils";

declare module '@app-core/db' {

    class Database {

        public static getInstance(): Database;

        public getConnection();

        public query(query: string, args?: IDataNode): Promise<any[]>;
    }
}