import { ControllerInterface } from "@app-core/module";
import { Video } from "@app-core/video";
import { OmxPlayer } from "@app-libs/omx-player";
import { Request, Response } from "express";

export class PlayAction implements ControllerInterface
{
    private omx: OmxPlayer;

    private videoService = Video.getInstance();

    constructor() {
        this.omx = new OmxPlayer();
    }

    public async execute(req: Request, res: Response)
    {
        let status: number;
        let response: object;

        try {
            const video_id = req.query.video_id;
            const video = await this.videoService.getById(video_id);

            console.log ( video.getPath() + "/" + video.getFile() );

            // ich brauch den video namen
            // und pfad
            this.omx.play( video.getPath() + "/" + video.getFile() );

            status = 200;
            response = {
                data: {
                },
                success: true
            },

            res.status(status);
            res.json(response);
        } catch ( e ) {
            console.log ( e );
            res.status(500);
        }
    }
}
