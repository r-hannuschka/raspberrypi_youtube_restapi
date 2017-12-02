import { EVENT_VIDEO_DOWNLOAD_FINISHED } from "../../api/download";
import { AbstractModule } from "../AbstractModule";
import { List } from "./controller";
import { Observer } from "./model/observer/DownloadObserver";

export class VideoModule extends AbstractModule
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
        this.registerController("index/list", new List());

        const observer = new Observer();
        this.registerEvent(EVENT_VIDEO_DOWNLOAD_FINISHED, observer);

        super.bootstrap();
    }
}
