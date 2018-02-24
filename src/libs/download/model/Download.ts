import {IDownload} from '../api';

export class Download implements IDownload {

    private uri: string;

    private error: string;

    private loaded: number;

    private size: number;

    private name: string;

    private destination: string;

    public getDestination() {
        return this.destination;
    }

    public getError(): string {
        return this.error;
    }

    public getLoaded(): number {
        return this.loaded;
    }

    public getName(): string {
        return this.name;
    }

    public getSize(): number {
        return this.size;
    }

    public getUri(): string {
        return this.uri;
    }

    public setDestination( dest: string) {
        this.destination = dest;
    }

    public setError(error: string) {
        this.error = error;
    }

    public setLoaded(loaded: number) {
        this.loaded = loaded;
    }

    public setName(name: string) {
        this.name = name;
    }

    public setSize(size: number) {
        this.size = size;
    }

    public setUri(uri: string) {
        this.uri = uri;
    }
}