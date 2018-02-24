import { spawn, ChildProcess } from "child_process";
import { IPlayer } from "../../../api/PlayerInterface";

export class OmxPlayer implements IPlayer
{
    private omx: ChildProcess;

    pause() {
        throw new Error("Method not implemented.");
    }

    public play() {

        if ( ! this.omx ) {
            this.omx = spawn("omxplayer", [])
        }
        throw new Error("Method not implemented.");
    }

    stop() {
        throw new Error("Method not implemented.");
    }
}
