import { Subject } from "rxjs";
import { debounceTime, map } from "rxjs/operators";
import { FibonacciTask, WorkerMessage } from "../com-models";
import {
    createMessageHandler,
    error,
    log,
    sendToMainThread
} from "../worker-utils";

/** Returns a memoized fibonnaci function */
const cachedFibonacci = (() => {
    const cache: number[] = [];

    const fib = (num: number, disableCache: boolean = false) => {
        // Avoid infinite loops on undefined or null.
        if (!num) {
            return 0;
        }
        if (num <= 1) {
            return 1;
        }
        if (!disableCache && cache[num]) {
            return cache[num];
        }

        cache[num] = fib(num - 1, disableCache) + fib(num - 2, disableCache);
        return cache[num];
    };

    return fib;
})();

export const fibonacciHandler = (messagePool: Subject<WorkerMessage<any>>) =>
    createMessageHandler<FibonacciTask>("CalcFibonacci", messagePool)
        .pipe(
            debounceTime(200),
            map(msg => msg.data)
        )
        .subscribe({
            next: ({ value, disableCache }) => {
                const result = cachedFibonacci(value, disableCache);
                sendToMainThread(
                    new WorkerMessage<number>("FibonnaciResult", result)
                );
            },
            error,
            complete: () => log("fibonnaciHandler => done")
        });
