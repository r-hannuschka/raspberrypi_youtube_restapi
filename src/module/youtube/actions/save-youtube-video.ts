import { File, FileManager, VideoFile } from "@app-core/file";
import { downloadImageFile, ITaskData, IYoutubeFile } from "rh-download";

export function saveYoutubeVideo(youtubeFile: IYoutubeFile)
{
    const fileService = FileManager.getInstance();

    // create video file
    const videoFile: VideoFile = new VideoFile();
    videoFile.setDescription( youtubeFile.getDescription() );
    videoFile.setFile( youtubeFile.getFileName() );
    videoFile.setName( youtubeFile.getName() );
    videoFile.setPath( youtubeFile.getDestination() );

    fileService.add(videoFile);

    if ( ! youtubeFile.getImage() ) {
        return;
    }

    downloadImageFile(youtubeFile.getName(), youtubeFile.getImage())
        .then( (data: ITaskData) => {
            const image = new File();
            image.setFile(data.file.fileName);
            image.setName(data.file.title);
            image.setPath(data.file.path);

            return fileService.add(image);
        })
        .then( (info: any) => {
            console.dir( info );
        })
        .catch( () => {
            // do something
        });
}
