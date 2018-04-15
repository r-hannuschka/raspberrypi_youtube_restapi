import { ControllerInterface } from "@app-core/module";
import { OmxPlayer } from "@app-libs/omx-player";
import { Request, Response } from "express";

export class Pause implements ControllerInterface
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
            this.omx.pause();

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
