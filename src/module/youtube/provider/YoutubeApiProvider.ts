import { HttpProvider, Request, RequestInterface, ResponseInterface  } from "@app-core/http";
import { Config } from "rh-utils";
import { ConfigInterface } from "../api/ConfigInterface";

export class YoutubeApiProvider extends HttpProvider {
    private api: ConfigInterface;

    constructor() {
        super();
        this.api = Config.getInstance().get('api.youtube') as ConfigInterface;
    }

    /**
     * get video list from youtube
     *
     * @param {{[key: string]: any }} [params={}]
     * @returns {Promise<ResponseInterface>}
     * @memberof YoutubeApiProvider
     */
    public async list(params: {[key: string]: any } = {}): Promise<ResponseInterface>
    {
        const request = this.createRequest();

        request.setPath(this.api.action.list);
        request.addQueryParams(
            Object.assign(
                {
                    chart: "mostPopular",
                    maxResults: 18,
                    part: "snippet,contentDetails"
                },
                params
            )
        );

        const response = await this.send(request);
        return response;
    }

    /**
     * search youtube for videos
     *
     * @param {{ [key: string]: any }} params
     * @returns {Promise<ResponseInterface>}
     * @memberof YoutubeApiProvider
     */
    public async search(params: { [key: string]: any }): Promise<ResponseInterface> {
        const request = this.createRequest();
        request.setPath(this.api.action.search);
        request.addQueryParams(
            Object.assign(
                {
                    maxResults: 18,
                    part: "snippet",
                    type: "video",
                },
                params
            )
        );
        const response = await this.send(request);
        return response;
    }

    /**
     * create request
     *
     * @private
     * @returns {RequestInterface}
     * @memberof YoutubeApiProvider
     */
    private createRequest(): RequestInterface {
        const request: Request = new Request();
        request.setMethod("GET");
        request.setHost(this.api.host);
        request.setBasePath(this.api.basePath);
        request.addQueryParam("key", this.api.key);
        return request;
    }
}
