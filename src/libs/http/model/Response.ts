import { ResponseInterface } from "../api";

export class Response implements ResponseInterface
{
    private isSuccess: boolean;

    private error: string;

    private statusCode: number;

    private body: any

    public addError(error: string): void
    {
        this.error = error;
    }

    public setStatusCode(status: number): void
    {
        this.statusCode = status;
    }

    public setSuccess(success: boolean): void
    {
        this.isSuccess = success;
    }

    public setBody( data: any): void
    {
        this.body = data;
    }

    public getBody(): any {
        return this.body;
    }

    public json(): object
    {
        return {
            data: this.getBody(),
            error: this.error,
            status: this.statusCode,
            success: this.isSuccess
        }
    }
}
