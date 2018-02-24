export interface IObserver<T> {

    /**
     * called by observable to notify observer on any changes
     *
     * @param {*} data
     * @memberof Observer
     */
    update(task: T);
}
