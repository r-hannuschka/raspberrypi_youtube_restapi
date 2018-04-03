import { File, FileManager, VideoFile  } from "@app-core/file";
import { downloadImageFile, IFileData, IYoutubeFile } from "rh-download";
import { Log } from "rh-utils";

export function saveYoutubeVideo(youtubeFile: IYoutubeFile)
{
    const fileService   = FileManager.getInstance();
    const logService    = Log.getInstance();

    // create video file
    const videoFile: VideoFile = new VideoFile();
    videoFile.setDescription( youtubeFile.getDescription() );
    videoFile.setFile( youtubeFile.getFileName() );
    videoFile.setName( youtubeFile.getName() );
    videoFile.setPath( youtubeFile.getDestination() );

    fileService.add(videoFile)
        .then( (response: any): Promise<IFileData> => {
            videoFile.setId(response.info.insertId);
            if ( ! youtubeFile.getImage() ) {
                Promise.reject("no image");
            }
            return downloadImageFile(youtubeFile.getName(), youtubeFile.getImage());
        })
        .then( (data: IFileData) => {
            const image = new File();
            image.setFile(data.fileName);
            image.setName(data.name);
            image.setPath(data.path);
            return fileService.add(image);
        })
        .then ( (response: any) => {
            return fileService.update(videoFile, {image: response.info.insertId});
        })
        .catch ( (error) => {
            if ( error instanceof Error ) {
                logService.log(error.message, Log.LOG_ERROR);
            }
        });
}
