import {useEffect, useMemo, useState } from "react";
import "./../../style/game.css";
import type { CellState, Player, PlayerID } from "../../utils/types.ts";
import { GameHeader } from "./GameHeader.tsx";
import { Grid } from "./Grid.tsx";
import { canDropTokens, dropTokensAction, findCurrentPlayer, findFreePositionY, formatTime, isGridFull, switchPlayer, winningPosition } from "../../utils/functions/game.ts";
import { VictoryPopup } from "./VictoryPopup.tsx";
import axios from "axios";
import socket from "../../utils/socket.ts";
import { GameOverPopup } from "./GameOverPopup.tsx";
import { useNavigate } from "react-router-dom";



export function Game() {

    const align: number=4
    const [grid, setGrid] = useState<CellState[][]>(
        Array.from({ length: 6 }, () => Array(7).fill("E"))
    );
    const navigate= useNavigate()

    const stored = localStorage.getItem("user");
    const localUser = JSON.parse(stored!);
    const localPlayerId = localUser.id;
    const storedGame = localStorage.getItem("game");
    const gameId = storedGame ? JSON.parse(storedGame).id : null;

    
    const [players, setPlayers]= useState<Player[]>([])
    const [timer, setTimer] = useState(0);
    const [currentPlayer, setCurrentPlayer] = useState<PlayerID>();
    const [winner, setWinner] = useState<Player>();
    const [duration, setDuration] = useState("00:00");
    const [isDraw, setIsDraw] = useState<boolean>(false);
    const [gameMode, setGameMode] = useState<'pvp' | 'ia'>(); 

    // Memo pour éviter de refaire la recherche à chaque render
    const currentPlayerObj = useMemo(
      () => currentPlayer !== undefined ? findCurrentPlayer(players, currentPlayer) : undefined,
      [players, currentPlayer]
    );


    //winnerTimer
    useEffect(() => {
      if(winner!==undefined) return;
      const seconds = setInterval(() => setTimer((s) => s + 1), 1000);
      return () => clearInterval(seconds);
    }, [winner]);


    //api
    useEffect(()=>{
      if(!gameId) return;

      async function fetchPlayers() {
        try {
          const res = await axios.get(`http://localhost:4000/game/players?game_id=${gameId}`);
          setPlayers(res.data.players);
          setCurrentPlayer(res.data.starterPlayer)
          setGameMode(res.data.mode)
        } catch (err) {
          console.error("Erreur récupération joueurs :", err);
        }
      }
      fetchPlayers()
  
    }, [gameId])


    //socket : Ecoute les coups de l'adversaire
    useEffect(()=>{
      if(!gameId) return;

      if(!socket.connected) socket.connect()

      const handlePlayMove= ({x, y, player_id}:{x: number; y: number; player_id: PlayerID})=>{
        const playerWhoPlayed= players.find((p) => p.id === player_id);
        if (!playerWhoPlayed) {
          console.warn("Joueur inconnu pour ce coup");
          return;
        }
        // Crée une nouvelle grille avec le coup appliqué
        const newGrid = grid.map((row) => [...row]);
        newGrid[y][x]= playerWhoPlayed.color!
        setGrid(newGrid)
        //check la victoire
        const positions=winningPosition(grid, playerWhoPlayed.color!, x, y, align)
        if(positions!== undefined){
          setWinner(playerWhoPlayed)
          setDuration(formatTime(timer))
          socket.emit("game_over", {
            gameId, 
            winnerId: playerWhoPlayed.id,
            durationSeconds: timer,
            isDraw: false
          })
        } else if(isGridFull(grid)){ //si partie perdue
          setIsDraw(true)
          socket.emit("game_over", {
            gameId, 
            winnerId:null,
            durationSeconds: timer,
            isDraw: true
          })
        }
        //passer au tour suivant
        setCurrentPlayer(switchPlayer(playerWhoPlayed.id, players))
      }

      socket.on("play_move", handlePlayMove);
      return () => {
        socket.off("play_move", handlePlayMove);
      };
    }, [gameId, grid, timer, players ])


    //Jouer localement
    const onDropToken=(x:number)=>{
      if(localPlayerId!= currentPlayer){
        console.warn("pas ton tour")
        return;
      }
      if (!currentPlayerObj) {
        console.warn("Joueur actuel introuvable");
        return;
      }

      if(canDropTokens(grid, x)){
        //maj locale
        const y= findFreePositionY(grid, x)
        const newGrid =dropTokensAction(grid, x, currentPlayer!, players)
        setGrid(newGrid)
        //envoi coup au serveur
        socket.emit("drop_token", {gameId, x, y, player_id: currentPlayer});
        //si coup gagnant
        const positions=winningPosition(grid, currentPlayerObj.color!, x, y, align)
        if(positions!== undefined){
          setWinner(currentPlayerObj)
          setDuration(formatTime(timer))
          socket.emit("game_over", {
            gameId, 
            winnerId: currentPlayerObj.id,
            durationSeconds: timer,
            isDraw
          })
        } else if(isGridFull(grid)){ //si partie perdue
          setIsDraw(true)
          socket.emit("game_over", {
            gameId, 
            winnerId:null,
            durationSeconds: timer,
            isDraw
          })
        }
        //change de tour
        setCurrentPlayer(switchPlayer(currentPlayer!, players))
      }
    }


    const restartGame=()=>{
      if(gameMode==='ia'){
        setGrid(Array.from({ length: 6 }, () => Array(7).fill("E")))
        setWinner(undefined)
        setTimer(0)
        setCurrentPlayer(undefined)
        setIsDraw(false)
        setDuration("00:00")
      } else{
        localStorage.removeItem('game');
        navigate('/home')
      } 
    }


    const quitGame=()=>{
      localStorage.removeItem('game');
      navigate('/home')
    }

    const leaveGame=()=>{
      if(gameMode==='pvp'){
        quitGame()
      }
    }

    if (!gameId || players.length === 0 || !currentPlayerObj) {
      return <div className="game-container">Chargement de la partie...</div>;
    }

  return (
    <div className="game-container">
      <GameHeader players={players} 
        currentPlayer={currentPlayer!}
        timer={formatTime(timer)} 
      />
      <Grid grid={grid} 
        color={currentPlayerObj!.color} 
        onDrop={onDropToken} 
        canPlay={currentPlayer === localPlayerId}
      />
      <QuitButton onQuit={leaveGame}/>

      {winner!==undefined && (
        <VictoryPopup
          winner={winner}
          duration={duration}
          onReplay={restartGame}
          onQuit={quitGame}
        />
      )}
      {isDraw&&(
        <GameOverPopup onClose={quitGame}/>
      )}
    </div>
  );
}


export  function QuitButton({onQuit}:{onQuit:()=>void}) {
  return (
    <button className="quit-btn" onClick={onQuit}>
      Quitter la partie
    </button>
  );
}

