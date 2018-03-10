import { File, FileManager, VideoFile  } from "@app-core/file";
import { downloadImageFile, IFileData, IYoutubeFile } from "rh-download";
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
        .then( (): Promise<IFileData> => {

            if ( ! youtubeFile.getImage() ) {
                // set default image and resolve this shit
                // so we allways update this
                return Promise.reject("no image code");
            }

            return downloadImageFile(youtubeFile.getName(), youtubeFile.getImage());
        })
        .then( (data: IFileData) => {

            const image = new File();
            image.setFile(data.fileName);
            image.setName(data.title);
            image.setPath(data.path);

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
