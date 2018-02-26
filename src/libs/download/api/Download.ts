/**
 * Download Data
 */
export interface IDownload {

    /**
     *
     *
     * @type {string}
     * @memberof IDownload
     */
    getError(): string;

    /**
     * bytes allready loaded
     *
     * @type {number}
     * @memberof IDownload
     */
    getLoaded(): number;

    /**
     * 
     * 
     * @returns {string} 
     * @memberof IDownload
     */
    getUri(): string;

    /**
     * full size of download
     *
     * @type {number}
     * @memberof IDownload
     */
    getSize(): number;

    /**
     * 
     * 
     * @returns {string} 
     * @memberof IDownload
     */
    getName(): string;

    /**
     * 
     * 
     * @returns {string} 
     * @memberof IDownload
     */
    getFileName(): string;

    /**
     * 
     * 
     * @returns {string} 
     * @memberof IDownload
     */
    getDestination(): string;

    /**
     * returns current download status
     * 
     * @returns {string} 
     * @memberof IDownload
     */
    getState(): string;
}
