import { Request, Response } from "express";
import { ControllerInterface } from "../../../../api/ControllerInterface";
import { Database } from "../../../../provider/Database";

export class List implements ControllerInterface
{
    private dbProvider: Database;

    constructor() {
        this.dbProvider = Database.getInstance();
    }

    public async execute(req: Request, res: Response)
    {
        /** move to repository */
        const rows: any[] = await this.dbProvider.query(
            "SELECT * FROM videos LIMIT :start,:limit",
            {
                limit: 20,
                start: 0
            }
        );

        res.status(200);
        res.json({
            data: rows,
            success: true
        });
    }
}
