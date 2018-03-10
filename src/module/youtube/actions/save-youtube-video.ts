import { File, FileManager, VideoFile } from "@app-core/file";
import { downloadImageFile, ITaskData, IYoutubeFile } from "rh-download";
import { Log } from "rh-utils";

export function saveYoutubeVideo(youtubeFile: IYoutubeFile)
{
    const fileService = FileManager.getInstance();
    const logService  = Log.getInstance();

    // create video file
    const videoFile: VideoFile = new VideoFile();
    videoFile.setDescription( youtubeFile.getDescription() );
    videoFile.setFile( youtubeFile.getFileName() );
    videoFile.setName( youtubeFile.getName() );
    videoFile.setPath( youtubeFile.getDestination() );

    fileService.add(videoFile)
        .then( (): Promise<ITaskData> => {
            if ( ! youtubeFile.getImage() ) {
                // set default image and resolve this shit
                // so we allways update this
                return Promise.reject("no image code");
            }
            return downloadImageFile(youtubeFile.getName(), youtubeFile.getImage());
        })
        .then( (data: ITaskData) => {
            const image = new File();
            image.setFile(data.file.fileName);
            image.setName(data.file.title);
            image.setPath(data.file.path);

            return fileService.add(image);
        })
        .then ( (info: any) => {
            // @todo update file
        })
        .catch ( (error) => {
            if ( error instanceof Error ) {
                logService.log(error.message, Log.LOG_ERROR);
            }
        });
}
