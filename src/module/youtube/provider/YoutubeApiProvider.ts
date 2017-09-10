import { RequestInterface, ResponseInterface } from "../../../api";
import { Request } from "../../../model/http/Request";
import { HttpProvider } from "../../../provider/HttpProvider";
import { ConfigInterface } from "../api/ConfigInterface";
import * as ModuleConfig from "../etc/config.json";

export class YoutubeApiProvider extends HttpProvider
{
    private config: ConfigInterface;

    constructor()
    {
        super();
        this.config = (ModuleConfig as any) as ConfigInterface;
    }

    /**
     * @returns {Promise<ResponseInterface>}
     * @memberof ApiProvider
     */
    public list(): Promise<ResponseInterface>
    {
        const request = this.createRequest();
        request.setPath(this.config.api.action.list);
        request.addQueryParam("part", "snippet");
        request.addQueryParam("chart", "mostPopular");

        return this.send(request)
            .catch( ( reason: any ): any => {
                return ""
            });
    }

    public search(query: string): Promise<ResponseInterface>
    {
        const request = this.createRequest();
        request.setPath(this.config.api.action.search);
        request.addQueryParam("part", "snippet");
        request.addQueryParam("q", query);

        return this.send(request)
            .catch( ( reason: any ): any => {
                return ""
            });
    }

    /**
     * create request
     *
     * @private
     * @returns {RequestInterface}
     * @memberof YoutubeApiProvider
     */
    private createRequest(): RequestInterface
    {
        const request: Request = new Request();
        request.setMethod("GET");
        request.setHost(this.config.api.host);
        request.setBasePath(this.config.api.basePath);
        request.addQueryParam("key", this.config.api.key);
        return request;
    }
}
