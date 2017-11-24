import { Observer } from "../Observer";
import { IDownload } from "./Download";

export interface IDownloadObserver extends Observer {

    /**
     * called by observable to notify observer on any changes
     *
     * @param {*} data
     * @memberof Observer
     */
    update(task: IDownload );
}
