import { AbstractModule } from "../../libs/module";
import { List } from "./controller";

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
        super.bootstrap();
    }
}
