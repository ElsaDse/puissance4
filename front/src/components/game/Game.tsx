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
import { QuitConfirmationModal } from "./QuitConfirmationModal.tsx";



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
    const [showQuitConfirm, setShowQuitConfirm] = useState(false);

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

      async function loadGame() {
        try {
          const res = await axios.get(`http://localhost:4000/game/state?game_id=${gameId}`);
          setPlayers(res.data.players);
          setGameMode(res.data.mode)
          if(res.data.starterPlayer) {
            setCurrentPlayer(res.data.starterPlayer)
          } else setCurrentPlayer(res.data.currentPlayer)
          if(res.data.grid) {
            setGrid(res.data.grid)
          }
          if(res.data.mode === "ia"){
            const humanPlayer = res.data.players.find((p:Player) => p.id === localPlayerId);
            if(humanPlayer){
              localStorage.setItem("hostColor", JSON.stringify({color:humanPlayer.color}));
            }
          }
        } catch (err) {
          console.error("Erreur récupération joueurs :", err);
        }
      }
      loadGame()
  
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


    //play ia
    useEffect(() => {
      if(gameMode !== "ia") return;
      if(currentPlayer !== -1) return; // pas le tour IA
      if (winner || isDraw) return;
      const playIA = async () => {
        const res = await axios.post("http://localhost:4000/game/play/ia", { gameId });
        const newGrid= res.data.grid
        const finished= res.data.finished
        const result= res.data.result

        setGrid(newGrid);

        if(finished){
          if (result === "loss") {
          setWinner(players.find(p => p.id === -1));
          setDuration(formatTime(timer)) 
        } else if (result === "win") {
          setWinner(players.find(p => p.id === localPlayerId)); 
          setDuration(formatTime(timer))
        } else if (result === "draw") {
          setIsDraw(true);
        }
        return;
        }
        // passer au tour humain
        setCurrentPlayer(localPlayerId)
      }

      const timer=setTimeout(playIA, 500) // petit délai pour UX
      return () => clearTimeout(timer);
    }, [currentPlayer, gameMode, grid, gameId, localPlayerId, players])




    //Jouer localement
    const onDropToken= async (x:number)=>{
      if(localPlayerId!= currentPlayer){
        console.warn("pas ton tour")
        return;
      }
      if (!currentPlayerObj) {
        console.warn("Joueur actuel introuvable");
        return;
      }

      if(gameMode==="pvp"){
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

      if(gameMode==="ia"){
        if (winner || isDraw) return;
        if(canDropTokens(grid, x)){
          const y= findFreePositionY(grid, x)
          const newGrid =dropTokensAction(grid, x, currentPlayer!, players)
          setGrid(newGrid)
          await axios.post("http://localhost:4000/game/move", {
            gameId,
            userId: currentPlayer,
            col: x,
            row: y
          });
          const positions=winningPosition(grid, currentPlayerObj.color!, x, y, align)
          if(positions!== undefined){
            setWinner(currentPlayerObj)
            setDuration(formatTime(timer))
            return;
          } else if(isGridFull(grid)){ 
            setIsDraw(true)
            return;
          }
          //tour ia
          setCurrentPlayer(-1)
        }
      }
    }


    const restartGame = async () => {
      if (gameMode !== "ia") {
        quitGame();
        return;
      }

      try {
        // Sauvegarder les paramètres actuels
        const gameData = JSON.parse(localStorage.getItem("game")!);
        const { difficulty } = gameData; 
        const host_color = JSON.parse(localStorage.getItem("hostColor")!);
        const { color } = host_color; 

        //  Créer une NOUVELLE partie 
        const createRes = await axios.post("http://localhost:4000/game/create/ia", {
          userId: localPlayerId,
          difficulty: difficulty ,
          color: color
        });

        //  Mettre à jour localStorage
        localStorage.setItem('game', JSON.stringify(createRes.data));

        // Reset et rechargement
        setGrid(Array.from({ length: 6 }, () => Array(7).fill("E")));
        setWinner(undefined);
        setTimer(0);
        setCurrentPlayer(undefined);
        setIsDraw(false);
        setDuration("00:00");

        window.location.reload();

      } catch (error) {
        console.error("Erreur restart :", error);
        setGrid(Array.from({ length: 6 }, () => Array(7).fill("E")));
        setWinner(undefined);
        setTimer(0);
        setCurrentPlayer(undefined);
        setIsDraw(false);
        setDuration("00:00");
      }
    }


    const quitGame=()=>{
      localStorage.removeItem('game');
      navigate('/home')
    }

    const leaveGame= async()=>{
      if (gameMode !== "ia") {
        quitGame();
        return;
      }
      if (winner || isDraw) {
        quitGame();
        return;
      }
      if(localUser.is_guest){
        handleQuitWithoutSave()
      }
      setShowQuitConfirm(true);
    }

    const handleSaveAndQuit = async () => {
      try {
        await axios.post("http://localhost:4000/game/save", { gameId });
      } catch (err) {
        console.error("Erreur sauvegarde :", err);
      } finally {
        setShowQuitConfirm(false);
        quitGame();
      }
    };

    const handleQuitWithoutSave = async () => {
      try {
        await axios.post("http://localhost:4000/game/delete", { gameId });
        console.log("Partie supprimée de la base");
      } catch (err) {
        console.error("Erreur suppression :", err);
      } finally {
        setShowQuitConfirm(false);
        quitGame();
      }
    };

    const handleCancelQuit = () => {
      setShowQuitConfirm(false);
    };

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
        canPlay={currentPlayer === localPlayerId && !winner && !isDraw}
      />
      <QuitButton onQuit={leaveGame}/>

      <QuitConfirmationModal
        isOpen={showQuitConfirm}
        onSaveAndQuit={handleSaveAndQuit}
        onQuitWithoutSave={handleQuitWithoutSave}
        onCancel={handleCancelQuit}
      />

      {winner!==undefined && winner.id!==-1 && (
        <VictoryPopup
          winner={winner}
          duration={duration}
          onReplay={restartGame}
          onQuit={quitGame}
        />
      )}
      {(isDraw || winner?.id===-1)&&(
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

