import propEq from "ramda/es/propEq";
import { JSONcamelCaseReviver } from "../tools";

/** Commands a worker can receive and should execute. */
export type WorkerCommandType = "CalcFibonacci" | "empty";

/** A message that a client receives from a worker. */
export type WorkerMessageType = "FibonnaciResult" | "Ready" | "empty" | "Error";

export interface RawMessage<TPayload> {
    type: WorkerCommandType | WorkerMessageType;
    data: TPayload;
}

export class WorkerError {
    public constructor(
        public readonly errorMsg: string,
        public readonly originalCommand: WorkerCommandType,
        public readonly error?: Error | object | string | null
    ) {}
}

// tslint:disable-next-line:max-classes-per-file
export class WorkerMessage<T> {
    /**
     * Set isRawMessage to true, to prevent the message from being stringified.
     * This is useful for data like Files, which will be properly serialized for you by the native worker pipeline
     * and don't need any further serialization.
     */
    public constructor(
        public readonly type: WorkerCommandType | WorkerMessageType,
        public readonly data: T,
        public readonly isRawMessage: boolean = false
    ) {}

    public encodeForTransport = () => {
        if (this.isRawMessage) {
            return {
                type: this.type,
                data: this.data,
                isRawMessage: this.isRawMessage
            };
        }

        return JSON.stringify(this);
    };
}

const emptyMessage = () => new WorkerMessage<any[]>("empty", []);

export const errorMessage = (
    errorMsg: string,
    originalCommand: WorkerCommandType,
    error: Error | object | string | null = null
) =>
    new WorkerMessage<WorkerError>(
        "Error",
        new WorkerError(errorMsg, originalCommand, error)
    );

export const fromJson = <T>(json: string | null | undefined) => {
    // log.debug("Trying to parse JSON into workerMessage", json);
    if (!!json) {
        try {
            const cmd: WorkerMessage<T> = JSON.parse(
                json,
                JSONcamelCaseReviver
            );
            if (cmd && cmd.type) {
                return new WorkerMessage<T>(cmd.type, cmd.data);
            }
        } catch (err) {
            console.error("Couldn't parse workerMessage", err);
        }
    }
    return emptyMessage();
};

export const fromRawMessage = <T>({ type, data }: RawMessage<T>) => {
    try {
        return new WorkerMessage(type, data, true);
    } catch (err) {
        console.error("Couldn't create workerMessage from raw data", err);
    }

    return emptyMessage();
};

export const checkMsgType = <T>(
    type: WorkerCommandType | WorkerMessageType
) => (msg: WorkerMessage<T>) => {
    const result = propEq("type", type, msg);
    return result;
};

export interface FibonacciTask {
    value: number;
    disableCache: boolean;
}
