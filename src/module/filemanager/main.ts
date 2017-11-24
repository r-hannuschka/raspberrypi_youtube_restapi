import { DownloadProvider } from "../../provider/DownloadProvider";
import { AbstractModule } from "../AbstractModule";
import { List } from "./controller";
import { DownloadObserver } from "./model/observer/DownloadObserver";

export class FilemanagerModule extends AbstractModule
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
        return FilemanagerModule.MODULE_NAME;
    }

    /**
     *
     * @protected
     * @memberof FilemanagerModule
     */
    protected bootstrap()
    {
        this.registerController("index/list", new List());
        this.registerObserver( DownloadProvider.getInstance(), new DownloadObserver() );

        super.bootstrap();
    }
}
