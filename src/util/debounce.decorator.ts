/**
 *
 * @param target class constructor
 * @param key method name
 * @param {Object{value: fn, writeable: boolean, enumerable: boolean, configureable: boolean }} descriptor;
 */
export function debounce(options) {

    return function method(target, key, descriptor) {

        if (descriptor === undefined) {
            descriptor = Object.getOwnPropertyDescriptor(target, key);
        }

        const originalMethod = descriptor.value;
        let value: any[] = [];
        let timer = null;

        descriptor.value = function decoratedMethod(...args) {
            if (!timer) {
                timer = setTimeout(
                    () => {
                        originalMethod.apply(this, value);
                        timer = null;
                    },
                    options.delay || 300
                );
            }
            value = args;
        };
        return descriptor;
    }
}
