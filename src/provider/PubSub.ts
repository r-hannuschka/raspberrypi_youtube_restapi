export class PubSub {

    /**
     * holds all topics and listeners
     *
     * @private
     * @static
     * @memberof PubSub
     */
    private static topics: Map<string, Array<() => void>> = new Map();

    /**
     * subscribe to an event
     *
     * @static
     * @param {any} event
     * @param {() => void} listener
     * @returns {() => void} unsubscribe
     * @memberof PubSub
     */
    public static subscribe(event, listener): () => void {
        if ( ! this.topics.has(event) ) {
            this.topics.set(event, []);
        }

        const topic = this.topics.get(event);
        const index = topic.push(listener) - 1;

        return () => {
            topic.splice(index, 1);

            if ( ! topic.length ) {
                this.topics.delete(event);
            }
        }
    }

    /**
     * publish an event
     *
     * @static
     * @param {any} event
     * @param {any} args
     * @memberof PubSub
     */
    public static publish(event, ...args) {
        if ( this.topics.has(event) ) {
            this.topics.get(event).forEach((listener: () => void) => {
                listener.apply(listener, args);
            });
        }
    }
}
