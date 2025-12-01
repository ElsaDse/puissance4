
export type Position= {
    y: number,
    x: number
}

export type PlayerColor= 'R'|'Y'

export type Player={
    id: number,
    name: string,
    color?: PlayerColor
}

export type PlayerID = Player["id"];
export type PlayerName = Player["name"];

export type CellEmpty= 'E'
export type CellState= CellEmpty| PlayerColor
export type GridState= CellState[][]
