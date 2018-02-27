import { IVideoFile } from "../../../../libs/file/api/VideoFile";
import { Database } from "../../../../libs/Database";
import { IVideoResult } from "../../api/VideoResponse";

export class VideoRepository {

    private static readonly instance: VideoRepository = new VideoRepository();

    private dbProvider: Database;

    private table: string = "video";

    constructor() {
        if ( VideoRepository.instance ) {
            throw new Error("use Database.getInstance()");
        }
        this.dbProvider = Database.getInstance();
    }

    public async getTotal(): Promise<number> {
        const rows = await this.dbProvider.query(
            `SELECT COUNT(video_id) as total FROM ${this.table}`,
        );
        return rows[0].total;
    }

    public static getInstance() {
        return this.instance;
    }

    /**
     *
     *
     * @param {number} [start=0]
     * @param {number} [limit=20]
     * @returns {Promise<IVideoResult>}
     * @memberof VideoRepository
     */
    public async list(start: number = 0, limit: number = 20): Promise<IVideoResult>
    {
        const total: number = await this.getTotal();

        let rows: IVideoFile[] = [];
        rows = await this.dbProvider.query(
            `SELECT * FROM ${this.table} LIMIT ${start},${limit}`
        );

        return {
            total,
            videos: rows
        }
    }

    /**
     * insert new file into database
     *
     * @param {IFile} file
     * @returns
     * @memberof VideoRepository
     */
    public insert(file: IVideoFile): Promise<any>
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
     * @memberof VideoRepository
     */
    public update(file: IVideoFile, fields: {[key: string]: string | number})
    {
        const data: string[] = [];
        Object.keys(fields).forEach( (col) => {
            const value = this.dbProvider.getConnection().escape(fields[col]);
            data.push(`${col}='${value}'`)
        });

        const query = `
            UPDATE ${this.table}
            SET ${data.join(",")}
            WHERE video_id=${file.video_id}`;

        console.log(query);

        return this.dbProvider.query(query);
    }
}
