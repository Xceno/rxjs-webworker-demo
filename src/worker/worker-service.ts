// tslint:disable-next-line:no-implicit-dependencies
import * as MyWorker from "worker-loader!./worker";
import { checkMsgType, WorkerMessage, WorkerMessageType } from "../worker/com-models";

import "rxjs/add/observable/empty";
import "rxjs/add/observable/from";
import "rxjs/add/observable/fromPromise";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/switchMap";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";

export class WorkerService {
  private worker: Worker;
  private messagesToWorker$: BehaviorSubject<WorkerMessage<any>>;
  public notification$: Observable<WorkerMessage<any>>;

  public constructor() {
    this.worker = new (MyWorker as any)();
    this.messagesToWorker$ = new BehaviorSubject<WorkerMessage<any>>(null as any);

    const workerNotification$ = new Subject<WorkerMessage<any>>();
    this.notification$ = workerNotification$.asObservable();

    const startMessagePipeline = () => {
      console.debug("[WorkerService] Starting msg pipeline!");
      this.messagesToWorker$.filter(msg => msg != null).subscribe(
        msg => {
          this.worker.postMessage(msg.encodeForTransport());
        },
        err => console.error("[WorkerService] Couldn't post message to worker.", err)
      );
    };

    this.worker.onmessage = encodedMsg => {
      const workerMessage = WorkerMessage.fromJson<any>(encodedMsg ? encodedMsg.data : null);
      console.debug("[WorkerService] Got message from worker", workerMessage);
      if (workerMessage.type === "Ready") {
        startMessagePipeline();
      } else {
        workerNotification$.next(workerMessage);
      }
    };
  }

  public createMessageHandler = <T extends {}>(type: WorkerMessageType) =>
    this.notification$.filter(msg => checkMsgType(msg, type)) as Observable<WorkerMessage<T>>;

  public sendToWorker = (msg: WorkerMessage<any>) => {
    this.messagesToWorker$.next(msg);
  };
}
