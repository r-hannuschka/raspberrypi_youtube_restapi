declare module '@app-libs/omx-player' {

    export class OmxPlayer
    {
        public addOption(optionName: string, optionValue?: string);

        public mute();

        public pause();

        public play(video: string);

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
