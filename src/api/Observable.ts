import { Observer } from "./Observer";

export interface Observable {

    /**
     * subscribe to observable
     *
     * @param {Observer} observer
     * @memberof Observable
     */
    subscribe(observer: Observer);

    /**
     * unsubscribe from observable
     *
     * @param {Observer} observer
     * @memberof Observable
     */
    unsubscribe(observer: Observer);
}
