import { Request, Response } from "express";
import { ControllerInterface } from "../../../../libs/module/api/ControllerInterface";
import { FileRepository } from "../../../../libs/file/model/Repository";

export class List implements ControllerInterface
{
    private repository: FileRepository;

    constructor() {
        this.repository = FileRepository.getInstance();
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
