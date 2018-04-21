import { ControllerInterface } from "@app-core/module";
import { OmxPlayer } from "@app-libs/omx-player";
import { Request, Response } from "express";
import { Log } from "rh-utils";

export class Resume implements ControllerInterface
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
            await this.omx.unpause();

            status = 200;
            response = {
                success: true
            },

            res.status(status);
            res.json(response);
        } catch ( e ) {
            Log.getInstance().log(e.message, Log.LOG_ERROR);
            res.status(500);
        }
    }
}
