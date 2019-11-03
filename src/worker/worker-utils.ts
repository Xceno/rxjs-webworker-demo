import { Subject } from "rxjs";
import { filter } from "rxjs/operators";
import { checkMsgType, WorkerCommandType, WorkerMessage } from "./com-models";

export const log = (msg: string, ...args: any[]) =>
    console.debug(`[Worker] ${msg}`, ...args);

export const error = (msg: string, ...args: any[]) =>
    console.error(`[Worker] ${msg}`, ...args);

export const createMessageHandler = <T>(
    type: WorkerCommandType,
    messagePool: Subject<WorkerMessage<T>>
) => messagePool.pipe(filter(checkMsgType(type)));

export const sendToMainThread = <T>(msg: WorkerMessage<T>) => {
    postMessage(msg.encodeForTransport());
};
