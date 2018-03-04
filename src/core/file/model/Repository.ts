import { Database } from "@app-core";
import { IFile, IFileData } from '../api';

export class FileRepository {

    private static readonly instance: FileRepository = new FileRepository();

    private dbProvider: Database;

    private table: string = "video";

    constructor() {
        if ( FileRepository.instance ) {
            throw new Error("use Database.getInstance()");
        }
        this.dbProvider = Database.getInstance();
    }

    /**
     * 
     * 
     * @returns {Promise<number>} 
     * @memberof FileRepository
     */
    public async getTotal(): Promise<number> {
        const rows = await this.dbProvider.query(
            `SELECT COUNT(video_id) as total FROM ${this.table}`,
        );
        return rows[0].total;
    }

    /**
     * 
     * 
     * @static
     * @returns 
     * @memberof FileRepository
     */
    public static getInstance() {
        return this.instance;
    }

    /**
     *
     *
     * @param {number} [start=0]
     * @param {number} [limit=20]
     * @returns {Promise<IFile[]>}
     * @memberof FileRepository
     */
    public async list(start: number = 0, limit: number = 20): Promise<IFileData[]>
    {
        let rows: any[] = [];
        rows = await this.dbProvider.query(
            `SELECT * FROM ${this.table} LIMIT ${start},${limit}`
        );

        return rows;
    }

    /**
     * insert new file into database
     *
     * @param {IFile} file
     * @returns
     * @memberof FileRepository
     */
    public async add(file: IFile): Promise<any>
    {
        const query = `
            INSERT INTO ${this.table}
            (name, description, image, filename, type)
            VALUES(
                :name, :description, :image, :file, :type)
        `;

        return this.dbProvider.query( query, file.raw());
    }

    /**
     *
     *
     * @param {IVideoFile} file
     * @param {({[key: string]: string | number})} fields
     * @memberof FileRepository
     */
    public update(file: IFileData, fields: {[key: string]: string | number})
    {
        const data: string[] = [];
        Object.keys(fields).forEach( (col) => {
            const value = this.dbProvider.getConnection().escape(fields[col]);
            data.push(`${col}='${value}'`)
        });

        const query = `
            UPDATE ${this.table}
            SET ${data.join(",")}
            WHERE video_id=${file.id}`;

        return this.dbProvider.query(query);
    }
}
