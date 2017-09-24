import { AbstractModule } from "../AbstractModule";
import { Download, List, Search } from "./controller";

export class YoutubeModule extends AbstractModule
{
    /**
     * @static
     * @type {string}
     * @memberof YoutubeModule
     */
    public static readonly MODULE_NAME: string = "youtube";

    /**
     * @private
     * @static
     * @type {YoutubeModule}
     * @memberof YoutubeModule
     */
    private static instance: YoutubeModule = new YoutubeModule();

    /**
     * @static
     * @returns {YoutubeModule}
     * @memberof YoutubeModule
     */
    public static getInstance(): YoutubeModule
    {
        return this.instance;
    }

    /**
     * Creates an instance of YoutubeModule.
     * @memberof YoutubeModule
     */
    constructor()
    {
        if (YoutubeModule.instance) {
            throw new Error("Error: Instantiation failed: Use SingletonDemo.getInstance() instead of new.");
        }
        super();
        YoutubeModule.instance = this;
    }

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
        this.registerController("video/download", new Download());

        super.bootstrap();
    }
}
