import "babel-polyfill";

import { Subject } from "rxjs/Subject";
import { log, sendToMainThread } from "./worker-utils";

import { WorkerMessage } from "./com-models";
import { fibonacciHandler } from "./tasks/calc-fibonnaci";

function startWorker() {
  const messagePool = new Subject<WorkerMessage<any>>();

  log("Initialized!");

  onmessage = event => {
    log("Got message from main thread", event.data);
    const msg = typeof event.data === "string" ? WorkerMessage.fromJson(event.data) : WorkerMessage.fromRawMessage({ ...event.data });
    messagePool.next(msg);
  };

  // Register all tasks
  fibonacciHandler(messagePool);
}

startWorker();
sendToMainThread(new WorkerMessage("Ready", null));
