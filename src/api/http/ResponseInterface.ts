export interface ResponseInterface
{
    addError(error: string): void;

    setStatusCode(status: number): void;

    setSuccess(success: boolean): void;

    setBody( data: any): void;

    getBody(): any;

    json(): object;
}
