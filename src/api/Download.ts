export interface IDownloadTask {

    /**
     *
     *
     * @type {string}
     * @memberof IDownloadTask
     */
    error?: string;

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

export const DOWNLOAD_STATE_CANCEL      = "cancel";
export const DOWNLOAD_STATE_END         = "end";
export const DOWNLOAD_STATE_ERROR       = "error";
export const DOWNLOAD_STATE_INITIALIZED = "initialized";
export const DOWNLOAD_STATE_PROGRESS    = "progress";
export const DOWNLOAD_STATE_QUEUED      = "queued";
export const DOWNLOAD_STATE_START       = "start";
export const DOWNLOAD_STATE_UPDATE      = "update";
