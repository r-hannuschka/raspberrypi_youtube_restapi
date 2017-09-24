import { Request, Response } from "express";
import { DownloadProvider } from "../../provider/DownloadProvider";
import { AbstractController } from "../AbstractController";

export class Download extends AbstractController
{
    private downloadProvider: DownloadProvider;

    public constructor()
    {
        super();
        this.downloadProvider = DownloadProvider.getInstance();
    }

    public execute(req: Request, res: Response)
    {
        const download = this.downloadProvider
            .downloadVideo({
                name: "peppa_wutz_2017#104",
                path: "/tmp",
                uri: "https://www.youtube.com/watch?v=9s9ZjeoWJB0",
            });

        res.status(200);
        res.json({
            data: download,
            error: [],
            success: true
        });
    }
}
