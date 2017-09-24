import {queue, Queue} from "async";
import { Client } from "socket.io";
import { IExcecuteAble } from "../../api/ExecuteAbleInterface";

export class Channel {

    private id: string;

    private endpoint: IExcecuteAble;

    private taskQueue: Queue;

    private clients: Client[];

    constructor()
    {
        this.taskQueue = queue(
            (data, done) => {
                this.execute(data, done);
            },
            1
        );

        this.clients = [];
    }

    public setEndpoint(endpoint: IExcecuteAble)
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
    public register(client: Client)
    {
        this.clients.push(client);
    }

    /**
     * unregister from channel notifications
     *
     * @param {Client} client
     * @memberof Channel
     */
    public unregister(client: Client)
    {
        // remove client
        this.clients.splice(
            this.clients.indexOf(client),
            1
        );
    }

    /**
     * send event
     *
     * @memberof Channel
     */
    public write(data)
    {
        this.taskQueue.push(data);
    }

    /**
     *
     * @param {*} data
     * @memberof Channel
     */
    public emit(message: string, data: any)
    {
        const body = {
            channel: this.getId(),
            data
        }

        this.clients.forEach( (client: Client) => {
            client.emit("message", body);
        });
    }

    /**
     *
     *
     * @private
     * @param {any} data
     * @param {any} done
     * @memberof Channel
     */
    private execute(data, done) {
        this.endpoint
            .execute(data)
            .then((result) => {
                this.emit("message", result);
                done();
            })
            .catch((error) => {
                done();
            });
    }
}
