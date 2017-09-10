import { RequestInterface } from "../../api";

export class Request implements RequestInterface
{
    public static readonly METHOD_POST = "POST";

    public static readonly METHOD_GET = "GET";

    private queryParams: Map<string, any> = new Map();

    private path: string = "";

    private host: string = "";

    private method: string = "";

    private port: string = "";

    private basePath: string = "";

    /**
     * @param {string} port
     * @memberof Request
     */
    public setPort(port: string) {
        this.port = port;
    }

    /**
     * @param {string} key
     * @param {*} value
     * @memberof Request
     */
    public addParam(key: string, value: any): void {
        // @todo implement
    }

    /**
     * @param {{key: string, value: any}[]} params
     * @memberof Request
     */
    public addParams(params: Array<{key: string, value: any}>): void {
        params.forEach( (param: {key: string, value: any}) => {
            this.addParam(param.key, param.value);
        });
    }

    /**
     * @param {string} key
     * @param {*} value
     * @memberof Request
     */
    public addQueryParam(key: string, value: any): void {
        this.queryParams.set(key, value);
    }

    /**
     * @param {{key: string, value: any}[]} params
     * @memberof Request
     */
    public addQueryParams(params: Array<{key: string, value: any}>): void {
        params.forEach( (param: {key: string, value: any}) => {
            this.addQueryParam(param.key, param.value);
        });
    }

    /**
     * @param {string} path
     * @memberof Request
     */
    public setPath(path: string) {
        this.path = path;
    }

    /**
     *
     * @param {string} host
     * @memberof Request
     */
    public setHost(host: string) {
        this.host = host;
    }

    /**
     *
     * @param basePath
     */
    public setBasePath(basePath: string) {
        this.basePath = basePath;
    }

    /**
     *
     *
     * @returns {string}
     * @memberof Request
     */
    public getBasePath(): string {
        return this.basePath;
    }

    /**
     *
     * @returns {object}
     * @memberof Request
     */
    public getBody(): object {
        return {}
    }

    /**
     * @param {string} method
     * @memberof Request
     */
    public setMethod(method: string) {
        this.method = method;
    }

    /**
     *
     * @returns {string}
     * @memberof Request
     */
    public getPath(): string {
        return this.path;
    }

    /**
     *
     * @returns {string}
     * @memberof Request
     */
    public getHost(): string {
        return this.host;
    }

    /**
     *
     * @returns {string}
     * @memberof Request
     */
    public getMethod(): string {
        return this.method;
    }

    /**
     *
     * @returns {string}
     * @memberof Request
     */
    public getPort(): string {
        return this.port;
    }

    /**
     *
     * @returns Object
     * @memberof Request
     */
    public getQueryParams(): object {
        const queryParams: object = {};
        this.queryParams.forEach( (value: any, key: string) => {
            const param = {};
            param[key] = value;
            Object.assign( queryParams, param);
        });
        return queryParams;
    }
}
