import { IFile } from '../api/FileInterface';

export class File implements IFile {

    private id: number;

    private description: string;

    private file: string;

    private title: string;

    private type: string;

    private previewImage: string;

    public setDescription(desc: string): void {
        this.description = desc;
    }

    public setFile(name: string): void {
        this.file = name;
    }

    public setId(id: number): void {
        this.id = id;
    }

    public setTitle(title: string): void {
        this.title = title;
    }

    /**
     * 
     * 
     * @param {string} image pathlike
     * @memberof File
     */
    public setPreviewImage(image: string) {
        this.previewImage = image;
    }

    public setType(type: string): void {
        this.type = type;
    }

    public getDescription(): string {
        return this.description;
    }

    public getFile(): string {
        return this.file;
    }

    public getId(): number {
        return this.id;
    }

    public getPreviewImage(): string 
    {
        return this.previewImage;
    }

    public getTitle(): string {
        return this.title;
    }

    public getType(): string {
        return this.type;
    }
}
