import { RequestInterface } from "../../../api";

export class PostRequest implements RequestInterface
{

    public addParams(params: Array<{ key: string; value: any; }>): void {
        // empty
    }

    public addParam(key: string, value: any): void {
        // empty
    }

    public addQueryParam(key: string, value: any): void {
        // empty
    }

    public setPath(path: string) {
        // empty
    }

    public setBasePath(basePath: string) {
        // empty
    }
    public setHost(host: string) {
        // empty
    }

    public setMethod(method: string) {
        // empty
    }

    public setPort(port: string) {
        // empty
    }

    public getBody(): object {
        return {
            username: "mockup_user"
        }
    }

    public getBasePath(): string {
        return "test/post"
    }

    public getHost(): string {
        return "http://post.local.de";
    }

    public getMethod(): string {
        return "POST";
    }

    public getPath(): string {
        return "mockup";
    }

    public getPort(): string {
        return "8080";
    }

    public getQueryParams(): object {
        return {};
    }
}
