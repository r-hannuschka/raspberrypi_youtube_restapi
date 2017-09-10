export interface RequestInterface
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
