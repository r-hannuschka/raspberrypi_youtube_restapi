import { Video, VideoFile  } from "@app-core/video";
import * as path from "path";
import { downloadImageFile, IFileData, IYoutubeFile } from "rh-download";
import { Config, Log } from "rh-utils";

export function saveYoutubeVideo(youtubeFile: IYoutubeFile)
{
    const videoService = Video.getInstance();
    const logService  = Log.getInstance();

    // create video file
    const videoFile: VideoFile = new VideoFile();
    videoFile.setDescription( youtubeFile.getDescription() );
    videoFile.setFile( youtubeFile.getFileName() );
    videoFile.setName( youtubeFile.getName() );
    videoFile.setPath( youtubeFile.getDestination() );

    videoService.create(videoFile)
        .then( (response: any): Promise<IFileData> => {
            videoFile.setId(response.info.insertId);
            if ( ! youtubeFile.getImage() ) {
                Promise.reject("no image");
            }
            return downloadImageFile(youtubeFile.getName(), youtubeFile.getImage());
        })
        .then( (data: IFileData) => {

            logService.log(
                `saveYoutubeData: download image
                ${JSON.stringify(data, null, 4)}`
                ,
                Log.LOG_DEBUG
            );

            const imgPath = Config.getInstance().get("path.media.image");

            return videoService.update(videoFile, {
                image: `${imgPath}/${data.fileName}`,
            });
        })
        .catch ( (error) => {
            logService.log(error.message, Log.LOG_ERROR);
            if ( error instanceof Error ) {
                logService.log(error.stack, Log.LOG_ERROR);
            }
        });
}
