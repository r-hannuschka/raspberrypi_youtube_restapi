export abstract class Observable<T> {

    private  subscriptions: Set<Function> = new Set();

    /**
     *
     * @static
     * @param {any} event
     * @param {() => void} listener
     * @returns {() => void} unsubscribe
     * @memberof PubSub
     */
    public subscribe(subscriber) {

        if ( ! this.subscriptions.has(subscriber) ) {
            this.subscriptions.add(subscriber);
        }

        // return unsubscribe method
        return {
            unsubscribe: () => {
                this.subscriptions.delete(subscriber);
            }
        }
    }

    /**
     * 
     * 
     * @param {any} data 
     */
    protected publish(data: T) {
        this.subscriptions.forEach(notify => {
            notify(data);
        });
    }
}