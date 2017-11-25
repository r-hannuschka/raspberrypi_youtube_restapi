import { Request, Response } from "express";
import { ControllerInterface } from "../../../../api/ControllerInterface";
import { VideoRepository } from "../../model/repository/VideoRepository";

export class List implements ControllerInterface
{
    private repository: VideoRepository;

    constructor() {
        this.repository = VideoRepository.getInstance();
    }

    public async execute(req: Request, res: Response)
    {
        let status: number;
        let response: object;

        const {page, limit} = req.query;
        const start = page && page > 0 ? (page - 1) * limit : page;

        try {
            const result = await this.repository.list(start, limit);
            status = 200;
            response = { success: true, data: result, error: null };
        } catch ( error ) {
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
