import type { CellState, GridState, Player, PlayerColor, PlayerID } from "./../types.ts";

export function formatTime(time:number): string{
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    if (hours > 0) {
        return `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
    }
    return `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
}



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


export function winningPosition(grid: GridState, color: PlayerColor, x:number, y:number,size:number){
    const directions=[
        [1,0],  //horizontal
        [0,1],  //vertical
        [1,1],  //diagonale bas-droite
        [1,-1], // diagonale haut-droite
    ]
    const rows = grid.length;
    const cols = grid[0].length;
    const inBounds = (nx: number, ny: number) => nx >= 0 && nx < cols && ny >= 0 && ny < rows;
    const position = { y, x };

    for (const direction of directions) {
        const items= [position]
        // pour chaque direction on verifie le sens contraire
        for(const forward of [1, -1]) {
            for(let i=1; i<size; i++ ) {
                const x= position.x + i*direction[0]*forward
                const y= position.y +i*direction[1]*forward
                if (!inBounds(x, y)) break;  // limite de la grille
                if(grid[y][x]!== color){
                    break;
                } 
                items.push({y, x})
            }
        }
        
        if(items.length>= size){
            return items
        }
    }
    return undefined
}


