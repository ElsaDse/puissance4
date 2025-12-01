import type { CellState, GridState, Player, PlayerID } from "./../types.ts";

export function findColor(color:CellState){
    if(color=== 'E'){
        return ''
    }
    return `${color=== 'Y'? '-yellow': '-red'}`
}


export function findFreePositionY(grid: GridState, x: number): number{
    for(let y=grid.length-1; y>=0; y--){
        if(grid[y][x]=== "E"){
            return y
        }
    }
    return -1
}


export function findCurrentPlayer(players: Player[], currentPlayer:PlayerID){
    const player= players.find(p=> p.id=== currentPlayer)
    if(!player) return undefined
    return player
}


//Passer au joueur suivant
export const switchPlayer= (currentPlayer: PlayerID, players: Player[]):PlayerID=>{
    const nextPlayer = players.find(p => p.id !== currentPlayer);
    const updateCurrentPlayer =nextPlayer ? nextPlayer.id : currentPlayer;
    return  updateCurrentPlayer
};


export function canDropTokens(grid:GridState, x:number):boolean{
    return x < grid[0].length &&
        x >=0 &&
        findFreePositionY(grid, x)>=0
}


// Déposer le jeton dans la première ligne vide de la colonne x
export const dropTokensAction= (grid:GridState, x: number, currentPlayer:PlayerID, players:Player[]): GridState=>{
    const y= findFreePositionY(grid, x)
    // Clone profond de la grille pour immutabilité
    const newGrid = grid.map(row => [...row]);
    if (newGrid[y][x] === 'E') {
        newGrid[y][x] = findCurrentPlayer(players,currentPlayer)!.color!;
    }
    return newGrid
};

