
declare module '@app-libs/omx-player' {

    import { IVideoFile } from "@app-core/video";
    import { Observable } from "rh-utils";

    export const PUBSUB_TOPIC;
    export const OMX_PLAYER_ACTION_ADD_VIDEO_TO_QUEUE;
    export const OMX_PLAYER_ACTION_PLAY_VIDEO;
    export const OMX_PLAYER_ACTION_STOP_VIDEO;
    export const OMX_PLAYER_ACTION_CLOSE;

    export interface IVideo 
    {
        file: IVideoFile;
        id: string;
        muted: boolean;
        play: boolean;
        queued: boolean;
    }

    export class OmxPlayer extends Observable<any>
    {
        public static getInstance(): OmxPlayer;

        public addOption(optionName: string, optionValue?: string);

        public getCurrentPlayingVideo(): IVideo;

        public getVideoQueue(): IVideo[];

        public isActive(): boolean;

        public mute(): Promise<IVideo>;

        public pause(): Promise<IVideo>;

        public play(video: IVideoFile): IVideo;

        public removeVideoFromQueue(id: string): IVideo[];

        public stop(): Promise<IVideo>;

        public unmute(): Promise<IVideo>;

        public unpause(): Promise<IVideo>;
    }
}
