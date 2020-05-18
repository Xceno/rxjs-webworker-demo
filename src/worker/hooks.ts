import { useEffect, useRef, useState } from "react";
import { map } from "rxjs/operators";
import { WorkerMessage, WorkerResultMessageType } from "./com-models";
import { WorkerService } from "./worker-service";

interface WorkerResult<T> {
    result: null | T;
    isRunning: boolean;
}

type useWorkerResult<TResult, TMessage> = [
    WorkerResult<TResult>,
    (msg: WorkerMessage<TMessage>) => void
];

export const useWorker = <TResult = any, TMessage = any>(
    type: WorkerResultMessageType
): useWorkerResult<TResult, TMessage> => {
    const [state, setState] = useState({ result: null, isRunning: false });
    const service = useRef<WorkerService>();

    useEffect(() => {
        service.current = new WorkerService();
        const sub = service.current
            .createMessageHandler<any>(type)
            .pipe(map((msg) => msg.data))
            .subscribe((result) => setState({ result, isRunning: false }));

        return () => sub.unsubscribe();
    }, [type]);

    console.debug("[UseWorker hook]", state);
    const sendToWorker = <T>(msg: WorkerMessage<T>) => {
        service.current!.sendToWorker(msg);
        setState({ ...state, isRunning: true });
    };

    return [state, sendToWorker];
};
