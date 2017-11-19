import { Request, Response } from "express";
import { AbstractController } from "../AbstractController";

export class Search extends AbstractController {

    /**
     * execute search request
     *
     * @param {Request} req
     * @param {Response} res
     * @memberof Search
     */
    public async execute(req: Request, res: Response) {
        const response: any = await this.getApi().search(req.query);
        const responseData: any = response.json();

        responseData.data.items.map((item) => {
            item.id = item.id.videoId
        });

        res.status(responseData.status);
        res.json({
            data: responseData.data,
            error: responseData.error || [],
            success: responseData.success
        });
    }
}
