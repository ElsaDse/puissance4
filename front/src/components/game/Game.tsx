import {useState } from "react";
import "./../../style/game.css";
import type { CellState, Player, PlayerID } from "../../utils/types.ts";
import { GameHeader } from "./GameHeader.tsx";
import { Grid } from "./Grid.tsx";
import { canDropTokens, dropTokensAction, findCurrentPlayer, switchPlayer } from "../../utils/functions/game.ts";



export function Game() {
    const players: Player[]=[
        {id:1, name:"Player1", color:'R'},
        {id:2, name:"Player2", color:'Y'},
    ]
    const [currentPlayer, setCurrentPlayer] = useState<PlayerID>(1);
    const [grid, setGrid] = useState<CellState[][]>(
        Array.from({ length: 6 }, () => Array(7).fill("E"))
    );

    const onDropToken=(x:number)=>{
        if(canDropTokens(grid, x)){
            setGrid(dropTokensAction(grid, x, currentPlayer, players))
            setCurrentPlayer(switchPlayer(currentPlayer, players));
        }
    }

  return (
    <div className="game-container">
      <GameHeader players={players} currentPlayer={currentPlayer} />
      <Grid grid={grid} color={findCurrentPlayer(players, currentPlayer)!.color} onDrop={onDropToken} />
      <QuitButton />
    </div>
  );
}


export  function QuitButton() {
  return (
    <button className="quit-btn">
      Quitter la partie
    </button>
  );
}

