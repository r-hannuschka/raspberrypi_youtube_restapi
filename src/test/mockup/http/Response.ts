import { ResponseInterface } from "../../../api";

export class Response implements ResponseInterface
{
    private error: string;

    private body: any;

    private status: number;

    private success: boolean;

    public addError(error: string): void {
        this.error = error;
    }

    public setBody(data: any): void {
        this.body = data;
    }

    public setStatusCode(status: number): void {
        this.status = status;
    }

    public setSuccess(success: boolean): void {
        this.success = success;
    }

    public getData(): object {
        throw new Error("Method not implemented.");
    }

    public getBody() {
        throw new Error("Method not implemented.");
    }

    public json(): object {
        throw new Error("Method not implemented.");
    }
}
