import { AbstractModule } from "../AbstractModule";
import { List, Search } from "./controller";
import { DownloadController } from "./controller/socket/Download";

export class YoutubeModule extends AbstractModule
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
        this.registerSocketController("youtube.download", new DownloadController());

        super.bootstrap();
    }
}
