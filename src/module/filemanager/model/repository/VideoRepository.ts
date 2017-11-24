import { Database } from "../../../../provider/Database";
import { IFile } from "../../api/FileInterface";

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

    public static getInstance() {
        return this.instance;
    }

    public async list()
    {
        const rows: any[] = await this.dbProvider.query(
            `SELECT * FROM ${this.table} LIMIT :start,:limit`,
            {
                limit: 20,
                start: 0
            }
        );
        return rows;
    }

    public async insert(file: IFile)
    {
        const query = `
            INSERT INTO ${this.table}
            (title, description,image, filename, path)
            VALUES(:title,:desc,:img,:file,:path)
        `;

        const rows = await this.dbProvider.query(
            query,
            {
                desc: file.description,
                file: file.name,
                img: file.image,
                path: file.path,
                title: file.title
            }
        )

        return rows;
    }
}
