import { Client } from "socket.io";
import { IEndpoint } from "./EndpointInterface";

export interface IChannel {

    /**
     * set endpoint for an channel to handle all requests
     * send through socket ( controller )
     *
     * @param {IEndpoint} endpoint
     * @memberof IChannel
     */
    setEndpoint(endpoint: IEndpoint);

    /**
     * get channel id
     *
     * @returns {string}
     * @memberof IChannel
     */
    getId(): string;

    /**
     * set channel id
     *
     * @param {string} id
     * @memberof IChannel
     */
    setId(id: string): void;

    /**
     * client has connected to channel
     *
     * @param {Client} client
     * @memberof IChannel
     */
    connect(client: Client);

    /**
     * client cancel connection
     *
     * @param {Client} client
     * @memberof IChannel
     */
    cancelConnection(client: Client);

    /**
     * send message to client(s)
     *
     * @param {string} event
     * @param {*} data
     * @param {Client} [receiver]
     * @memberof IChannel
     */
    emit(event: string, data: any, receiver?: Client);

    /**
     * new request through socket
     *
     * @param {any} request
     * @memberof IChannel
     */
    execute(request);
}