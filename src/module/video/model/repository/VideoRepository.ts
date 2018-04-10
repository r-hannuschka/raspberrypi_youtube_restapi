import { Database, IVideoFile } from "@app-core";
import { IDataNode } from "rh-utils";

export class VideoRepository  {

    private static readonly instance: VideoRepository = new VideoRepository();

    private dbProvider: Database;

    private table: string = "video";

    constructor() {
        if ( VideoRepository.instance ) {
            throw new Error("use Database.getInstance()");
        }
        this.dbProvider = Database.getInstance();
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
     * @returns {Promise<number>}
     * @memberof FileRepository
     */
    public async getTotal()
    {
        const rows = await this.dbProvider.query(
            `SELECT COUNT(video_id) as total FROM ${this.table}`,
        );
        return rows[0].total;
    }

    /**
     *
     *
     * @param {number} [start=0]
     * @param {number} [limit=20]
     * @returns {Promise<IFile[]>}
     * @memberof FileRepository
     */
    public async list(type: string, start: number = 0, limit: number = 20) // : Promise<IFileData[]>
    {
        let rows: any[] = [];
        rows = await this.dbProvider.query(
            `SELECT * FROM ${this.table} LIMIT ${start},${limit}`
        );

        return rows;
    }

    public async addVideo(video: IVideoFile): Promise<any>
    {
        const query = `
            INSERT INTO ${this.table}
            (name, description, image, file, path)
            VALUES(
                :name, :description, :image, :file, :path)
        `;

        return this.dbProvider.query( query, video.raw());
    }

    public async updateVideo(video: IVideoFile, data): Promise<any>
    {
        const query = `
            UPDATE ${this.table}
            SET ${this.parseUpdateData(data)}
            WHERE id=${video.getId()}`;

        return this.dbProvider.query(query);
    }

    private parseUpdateData(data: IDataNode): string
    {
        let updateData: string = "";

        Object.keys(data).forEach( (col) => {
            const value = this.dbProvider.getConnection().escape(data[col]);
            updateData += data.length ? "," : "";
            updateData += `${col}=${value}`;
        });

        return updateData;
    }
}
