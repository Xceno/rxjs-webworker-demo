import "rxjs/add/observable/empty";
import "rxjs/add/observable/fromPromise";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/map";

import { Subject } from "rxjs/Subject";

import { FibonacciTask, WorkerMessage } from "../com-models";
import { createMessageHandler, error, log, sendToMainThread } from "../worker-utils";

/** Returns a memoized fibonnaci function */
const cachedFibonacci = (() => {
  const cache: number[] = [];

  const fib = (num: number, disableCache: boolean = false) => {
    // Avoid infinite loops on undefined or null.
    if (!num) {
      return 0;
    }

    if (!disableCache && cache[num]) {
      return cache[num];
    }

    if (num <= 1) {
      return 1;
    }

    // tslint:disable-next-line:no-magic-numbers
    cache[num] = fib(num - 1, disableCache) + fib(num - 2, disableCache);
    return cache[num];
  };

  return fib;
})();

export const fibonacciHandler = (messagePool: Subject<WorkerMessage<any>>) =>
  createMessageHandler<FibonacciTask>("CalcFibonacci", messagePool)
    // tslint:disable-next-line:no-magic-numbers
    .debounceTime(200)
    .map(msg => msg.data)
    .subscribe(
      ({ value, disableCache }) => {
        const result = cachedFibonacci(value, disableCache);
        sendToMainThread(new WorkerMessage<number>("FibonnaciResult", result));
      },
      error,
      () => log("fibonnaciHandler => done")
    );
