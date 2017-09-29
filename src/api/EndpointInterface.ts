export interface IEndpoint {

    execute(data: any): void;

    onConnected(): any;
}
