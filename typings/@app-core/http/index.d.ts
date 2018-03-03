declare module '@app-core/http' {

    interface RequestInterface
    {
        addParams(params: Array<{key: string, value: any}>): void

        addParam(key: string, value: any): void;

        addQueryParam(key: string, value: any): void;

        addQueryParams(params: {[key: string]: any}): void;

        setPath(path: string);

        setBasePath(basePath: string);

        setHost(host: string);

        setMethod(method: string);

        setPort(port: string);

        getPath(): string;

        getHost(): string;

        getMethod(): string;

        getPort(): string;

        getBasePath(): string;

        getBody(): object;

        getQueryParams(): object;
    }

    interface ResponseInterface
    {
        addError(error: string): void;

        setStatusCode(status: number): void;

        setSuccess(success: boolean): void;

        setBody( data: any): void;

        getBody(): any;

        json(): object;
    }

    class HttpProvider
    {

        /**
         * submit request
         * 
         * @param request 
         */
        public send(request: RequestInterface): Promise<ResponseInterface>;

        /**
         * create new response object every time its called
         * override this to serve another response object
         *
         * @returns {ResponseInterface}
         * @memberof HttpProvider
         */
        public getResponse(): ResponseInterface;

        /**
         * create url path
         *
         * @protected
         * @returns {string}
         * @memberof HttpProvider
         */
        protected buildUrl(request: RequestInterface): string;
    }


    export class Request implements RequestInterface
    {
        public static readonly METHOD_POST: string;

        public static readonly METHOD_GET: string;

        public addParam(key: string, value: any): void;

        public addParams(params: { key: string; value: any; }[]);

        public setPort(port: string);

        public addQueryParam(key: string, value: any);

        public addQueryParams(params: {[key: string]: any}): void;

        /**
         * @param {string} path
         * @memberof Request
         */
        public setPath(path: string);

        /**
         *
         * @param {string} host
         * @memberof Request
         */
        public setHost(host: string);

        /**
         *
         * @param basePath
         */
        public setBasePath(basePath: string);

        /**
         *
         *
         * @returns {string}
         * @memberof Request
         */
        public getBasePath(): string;

        /**
         *
         * @returns {object}
         * @memberof Request
         */
        public getBody(): object;

        /**
         * @param {string} method
         * @memberof Request
         */
        public setMethod(method: string);

        /**
         *
         * @returns {string}
         * @memberof Request
         */
        public getPath(): string;

        /**
         *
         * @returns {string}
         * @memberof Request
         */
        public getHost(): string;

        /**
         *
         * @returns {string}
         * @memberof Request
         */
        public getMethod(): string;

        /**
         *
         * @returns {string}
         * @memberof Request
         */
        public getPort(): string;

        /**
         *
         * @returns Object
         * @memberof Request
         */
        public getQueryParams(): object;
    }
}