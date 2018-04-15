import { ISocketController } from "@app-core/module";
import {
    OMX_PLAYER_ACTION_ADD_VIDEO_TO_QUEUE,
    OMX_PLAYER_ACTION_CLOSE,
    OMX_PLAYER_ACTION_PLAY_VIDEO,
    OmxPlayer,
    PUBSUB_TOPIC
} from "@app-libs/omx-player";
import { IChannel } from "@app-libs/socket";

export class Player implements ISocketController {

    private socketChannel: IChannel;

    private player: OmxPlayer;

    public constructor() {
        this.player = OmxPlayer.getInstance();
    }

    public execute(socketRequest: any): void {
        // not empty
    }

    /**
     *
     * @param channel
     */
    public setChannel(channel: IChannel): void {
        this.socketChannel = channel;

        this.player.subscribe(
            this.onOmxPlayerMessage.bind(this),
            PUBSUB_TOPIC
        );
    }

    /**
     * new client has connected to our channel
     *
     * @returns IDownloads[]
     * @memberof DownloadProvider
     */
    public onConnected()
    {
        const isActive   = this.player.isActive();
        const video      = this.player.getCurrentPlayingVideo();
        const videoQueue = this.player.getVideoQueue();

        // not empty
        return {
            isActive,
            video: video ? video.raw() : null,
            videoQueue
        };
    }

    private onOmxPlayerMessage(data)
    {
        switch (data.action ) {
            case OMX_PLAYER_ACTION_ADD_VIDEO_TO_QUEUE:
                this.socketChannel.emit("player:add_video", {video: data.video.raw()});
                break;
            case OMX_PLAYER_ACTION_PLAY_VIDEO:
                this.socketChannel.emit("player:play", {video: data.video.raw()});
                break;
            case OMX_PLAYER_ACTION_CLOSE: // player closed
                this.socketChannel.emit("player:close", null);
                break;
            default:
                return;
        }
    }
}
