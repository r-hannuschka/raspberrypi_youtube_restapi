export interface Observer {

    /**
     * called by observable to notify observer on any changes
     *
     * @param {string} event
     * @param {*} data
     * @memberof Observer
     */
    notify(event: string, data: any);
}
