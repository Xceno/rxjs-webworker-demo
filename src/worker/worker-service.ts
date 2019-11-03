/* eslint import/no-webpack-loader-syntax: off */

// tslint:disable-next-line:no-implicit-dependencies
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { filter } from "rxjs/operators";
// tslint:disable-next-line:no-implicit-dependencies
import * as MyWorker from "worker-loader!./worker"; //eslint:disable-line:import/no-webpack-loader-syntax
import {
    checkMsgType,
    fromJson,
    WorkerMessage,
    WorkerMessageType
} from "../worker/com-models";

export class WorkerService {
    private worker: Worker;
    private messagesToWorker$: BehaviorSubject<WorkerMessage<any>>;
    public notification$: Observable<WorkerMessage<any>>;

    public constructor() {
        this.worker = new (MyWorker as any)();
        this.messagesToWorker$ = new BehaviorSubject<WorkerMessage<any>>(
            null as any
        );

        const workerNotification$ = new Subject<WorkerMessage<any>>();
        this.notification$ = workerNotification$.asObservable();

        const startMessagePipeline = () => {
            console.debug("[WorkerService] Starting msg pipeline!");
            this.messagesToWorker$.pipe(filter(msg => msg != null)).subscribe({
                next: msg => {
                    this.worker.postMessage(msg.encodeForTransport());
                },
                error: err =>
                    console.error(
                        "[WorkerService] Couldn't post message to worker.",
                        err
                    )
            });
        };

        this.worker.onmessage = encodedMsg => {
            const workerMessage = fromJson<any>(
                encodedMsg ? encodedMsg.data : null
            );
            console.debug(
                "[WorkerService] Got message from worker",
                workerMessage
            );

            if (workerMessage.type === "Ready") {
                startMessagePipeline();
            } else {
                workerNotification$.next(workerMessage);
            }
        };
    }

    public createMessageHandler = <T extends {}>(type: WorkerMessageType) =>
        this.notification$.pipe(filter(checkMsgType<T>(type)));

    public sendToWorker = (msg: WorkerMessage<any>) => {
        this.messagesToWorker$.next(msg);
    };
}
