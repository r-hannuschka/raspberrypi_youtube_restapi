import { Client } from "socket.io";
import { IEndpoint } from "./EndpointInterface";

export interface IChannel {

    setEndpoint(endpoint: IEndpoint);

    getId(): string;

    setId(id: string): void;

    connect(client: Client);

    cancelConnection(client: Client);

    emit(event: string, data: any, receiver?: Client);

    execute(data);
}