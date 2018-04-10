import { ControllerInterface } from "@app-core/module";
import { Video } from "@app-core/video";
import { Request, Response } from "express";

export class List implements ControllerInterface
{
    private repository: Video;

    constructor() {
        this.repository = Video.getInstance();
    }

    public async execute(req: Request, res: Response)
    {
        let status: number;
        let response: object;

        const {page, limit} = req.query;
        const start = page && page > 0 ? (page - 1) * limit : page;

        try {
            const result = await this.repository.read("", start, limit);
            const total  = await this.repository.count();
            status = 200;
            response = { data: {
                total,
                videos: result
            },
            success: true
        };
        } catch ( error ) {

            console.log(error);

            status = 500;
            response = {
                data: {},
                error: "could not load videos",
                success: false
            }
        }

        res.status(status);
        res.json(response);
    }
}
