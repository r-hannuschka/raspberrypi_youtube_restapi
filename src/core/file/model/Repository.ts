import { Database } from "@app-core";
import { IFile, IVideoFile } from "../api";

export class FileRepository {

    private static readonly instance: FileRepository = new FileRepository();

    private dbProvider: Database;

    private TABLE_FILE = "file";

    private TABLE_VIDEO = "video";

    constructor() {
        if ( FileRepository.instance ) {
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
        /*
        const rows = await this.dbProvider.query(
            `SELECT COUNT(video_id) as total FROM ${this.table}`,
        );
        return rows[0].total;
        */
    }

    /**
     *
     *
     * @param {number} [start=0]
     * @param {number} [limit=20]
     * @returns {Promise<IFile[]>}
     * @memberof FileRepository
     */
    public async list(start: number = 0, limit: number = 20) // : Promise<IFileData[]>
    {
        /*
        let rows: any[] = [];
        rows = await this.dbProvider.query(
            `SELECT * FROM ${this.table} LIMIT ${start},${limit}`
        );

        return rows;
        */
    }

    /**
     * insert new file into database
     *
     * @param {IFile} file
     * @returns
     * @memberof FileRepository
     */
    public async addFile(file: IFile): Promise<any>
    {
        const query = `
            INSERT INTO ${this.TABLE_FILE}
            (name, file, path)
            VALUES(
                :name, :file, :path)
        `;

        return this.dbProvider.query( query, file.raw());
    }

    public async addVideo(video: IVideoFile): Promise<any>
    {
        const query = `
            INSERT INTO ${this.TABLE_VIDEO}
            (name, description, image, file, path)
            VALUES(
                :name, :description, :image, :file, :path)
        `;

        return this.dbProvider.query( query, video.raw());
    }

    /**
     *
     *
     * @protected
     * @param {IFile} file
     * @returns {Promise<any>}
     * @memberof FileRepository
     */
    protected async update(file: IFile): Promise<any>
    {
        /*
        const raw: IDataNode = file.raw();
        let data: string = "";

        Object.keys(raw).forEach( (col) => {
            const value = this.dbProvider.getConnection().escape(raw[col]);
            data += data.length ? "," : "";
            data += `${col}='${value}'`;
        });

        const query = `
            UPDATE ${this.table}
            SET ${data}
            WHERE video_id=${file.getId()}`;

        return this.dbProvider.query(query);
        */
    }
}
