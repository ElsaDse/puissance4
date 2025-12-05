
import type { CSSProperties } from "react"
import type { CellState, GridState, PlayerColor } from "./../../utils/types.ts"
import { findColor } from "../../utils/functions/game.ts"


type GridProps={
    grid:GridState,
    color?: PlayerColor,
    canPlay?: boolean,
    onDrop?: (x:number)=>void,
}


export function Grid({grid, color, onDrop, canPlay}:GridProps){
    const cols= grid[0].length 
    const showColumns= color && onDrop

    return(
        <>
            <div className={`grid ${!canPlay ? "blocked" : ""}`}
                style={{'--rows': grid.length, '--cols':cols} as CSSProperties}
            >
                {grid.map((row, y)=>row.map((color, x)=>
                    <Cell y={y} color={color} key={`${x}-${y}`}/>
                ))}
                {showColumns &&<div className="columns">
                    {new Array(cols).fill(1).map((_, colIndex)=>
                        <Column key={colIndex} onClickColums={()=>onDrop(colIndex)} /> 
                    )}
                </div>}
            </div>
        </>
    )
}


type CellProps={
    y:number,
    color:CellState,
}

export function Cell ({y, color}: CellProps){
    return(
        <>
            <div className={`cell${findColor(color)}`}
                style={{'--row': y} as CSSProperties}
            >
            </div>
        </>
    )
}


type ColumnProps={
    onClickColums: ()=>void
}

function Column ({onClickColums}:ColumnProps){
    return(
        <>
            <button onClick={onClickColums} className="column">
            </button>
        </>
    )
}