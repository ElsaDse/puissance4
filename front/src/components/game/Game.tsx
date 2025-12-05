import {useEffect, useState } from "react";
import "./../../style/game.css";
import type { CellState, Player, PlayerID } from "../../utils/types.ts";
import { GameHeader } from "./GameHeader.tsx";
import { Grid } from "./Grid.tsx";
import { canDropTokens, dropTokensAction, findCurrentPlayer, findFreePositionY, formatTime, switchPlayer, winningPosition } from "../../utils/functions/game.ts";
import { VictoryPopup } from "./VictoryPopup.tsx";
import socket from "../../utils/socket.ts";

if(!socket.connected){
  socket.connect()
}

export function Game() {

    const align: number=4
    const [grid, setGrid] = useState<CellState[][]>(
        Array.from({ length: 6 }, () => Array(7).fill("E"))
    );
    const stored = localStorage.getItem("user");
    const localUser = JSON.parse(stored!);
    const localPlayerId = localUser.id;

    const players: Player[]=[
      {id:1, name:"Player1", color:'R'},
      {id:2, name:"Player2", color:'Y'},
    ]
    const [timer, setTimer] = useState(0);
    const [currentPlayer, setCurrentPlayer] = useState<PlayerID>(1);
    const [winner, setWinner] = useState<Player>();
    const [duration, setDuration] = useState("00:00");


    //winner
    useEffect(() => {
      if(winner!==undefined) return;
      const seconds = setInterval(() => setTimer((s) => s + 1), 1000);
      return () => clearInterval(seconds);
    }, [winner]);

    //socket.io
    useEffect(()=>{
      socket.on("start_game", ({starterUserId})=>{
        setCurrentPlayer(starterUserId)
      })
    }, [])

    const onDropToken=(x:number)=>{
      if(localPlayerId!= currentPlayer){
        console.warn("pas ton tour")
        return;
      }

      if(canDropTokens(grid, x)){
        setGrid(dropTokensAction(grid, x, currentPlayer, players))
        const player= findCurrentPlayer(players, currentPlayer)
        const positions=winningPosition(grid, player!.color!, x, findFreePositionY(grid, x), align)
        if(positions!== undefined){
          setWinner(player)
          setDuration(formatTime(timer))
        }
          setCurrentPlayer(switchPlayer(currentPlayer, players))
      }
    }

    const restartGame=()=>{
      setGrid(Array.from({ length: 6 }, () => Array(7).fill("E")))
      setWinner(undefined)
      setTimer(0)
      setCurrentPlayer(1)
    }


  return (
    <div className="game-container">
      <GameHeader players={players} 
        currentPlayer={currentPlayer}
        timer={formatTime(timer)} 
      />
      <Grid grid={grid} 
        color={findCurrentPlayer(players, currentPlayer)!.color} 
        onDrop={onDropToken} 
        canPlay={currentPlayer === localPlayerId}
      />
      <QuitButton />

      {winner!==undefined && (
        <VictoryPopup
          winner={winner}
          duration={duration}
          onReplay={restartGame}
          onQuit={() => null}
        />
      )}
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

