import { spawn, ChildProcess } from "child_process";

export class OmxPlayer
{
    private omx: ChildProcess;

    public pause() {
    }

    public play() {

        if ( ! this.omx ) {
            this.omx = spawn("omxplayer", [])
        }
    }

    public stop() {
    }
}
