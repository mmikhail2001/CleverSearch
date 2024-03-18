import React from "react";
import { render } from "react-dom";
import { VariableSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

const Row = ({ index, style }) => (
    <div className={index % 2 ? "ListItemOdd" : "ListItemEven"} style={style}>
        Row {index}
    </div>
);

export const Example = () => (
    <AutoSizer>
        {({ height, width }) => (
            <VariableSizeList
                className="List"
                height={height}
                itemCount={1000}
                width={width}
            >
                {Row}
            </VariableSizeList>
        )}
    </AutoSizer>
);

