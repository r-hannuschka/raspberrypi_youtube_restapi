import { ControllerInterface } from "@app-core/module";
import { Video } from "@app-core/video";
import { OmxPlayer } from "@app-libs/omx-player";
import { Request, Response } from "express";

export class Play implements ControllerInterface
{
    private omx: OmxPlayer;

    private videoService = Video.getInstance();

    constructor() {
        this.omx = OmxPlayer.getInstance();
    }

    public async execute(req: Request, res: Response)
    {
        let status: number;
        let response: object;

        try {
            const video_id = req.query.video_id;
            const video = await this.videoService.getById(video_id);

            this.omx.play(video);

            status = 200;
            response = {
                data: {
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
