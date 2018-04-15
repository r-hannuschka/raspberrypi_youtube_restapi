import { ControllerInterface } from "@app-core/module";
import { OmxPlayer } from "@app-libs/omx-player";
import { Request, Response } from "express";

export class Stop implements ControllerInterface
{
    private omxPlayer: OmxPlayer;

    constructor() {
        this.omxPlayer = OmxPlayer.getInstance();
    }

    public async execute(req: Request, res: Response)
    {
        let status: number;
        let response: object;

        try {
            this.omxPlayer.stop();

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
