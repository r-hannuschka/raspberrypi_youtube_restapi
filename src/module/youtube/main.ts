import { Module } from "@app-core/module";
import { List, Search, DownloadController } from "./controller";
import { SOCKET_GROUP_NAME } from "./api";

export class YoutubeModule extends Module
{
    /**
     * @static
     * @type {string}
     * @memberof YoutubeModule
     */
    public static readonly MODULE_NAME: string = "youtube";

    /**
     *
     * @returns {string}
     * @memberof YoutubeModule
     */
    public getName(): string
    {
        return YoutubeModule.MODULE_NAME;
    }

    /**
     *
     * @protected
     * @memberof YoutubeModule
     */
    protected bootstrap()
    {
        this.registerController("index/list",   new List());
        this.registerController("index/search", new Search());
        this.registerSocketController( SOCKET_GROUP_NAME, new DownloadController());

        super.bootstrap();
    }
}
