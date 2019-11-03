import React from "react";

export interface FibonacciInputProps {
    value: number;
    handleChange(value: number): void;
}
export const FibonacciInput = ({
    value,
    handleChange
}: FibonacciInputProps) => (
    <section>
        <div style={{ marginTop: "40px" }}>
            <label htmlFor="some-number">Enter a number</label>
            <input
                type="number"
                name="some-number"
                id="some-number"
                min="0"
                max="1475"
                value={value}
                onChange={x =>
                    handleChange(x.target.value ? x.target.valueAsNumber : 0)
                }
            />
        </div>
    </section>
);
