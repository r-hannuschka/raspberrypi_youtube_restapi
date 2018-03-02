import { IFile } from "../api/FileInterface";
import { Database } from "../../../libs/Database";

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
    public async list(start: number = 0, limit: number = 20): Promise<IFile[]>
    {
        const total: number = await this.getTotal();

        let rows: IFile[] = [];
        rows = await this.dbProvider.query(
            `SELECT * FROM ${this.table} LIMIT ${start},${limit}`
        );

        // das noch umwandel muss in model daten ...
        // es kann sein das es sich hierbei um ein Video handelt mit einen Image
        // dann muss ich noch das Bild filzen 

        return rows;
    }

    /**
     * insert new file into database
     *
     * @param {IFile} file
     * @returns
     * @memberof FileRepository
     */
    public insert(file: IFile): Promise<any>
    {
        const query = `
            INSERT INTO ${this.table}
            (name, description,image, filename, path, type)
            VALUES(:name,:description,:image,:fileName,:path,:type)
        `;

        return this.dbProvider.query( query, file)
    }

    /**
     *
     *
     * @param {IVideoFile} file
     * @param {({[key: string]: string | number})} fields
     * @memberof FileRepository
     */
    public update(file: IFile, fields: {[key: string]: string | number})
    {
        const data: string[] = [];
        Object.keys(fields).forEach( (col) => {
            const value = this.dbProvider.getConnection().escape(fields[col]);
            data.push(`${col}='${value}'`)
        });

        const query = `
            UPDATE ${this.table}
            SET ${data.join(",")}
            WHERE video_id=${file.getId()}`;

        return this.dbProvider.query(query);
    }
}
