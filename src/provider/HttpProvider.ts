import * as httpRequest from "request-promise-native";
import { RequestInterface, ResponseInterface } from "../api/http";
import { Response } from "../model/http/Response";
import { Logger } from "./Logger";

export class HttpProvider {

    private logProvider: Logger;

    constructor() {
        this.logProvider = Logger.getInstance();
    }

    /**
     * @param {RequestInterface} request
     * @param {ResponseInterface} response
     * @returns {Promise<ResponseInterface>}
     * @memberof HttpRequest
     */
    public async send(request: RequestInterface): Promise<ResponseInterface> {

        let response: ResponseInterface;

        const requestOptions = {
            method: request.getMethod() || "GET",
            qs: request.getQueryParams(),
            url: this.buildUrl(request)
        };

        if (request.getMethod() !== "GET") {
            Object.assign(requestOptions, {
                body: JSON.stringify(request.getBody())
            })
        }

        const logMessage = `
            type: API Request
            ${__filename}
            ${JSON.stringify(requestOptions)}`
        .replace(/^\s*/gm, "");

        this.logProvider
            .log(Logger.LOG_DEBUG, logMessage)
            .catch( (exception) => {
                console.log(exception.message);
            });

        let responseData: any

        try {
            responseData = await httpRequest(requestOptions);
            response = this.handleResponseData(responseData);
        } catch (error) {
            response = this.handleError(error, request, responseData);
        }

        return response;
        // return Promise.resolve(response);
    }

    /**
     * create new response object every time its called
     * override this to serve another response object to
     *
     * @returns {ResponseInterface}
     * @memberof HttpProvider
     */
    public getResponse(): ResponseInterface {
        return new Response();
    }

    /**
     * create url path
     *
     * @protected
     * @returns {string}
     * @memberof HttpProvider
     */
    protected buildUrl(request: RequestInterface): string {
        let url = "";
        url = request.getHost();
        url += request.getPort() !== "" ? `:${request.getPort()}` : "";
        url += request.getBasePath() !== "" ? `/${request.getBasePath()}` : "";
        url += request.getPath() !== "" ? `/${request.getPath()}` : "";
        return url;
    }

    /**
     *
     * @private
     * @param {*} error
     * @returns {ResponseInterface}
     * @memberof HttpProvider
     */
    protected handleError(
        error: any,
        request: RequestInterface,
        responseData: any
    ): ResponseInterface {
        const response = this.getResponse();
        response.setSuccess(false);
        switch (error.name) {
            case "StatusCodeError":
                response.setStatusCode(error.statusCode);
            // tslint:disable-next-line:no-switch-case-fall-through
            default:
                this.logProvider.log(
                    Logger.LOG_ERROR,
                    JSON.stringify(error)
                );
        };
        return response;
    }

    /**
     *
     * @private
     * @param {*} responseData
     * @returns {ResponseInterface}
     * @memberof HttpProvider
     */
    protected handleResponseData(responseData: any): ResponseInterface {
        const response = this.getResponse();
        response.setSuccess(true);
        response.setStatusCode(200);
        response.setBody(JSON.parse(responseData));
        return response;
    }
}
