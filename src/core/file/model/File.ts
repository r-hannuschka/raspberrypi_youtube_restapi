import { IFile, IFileData } from "../api";

export class File implements IFile {

    private id: number;

    private description: string;

    private file: string;

    private title: string;

    private type: string;

    private image: string;

    private name: string;

    public setDescription(desc: string): void {
        this.description = desc;
    }

    public setFile(name: string): void {
        this.file = name;
    }

    public setId(id: number): void {
        this.id = id;
    }

    public setName(name: string): void {
        this.name = name;
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
    public setImage(image: string) {
        this.image = image;
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

    public getName(): string {
        return this.name;
    }

    public getImage(): string
    {
        return this.image;
    }

    public getTitle(): string {
        return this.title;
    }

    public getType(): string {
        return this.type;
    }

    public raw(): IFileData {
        return {
            description: this.getDescription(),

            file: this.getFile(),

            id: this.getId(),

            image: this.getImage(),

            name: this.getName(),

            type: this.getType()
        }
    }
}
