import { IFileData, IVideoFile, IVideoFileData } from "../api";
import { File } from "./File";

export class VideoFile extends File implements IVideoFile
{

    private description: string;

    private image: string;

    public setDescription(desc: string): void {
        this.description = desc;
    }

    /**
     *
     *
     * @param {string} image pathlike
     * @memberof File
     */
    public setImage(image: string) {
        this.image = image;
    }

    public getDescription(): string {
        return this.description;
    }

    public getImage(): string
    {
        return this.image;
    }

    public raw(): IVideoFileData {
        const data: IFileData = super.raw();
        return Object.assign(data, {
            description: this.getDescription(),
            image: this.getImage()
        });
    }
}
