# Handling webworkers with rxjs

This demo uses [react](https://reactjs.org/) and webpacks [worker-loader](https://webpack.js.org/loaders/worker-loader/) as a base.

It demonstrates how to use [RxJS](https://github.com/ReactiveX/RxJS) to communicate with web workers.
The source code is [free for everyone to use](https://github.com/Xceno/rxjs-webworker-demo/blob/master/LICENSE) and battle tested (Used in various projects since 2017).

The heart of this demo is the [src/worker](https://github.com/Xceno/rxjs-webworker-demo/tree/master/src/worker) folder and [this example component](https://github.com/Xceno/rxjs-webworker-demo/blob/master/src/components/FibonacciExample/FibonacciExample.tsx#L19).

It spins up to workers that run in parallel, one with, the other without a memoized fibonacci function and renders the result.

## The Why

When I first started this, I was working on a huge project that needed heavy JSON and image processing while uploading huge amounts of data without crashing the browser. So web workers came in really handy.
Since then, I used this approach on dozens of projects, so it stood the test of time for me.

In the future I might enhance this solution with a SharedArrayBuffer, instead of passing messages, so I save time transferring data between the threads.

## The How

No magic at all. The entire work is done in [`worker-service.ts`](https://github.com/Xceno/rxjs-webworker-demo/blob/master/src/worker/worker-service.ts) via two rxjs subjects that act as queues to send and receive messages to and from a worker thread.

The worker itself puts all messages it receives into a message pool.
You can register a ["worker task"](https://github.com/Xceno/rxjs-webworker-demo/blob/master/src/worker/tasks/calc-fibonnaci.ts) that acts upon a message and send the result back to the main thread.

A task is a simple function that subscribes to the pool and listens to a certain message type.

## How to use

There's the [useWorker]() hook, that is [super simple to work with](https://github.com/Xceno/rxjs-webworker-demo/blob/master/src/components/FibonacciExample/FibonacciExample.tsx#L19).
It'll spin up a new worker for you, handles all the subscriptions and returns the result object once done. That means you don't have to deal with async code.

```TypeScript
// useWorker filters incoming messages by the given type and tells the
// typescript compiler what to expect.
const [workerState, sendToWorker] = useWorker<TResult>("ResultMessageType");
```

Alternatively, create a `new WorkerService()` and use it directly.
If you do so, make sure to `unsubscribe` if you're done. Or enhance the worker service with a cleanup function to avoid memory leaks.

<hr/>

# CRA Docs

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.
