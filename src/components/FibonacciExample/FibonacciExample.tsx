import React, { useState } from "react";
import { FibonacciTask, WorkerMessage } from "../../worker/com-models";
import { useWorker } from "../../worker/hooks";
import "./FibonacciExample.css";
import { FibonacciInput } from "./FibonacciInput";
import { ResultDisplay } from "./ResultDisplay";

const initialState = {
    value: 0,
    isIllegalNumber: false
};

export interface FibonacciExampleProps {
    disableCache?: boolean;
}

export const FibonacciExample = () => {
    const [state, setState] = useState(initialState);
    const [workerState, sendToWorker] = useWorker<number>("FibonnaciResult");
    const [worker2State, sendToWorker2] = useWorker<number>("FibonnaciResult");

    const handleChange = (value: number) => {
        const isIllegalNumber = value > 1475; // When memoization in the worker is turned off, numbers above 1475 cause Chrome to explode.

        setState({
            value,
            isIllegalNumber
        });

        if (!isIllegalNumber) {
            sendToWorker(
                new WorkerMessage<FibonacciTask>("CalcFibonacci", {
                    value,
                    disableCache: false
                })
            );
            sendToWorker2(
                new WorkerMessage<FibonacciTask>("CalcFibonacci", {
                    value,
                    disableCache: true
                })
            );
        }
    };

    return (
        <section className="fib-example">
            <header>
                <h2>Fibonnaci Worker</h2>
                <p>
                    You will see a noticable difference around 38.
                    <br />
                    Beware! Around 45 the worker with disabled cache will
                    basically take forever ;)
                </p>
            </header>
            <div className="fib-example--wrapper">
                <div className="fib-example--input">
                    <h4>Webworker with memoization</h4>
                    <FibonacciInput
                        value={state.value}
                        handleChange={handleChange}
                    />
                    <ResultDisplay
                        isIllegalNumber={state.isIllegalNumber}
                        isCalculating={workerState.isRunning}
                        result={workerState.result}
                    />
                </div>
                <div
                    className={`fib-example--input ${
                        state.value > 50 ? "insanity" : ""
                    }`}
                >
                    <h4>Webworker without memoization</h4>
                    <FibonacciInput
                        value={state.value}
                        handleChange={handleChange}
                    />
                    <ResultDisplay
                        isIllegalNumber={state.isIllegalNumber}
                        isCalculating={worker2State.isRunning}
                        result={worker2State.result}
                        style={{
                            color: `hsl(${
                                state.value > 50
                                    ? 0
                                    : 100 - Math.exp(state.value / 10)
                            },100%,50%)`
                        }}
                    />
                </div>
            </div>
        </section>
    );
};
