import { Database } from "@app-core";
import { IDataNode, Log } from "rh-utils";
import { IVideoFile } from "../../api";

export class VideoRepository {

    private static readonly instance: VideoRepository = new VideoRepository();

    private dbProvider: Database;

    private TABLE_VIDEO = "video";

    private logService: Log;

    constructor() {
        if ( VideoRepository.instance ) {
            throw new Error("use Database.getInstance()");
        }
        this.logService = Log.getInstance();
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
            `SELECT COUNT(video_id) as total FROM ${this.TABLE_VIDEO}`,
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
    public async list(type: string = "", start: number = 0, limit: number = 20): Promise<any>
    {
        let rows: any[] = [];

        const query = `
            SELECT
            image, description, id, name
            FROM ${this.TABLE_VIDEO}
            LIMIT ${start},${limit}
        `;

        rows = await this.dbProvider.query(query);

        return rows;
    }

    public async add(video: IVideoFile): Promise<any>
    {
        const query = `
            INSERT INTO ${this.TABLE_VIDEO}
            (name, description, image, file, path)
            VALUES(
                :name, :description, :image, :file, :path)
        `;

        return this.dbProvider.query( query, video.raw());
    }

    public async update(video: IVideoFile, data): Promise<any>
    {

        this.logService.log(
            `update video: ${video.getId()}
            ${this.parseUpdateData(data)}`,
            Log.LOG_DEBUG
        )

        const query = `
            UPDATE ${this.TABLE_VIDEO}
            SET ${this.parseUpdateData(data)}
            WHERE id=${video.getId()}`;

        return this.dbProvider.query(query);
    }

    private parseUpdateData(data: IDataNode): string
    {
        let updateData: string = "";

        Object.keys(data).forEach( (col) => {
            const value = this.dbProvider.getConnection().escape(data[col]);
            updateData += updateData.length ? "," : "";
            updateData += `${col}='${value}'`;
        });

        return updateData;
    }
}
