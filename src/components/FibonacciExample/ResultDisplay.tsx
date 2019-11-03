import React from "react";

export interface ResultDisplayProps {
    isIllegalNumber: boolean;
    isCalculating: boolean;
    result: number | null;
    style?: React.CSSProperties;
}
export const ResultDisplay = React.memo(
    ({ isIllegalNumber, isCalculating, result, style }: ResultDisplayProps) =>
        isIllegalNumber ? (
            <div className="illegal-number-warning" style={style}>
                Sorry, I cannot process numbers above 1475 :(
            </div>
        ) : (
            <div className="result" style={style}>
                {isCalculating ? (
                    <strong>Crunching numbers...</strong>
                ) : (
                    <strong style={{ marginRight: "5px" }}>
                        Result: {result || "N/A"}
                    </strong>
                )}
            </div>
        )
);
