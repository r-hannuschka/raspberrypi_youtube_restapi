import {IObserver} from "./Observer";

export interface IObservable<T>  {

    /**
     * subscribe to observable
     *
     * @param {Observer} observer
     * @memberof Observable
     */
    subscribe(observer: IObserver<T>);

    /**
     * unsubscribe from observable
     *
     * @param {Observer} observer
     * @memberof Observable
     */
    unsubscribe(observer: IObserver<T>);

    /**
     *
     * @memberof IObservable
     */
    notify(data: T);
}
