import { ControllerInterface } from "@app-core/module";
import { IVideo, OmxPlayer } from "@app-libs/omx-player";
import { Request, Response } from "express";

export class Remove implements ControllerInterface
{
    private omx: OmxPlayer;

    constructor() {
        this.omx = OmxPlayer.getInstance();
    }

    public async execute(req: Request, res: Response)
    {
        let status: number;
        let response: object;

        try {
            const playlist: IVideo[] = this.omx.removeVideoFromQueue(
                req.get("id"));

            status = 200;
            response = {
                data: {
                    playlist
                },
                success: true
            },

            res.status(status);
            res.json(response);
        } catch ( e ) {
            res.status(500);
        }
    }
}
