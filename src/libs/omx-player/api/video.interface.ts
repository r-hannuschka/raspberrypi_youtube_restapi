import { IVideoFile } from "@app-core/video";

export interface IVideo {

    file: IVideoFile;

    id: string;

    muted: boolean;

    play: boolean;

    queued: boolean;
}
