import { Request, Response } from "express";
import { ControllerInterface } from "../../../libs/module";
import { YoutubeApiProvider } from "../provider/YoutubeApiProvider";

export abstract class AbstractController implements ControllerInterface
{
    private api: YoutubeApiProvider;

    constructor()
    {
        this.api = new YoutubeApiProvider();
    }

    public abstract execute(req: Request, res: Response);

    /**
     *
     * @protected
     * @returns {YoutubeApiProvider}
     * @memberof AbstractController
     */
    protected getApi(): YoutubeApiProvider
    {
        return this.api;
    }
}
