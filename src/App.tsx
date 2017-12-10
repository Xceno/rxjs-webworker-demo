import * as React from "react";
import { Subscription } from "rxjs/Subscription";

import "./App.css";
import { FibonacciTask, WorkerMessage } from "./worker/com-models";
import { WorkerService } from "./worker/worker-service";

interface AppState {
  value: number;
  result: number;
  isCalculating: boolean;
  isIllegalNumber: boolean;
}

class App extends React.Component<{}, AppState> {
  private subs: Subscription[] = [];
  private workerService: WorkerService = new WorkerService();

  public constructor(props: any) {
    super(props);
    this.state = {
      value: 0,
      result: 0,
      isCalculating: false,
      isIllegalNumber: false
    };

    this.subs.push(
      this.workerService
        .createMessageHandler<number>("FibonnaciResult")
        .map(msg => msg.data)
        .subscribe(result => this.setState({ result, isCalculating: false }))
    );
  }

  public render() {
    const result = this.state.isIllegalNumber ? (
      <div className="illegal-number-warning">Sorry, I cannot process numbers above 1475 :(</div>
    ) : (
      <div className="result">
        {this.state.isCalculating ? <strong>Crunching numbers...</strong> : <strong style={{ marginRight: "5px" }}>Result: {this.state.result}</strong>}
      </div>
    );

    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to the RxJs WebWorker example!</h2>
        </div>
        <div style={{ marginTop: "40px" }}>
          <label htmlFor="some-number">Enter a number</label>
          <input type="number" name="some-number" id="some-number" min="0" max="1475" onChange={this.handleChange} />
        </div>
        <div>IsCalculating: {this.state.isCalculating ? "Yes" : "No"}</div>
        {result}
      </div>
    );
  }

  public componentWillUnmount() {
    this.subs.map(x => x.unsubscribe());
  }

  private handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.valueAsNumber;
    // tslint:disable-next-line:no-magic-numbers
    const isIllegalNumber = value > 1475;

    if (!isIllegalNumber) {
      this.workerService.sendToWorker(new WorkerMessage<FibonacciTask>("CalcFibonacci", { value, disableCache: false }));
    }

    this.setState({
      value,
      isCalculating: !isIllegalNumber,
      isIllegalNumber
    });
  };
}

// tslint:disable-next-line:no-default-export
export default App;
