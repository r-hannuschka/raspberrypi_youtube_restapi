import { Module } from "@app-core/module";
import {
    List   as IndexList,
    Pause  as PlayerPause,
    Play   as PlayerPlay,
    Player as PlayerSocket,
    Remove as PlaylistRemove,
    Resume as PlayerResume,
    Stop   as PlayerStop,
} from "./controller";

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
        this.registerController("index/list", new IndexList());

        // omxplayer controller
        this.registerController("player/pause" , new PlayerPause());
        this.registerController("player/play"  , new PlayerPlay());
        this.registerController("player/stop"  , new PlayerStop());
        this.registerController("player/resume", new PlayerResume());

        // playlist controller
        this.registerController("playlist/remove", new PlaylistRemove());

        // socket controller
        this.registerSocketController( "video.player", new PlayerSocket());

        super.bootstrap();
    }
}
