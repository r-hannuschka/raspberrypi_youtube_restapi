import { Request, Response } from "express";
import { ResponseInterface } from "@app-core/http";
import { AbstractController } from "../AbstractController";

export class List extends AbstractController
{
    public async execute(req: Request, res: Response)
    {
        const apiResponse: ResponseInterface = await this.getApi().list(req.query);
        const responseData: any = apiResponse.json();

        res.status(responseData.status);
        res.json({
            data: responseData.data,
            error: responseData.error || [],
            success: responseData.success
        });
    }
}
