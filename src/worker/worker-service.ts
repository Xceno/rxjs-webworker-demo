import {
    BehaviorSubject,
    Observable,
    Subject,
    Subscription,
    throwError,
} from "rxjs";
import { filter, share, takeUntil, tap } from "rxjs/operators";
// tslint:disable-next-line:no-implicit-dependencies
import MyWorker from "worker-loader!../worker/worker";
import {
    checkMsgType,
    emptyMessage,
    fromJson,
    WorkerMessage,
    WorkerResultMessageType,
} from "../worker/com-models";

/**
 * Spawns a new web-worker and sets up a message pipeline.
 * You probably want to use `WorkerApi`, which is a singleton of this class.
 */
export class WorkerService {
    private worker: Worker | null;
    private messagesToWorker$: BehaviorSubject<WorkerMessage>;
    private dispose$: Subject<boolean>;
    public notification$: Observable<WorkerMessage>;

    public constructor() {
        this.dispose$ = new Subject();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.worker = new MyWorker();
        this.messagesToWorker$ = new BehaviorSubject<WorkerMessage>(
            emptyMessage()
        );

        const workerNotification$ = new Subject<WorkerMessage>();
        this.notification$ = workerNotification$.asObservable().pipe(share());

        const startMessagePipeline = () => {
            console.debug("[WorkerService] Starting msg pipeline!");
            this.messagesToWorker$
                .pipe(
                    filter((msg) => msg != null),
                    takeUntil(this.dispose$),
                    tap(() => {
                        if (this.worker == null) {
                            throwError("Worker is disposed.");
                        }
                    })
                )
                .subscribe({
                    next: (msg) => {
                        this.worker!.postMessage(msg.encodeForTransport());
                    },
                    error: (err) =>
                        console.error(
                            "[WorkerService] Couldn't post message to worker.",
                            err
                        ),
                });
        };

        this.worker.onmessage = (encodedMsg) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    /**
     * Creates an observable that listens to messages of the given type.
     * Will complete automatically if you call `dispose` on the `WorkerService`.
     *
     * **Attention:**
     * If you extend the observable with other operators that create inner observables (e.g. `switchMap`) you must dispose the chain yourself.
     * @memberof WorkerService
     */
    public createMessageHandler = <T extends {}>(
        type: WorkerResultMessageType
    ) =>
        this.notification$.pipe(
            filter(checkMsgType<T>(type)),
            takeUntil(this.dispose$)
        );

    public sendToWorker = (msg: WorkerMessage) => {
        this.messagesToWorker$.next(msg);
    };

    /**
     * Completes all internal observables and throws away the worker instance.
     * After calling dispose you need to instantiate a new WorkerService.
     * @memberof WorkerService
     */
    public dispose = () => {
        this.dispose$.next(true);
        this.worker = null;
    };
}

}
