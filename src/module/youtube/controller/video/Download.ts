import { Request, Response } from "express";
import { DownloadProvider } from "../../provider/DownloadProvider";
import { AbstractController } from "../AbstractController";

export class Download extends AbstractController
{
    private downloadProvider: DownloadProvider;

    public construct()
    {
        this.downloadProvider = DownloadProvider.getInstance();
    }

    public execute(req: Request, res: Response)
    {
        this.downloadProvider.downloadVideo("video");
    }
}
