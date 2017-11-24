import { Observable } from "../Observable";
import { IDownload, IDownloadObserver} from "./";

export interface IDownloadObservable extends Observable  {

    /**
     * subscribe to observable
     *
     * @param {Observer} observer
     * @memberof Observable
     */
    subscribe(observer: IDownloadObserver);

    /**
     * unsubscribe from observable
     *
     * @param {Observer} observer
     * @memberof Observable
     */
    unsubscribe(observer: IDownloadObserver);

    /**
     *
     *
     * @param {IDownload} download
     * @memberof IDownloadObservable
     */
    notify(download: IDownload);
}
