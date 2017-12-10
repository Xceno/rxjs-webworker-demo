import { JSONcamelCaseReviver } from "../tools";

/** Commands a worker can receive and should execute. */
export type WorkerCommandType = "CalcFibonacci" | "empty";

/** A message that a client receives from a worker. */
export type WorkerMessageType = "FibonnaciResult" | "Ready" | "empty" | "Error";

export class WorkerMessage<T> {
  public readonly isRawMessage: boolean;

  /**
   * Set isRawMessage to true, to prevent the message from being stringified.
   * This is useful for data like Files, which will be properly serialized for you by the native worker pipeline
   * and don't need any further serialization.
   */
  public constructor(public type: WorkerCommandType | WorkerMessageType, public data: T, isRawMessage: boolean = false) {
    this.isRawMessage = isRawMessage;
  }

  private static empty = () => new WorkerMessage<any[]>("empty", []);

  public static error = (errorMsg: string, originalCommand: WorkerCommandType, error: Error | object | string | null = null) =>
    new WorkerMessage<WorkerError>("Error", new WorkerError(errorMsg, originalCommand, error));

  public static fromJson = <T>(json: string | null | undefined) => {
    // log.debug("Trying to parse JSON into workerMessage", json);

    if (!!json) {
      try {
        const cmd = JSON.parse(json, JSONcamelCaseReviver) as WorkerMessage<T>;
        if (cmd && cmd.type) {
          return new WorkerMessage<T>(cmd.type, cmd.data);
        }
      } catch (err) {
        console.error("Couldn't parse workerMessage", err);
      }
    }
    return WorkerMessage.empty();
  };

  public static fromRawMessage = <T>({ type, data }: { type: WorkerCommandType | WorkerMessageType; data: T }) => {
    try {
      return new WorkerMessage(type, data, true);
    } catch (err) {
      console.error("Couldn't create workerMessage from raw data", err);
    }

    return WorkerMessage.empty();
  };

  public encodeForTransport = () => {
    if (this.isRawMessage) {
      return { type: this.type, data: this.data, isRawMessage: this.isRawMessage };
    } else {
      return JSON.stringify(this);
    }
  };
}

export const checkMsgType = (msg: WorkerMessage<any> | any, type: WorkerCommandType | WorkerMessageType) => {
  const result = msg && msg.type ? (msg as WorkerMessage<any>).type === type : false;
  return result;
};

// tslint:disable-next-line:max-classes-per-file
export class WorkerError {
  public constructor(public errorMsg: string, public originalCommand: WorkerCommandType, public error?: Error | object | string | null) {}
}

export interface FibonacciTask {
  value: number;
  disableCache: boolean;
}
