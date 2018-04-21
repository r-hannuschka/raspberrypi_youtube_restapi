import { ControllerInterface } from "@app-core/module";
import { OmxPlayer } from "@app-libs/omx-player";
import { Request, Response } from "express";

export class Mute implements ControllerInterface
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

            if ( req.params.enable === 1 ) {
                await this.omx.mute();
            } else {
                await this.omx.unmute();
            }

            status = 200;
            response = {
                data: {},
                success: true
            },

            res.status(status);
            res.json(response);
        } catch ( e ) {
            res.status(500);
        }
    }
}
