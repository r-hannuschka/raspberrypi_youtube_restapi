import * as SocketIO from "socket.io";
import { IChannel } from "./api";
import { Channel } from "./model/Channel";

export class Socket
{
    private static instance: Socket = new Socket();

    private connection: SocketIO.SocketIO;

    private channelMap: Map<string, IChannel>;

    private clients: SocketIO.Client[];

    constructor()
    {
        if ( Socket.instance ) {
            throw new Error("use SocketManager::getInstance");
        }

        this.clients = [];
        this.channelMap = new Map();
        Socket.instance = this;
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
     * @returns {IChannel}
     * @memberof SocketManager
     */
    public createChannel(channelID: string): IChannel {
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
     * @returns {IChannel}
     * @memberof SocketManager
     */
    public getChannel(name): IChannel {
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
                const channel: IChannel = this.getChannel(request.channel)
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
