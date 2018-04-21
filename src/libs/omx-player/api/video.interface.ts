import { IVideoFileData } from "@app-core/video";

export interface IVideo {

    data: IVideoFileData;

    id: string;

    muted: boolean;

    play: boolean;

    queued: boolean;
}
