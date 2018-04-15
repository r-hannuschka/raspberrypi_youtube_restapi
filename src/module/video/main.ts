import { Module } from "@app-core/module";
import { List, Pause, Play, Player, Resume,  Stop } from "./controller";

export class VideoModule extends Module
{
    /**
     * @static
     * @type {string}
     * @memberof FilemanagerModule
     */
    public static readonly MODULE_NAME: string = "video";

    /**
     *
     *
     * @returns {string}
     * @memberof FilemanagerModule
     */
    public getName(): string {
        return VideoModule.MODULE_NAME;
    }

    /**
     *
     * @protected
     * @memberof FilemanagerModule
     */
    protected bootstrap()
    {
        // index controller
        this.registerController("index/list", new List());

        // omxplayer controller
        this.registerController("player/pause" , new Pause());
        this.registerController("player/play"  , new Play());
        this.registerController("player/stop"  , new Stop());
        this.registerController("player/resume", new Resume());

        // socket controller
        this.registerSocketController( "video.player", new Player());

        super.bootstrap();
    }
}
