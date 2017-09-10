import { Request, Response } from "express";
import { ResponseInterface } from "../../../../api/http/ResponseInterface";
import { AbstractController } from "../AbstractController";

export class List extends AbstractController
{
    public execute(req: Request, res: Response)
    {
        this.getApi()
            .list(req.query)
            .then( (apiResponse: ResponseInterface ) => {
                // @todo define interface
                const responseData: any = apiResponse.json();
                res.status(responseData.status);
                res.json({
                    data: responseData.data,
                    error: responseData.error || [],
                    success: responseData.success
                });
            });
    }
}
