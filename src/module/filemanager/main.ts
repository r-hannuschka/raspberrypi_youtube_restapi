import { AbstractModule } from "../AbstractModule";
import { List } from "./controller";

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
        super.bootstrap();
    }
}
