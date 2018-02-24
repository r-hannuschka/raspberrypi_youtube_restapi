import { Client } from "socket.io";
import { IChannel, IEndpoint } from "./api/socket";

export class Channel implements IChannel {

    private id: string;

    private endpoint: IEndpoint;

    private clients: Client[];

    constructor()
    {
        this.clients = [];
    }

    public setEndpoint(endpoint: IEndpoint)
    {
        this.endpoint = endpoint;
    }

    public getId(): string
    {
        return this.id;
    }

    public setId(id: string): void
    {
        this.id = id;
    }

    /**
     * register to channel notifications
     *
     * @param {Client} client
     * @memberof Channel
     */
    public connect(client: Client)
    {
        this.clients.push(client);

        this.emit(
            "connect",
            this.endpoint.onConnected(),
            client
        );
    }

    /**
     * unregister from channel notifications
     *
     * @param {Client} client
     * @memberof Channel
     */
    public cancelConnection(client: Client)
    {
        // remove client
        this.clients.splice(
            this.clients.indexOf(client),
            1
        );
    }

    /**
     *
     * @param {*} data
     * @memberof Channel
     */
    public emit(event: string, data: any, receiver?: Client)
    {
        const response = {
            body: {
                data,
                event
            },
            channel: this.getId(),
        }

        if ( receiver ) {
            receiver.emit("message", response);
        } else {
            this.clients.forEach( (client: Client) => {
                client.emit("message", response);
            });
        }
    }

    /**
     *
     *
     * @private
     * @param {any} data
     * @param {any} done
     * @memberof Channel
     */
    public execute(data) {
        this.endpoint.execute(data);
    }
}
