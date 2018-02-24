import { HttpProvider, Request, RequestInterface, ResponseInterface  } from "../../../libs/http";
import { ConfigInterface } from "../api/ConfigInterface";
import * as ModuleConfig from "../etc/config.json";

export class YoutubeApiProvider extends HttpProvider {
    private config: ConfigInterface;

    constructor() {
        super();
        this.config = (ModuleConfig as any) as ConfigInterface;
    }

    /**
     * get video list from youtube
     *
     * @param {{[key: string]: any }} [params={}]
     * @returns {Promise<ResponseInterface>}
     * @memberof YoutubeApiProvider
     */
    public async list(params: {[key: string]: any } = {}): Promise<ResponseInterface> {
        const request = this.createRequest();

        request.setPath(this.config.api.action.list);
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
        request.setPath(this.config.api.action.search);
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
        request.setHost(this.config.api.host);
        request.setBasePath(this.config.api.basePath);
        request.addQueryParam("key", this.config.api.key);
        return request;
    }
}
