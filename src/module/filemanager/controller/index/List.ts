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
        const rows = await this.repository.list();
        res.status(200);
        res.json({
            data: rows,
            success: true
        });
    }
}
