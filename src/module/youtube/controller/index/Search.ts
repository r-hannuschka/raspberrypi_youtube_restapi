import { Request, Response } from "express";
import { AbstractController } from "../AbstractController";

export class Search extends AbstractController
{
    public execute(req: Request, res: Response)
    {
        this.getApi().list().then(
            (response) => {
                res.status(200);
                res.json({
                    data: "search for some videos",
                    success: true
                });
            }
        );
    }
}
