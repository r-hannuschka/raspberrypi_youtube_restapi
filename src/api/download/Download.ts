export interface IDownload {

    /**
     *
     *
     * @type {string}
     * @memberof IDownload
     */
    error?: string;

    /**
     * group downloads by name to filter them
     *
     * @type {string}
     * @memberof IDownload
     */
    group?: string;

    /**
     * current download state
     *
     * @type {string}
     * @memberof IDownload
     */
    state: string;

    /**
     * bytes allready loaded
     *
     * @type {number}
     * @memberof IDownload
     */
    loaded: number;

    /**
     * params send to task
     *
     * @type {{[key: string]: any}}
     * @memberof IDownload
     */
    param: {[key: string]: any};

    /**
     * child process id
     *
     * @type {string}
     * @memberof IDownload
     */
    pid: string;

    /**
     * full size of download
     *
     * @type {number}
     * @memberof IDownload
     */
    size: number;

    /**
     * path to task
     *
     * @type {string}
     * @memberof IDownload
     */
    task: string;
}
