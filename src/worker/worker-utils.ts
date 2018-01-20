import "rxjs/add/operator/filter";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";

import { checkMsgType, WorkerCommandType, WorkerMessage } from "./com-models";

export const log = (msg: string, ...args: any[]) => console.debug(`[Worker] ${msg}`, ...args);
export const error = (msg: string, ...args: any[]) => console.error(`[Worker] ${msg}`, ...args);

export const createMessageHandler = <T>(type: WorkerCommandType, messagePool: Subject<WorkerMessage<T>> | BehaviorSubject<WorkerMessage<T>>) =>
    messagePool.filter(msg => checkMsgType(msg, type)) as Observable<WorkerMessage<T>>;

export const sendToMainThread = <T>(msg: WorkerMessage<T>) => {
    postMessage(msg.encodeForTransport());
};
