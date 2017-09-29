import * as SocketIO from "socket.io";
import { Channel } from "./Channel";

export class SocketManager
{
    private static instance: SocketManager = new SocketManager();

    private connection: SocketIO.SocketIO;

    private channelMap: Map<string, Channel>;

    private clients: SocketIO.Client[];

    constructor()
    {
        if ( SocketManager.instance ) {
            throw new Error("use SocketManager::getInstance");
        }

        this.clients = [];
        this.channelMap = new Map();
        SocketManager.instance = this;
    }

    public setConnection( socketConnection )
    {
        this.connection = socketConnection;
        this.registerEvents();
    }

    public static getInstance() {
        return this.instance;
    }

    /**
     *
     * @param {string} channelID
     * @returns {Channel}
     * @memberof SocketManager
     */
    public createChannel(channelID: string): Channel {
        const channel = new Channel();
        if ( ! this.channelMap.has(channelID) ) {
            channel.setId(channelID);
            this.channelMap.set(channel.getId(), channel);
        }
        return channel;
    }

    /**
     * get existing channel
     *
     * @param {any} name
     * @returns {Channel}
     * @memberof SocketManager
     */
    public getChannel(name): Channel {
        if ( this.channelMap.has(name) ) {
            return this.channelMap.get(name)
        }
        return new Channel();
    }

    /**
     * register socket.io events
     *
     * @private
     * @memberof SocketManager
     */
    private registerEvents()
    {
        this.connection.on("connect", (client) => {
            this.clients.push(client);

            client.on("exec", (request) => {
                const channel: Channel = this.getChannel(request.channel)
                const task    = request.task;

                if ( channel ) {
                    channel.execute(task);
                }
            });

            client.on("register", (id) => {
                const channel = this.getChannel(id);
                if ( channel ) {
                    channel.connect(client);
                }
            });

            client.on("unregister", (id) => {
                const channel = this.getChannel(id);
                if ( channel ) {
                    channel.cancelConnection(client);
                }
            });
        });
    }
}
