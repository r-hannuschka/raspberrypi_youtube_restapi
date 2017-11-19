export interface IDownloadTask {

    /**
     * group downloads by name to filter them
     *
     * @type {string}
     * @memberof IDownloadTask
     */
    group?: string;

    /**
     * current download state
     *
     * @type {string}
     * @memberof IDownloadTask
     */
    state: string;

    /**
     * bytes allready loaded
     *
     * @type {number}
     * @memberof IDownloadTask
     */
    loaded: number;

    /**
     * params send to task
     *
     * @type {{[key: string]: any}}
     * @memberof IDownloadTask
     */
    param: {[key: string]: any};

    /**
     * child process id
     *
     * @type {string}
     * @memberof IDownloadTask
     */
    pid: string;

    /**
     * full size of download
     *
     * @type {number}
     * @memberof IDownloadTask
     */
    size: number;

    /**
     * path to task
     *
     * @type {string}
     * @memberof IDownloadTask
     */
    task: string;
};

export const ACTION_DOWNLOAD_CANCEL      = "canceled";
export const ACTION_DOWNLOAD_END         = "finished";
export const ACTION_DOWNLOAD_INITIALIZED = "initialized";
export const ACTION_DOWNLOAD_QUEUED      = "pending";
export const ACTION_DOWNLOAD_PROGRESS    = "progressing";
export const ACTION_DOWNLOAD_START       = "starting";
export const ACTION_DOWNLOAD_UPDATE      = "update";
