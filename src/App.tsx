import React from "react";
import "./App.css";
import { FibonacciExample } from "./components/FibonacciExample/FibonacciExample";

const App: React.FC = () => {
    return (
        <div className="App">
            <header className="App-header">
                <h2>Welcome to the RxJs WebWorker example!</h2>
            </header>
            <main>
                <FibonacciExample />
            </main>
        </div>
    );
};

export default App;
