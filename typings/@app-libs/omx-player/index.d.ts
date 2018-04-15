
declare module '@app-libs/omx-player' {

    import { IVideoFile } from "@app-core/video";
    import { Observable } from "rh-utils";

    export const PUBSUB_TOPIC;
    export const OMX_PLAYER_ACTION_ADD_VIDEO_TO_QUEUE;
    export const OMX_PLAYER_ACTION_PLAY_VIDEO;
    export const OMX_PLAYER_ACTION_STOP_VIDEO;
    export const OMX_PLAYER_ACTION_CLOSE;

    export class OmxPlayer extends Observable<any>
    {
        public static getInstance(): OmxPlayer;

        public addOption(optionName: string, optionValue?: string);

        public getCurrentPlayingVideo(): IVideoFile;

        /**
         * return current video queue
         *
         * @returns {IVideoFile[]}
         * @memberof OmxPlayer
         */
        public getVideoQueue(): IVideoFile[];

        public isActive(): boolean;

        public mute();

        public pause();

        public play(video: IVideoFile);

        /**
         * stop video
         *
         * @returns Promise<boolean>
         * @memberof OmxPlayer
         */
        public stop();
        

        /**
         * unmute player
         *
         * @returns Promise<boolean>
         * @memberof OmxPlayer
         */
        public unmute();

        /**
         * resume video playback
         *
         * @returns Promise<boolean>
         */
        public unpause();
    }
}
