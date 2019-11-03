import "babel-polyfill";
import { Subject } from "rxjs";
import { fromJson, fromRawMessage, WorkerMessage } from "./com-models";
import { fibonacciHandler } from "./tasks/calc-fibonnaci";
import { log, sendToMainThread } from "./worker-utils";

function startWorker() {
    const messagePool = new Subject<WorkerMessage<any>>();

    log("Initialized!");

    onmessage = event => {
        log("Got message from main thread", event.data);
        const msg =
            typeof event.data === "string"
                ? fromJson(event.data)
                : fromRawMessage({ ...event.data });
        messagePool.next(msg);
    };

    // Register all tasks
    fibonacciHandler(messagePool);
}

startWorker();
sendToMainThread(new WorkerMessage("Ready", null));
