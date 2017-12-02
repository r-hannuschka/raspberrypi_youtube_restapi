import { IVideoFile } from "../../../../api/VideoFile";
import { VideoHelper } from "../helper/Video";

export class Observer {

    private videoHelper: VideoHelper;

    /**
     * Creates an instance of Observer.
     * @memberof Observer
     */
    public constructor() {
        this.videoHelper = VideoHelper.getInstance();
    }

    /**
     * event triggered video download has finished
     *
     * @param {IVideoFile} video
     * @returns
     * @memberof Observer
     */
    public execute( video: IVideoFile) {
        this.videoHelper.addVideo(video);
    }
}
