import { useEffect, useState } from "react";
import PlayerInfo from "./PlayerInfo.tsx";
import type { Player, PlayerID } from "../../utils/types.ts";

type GameHeaderProps = {
  players: Player[];
  currentPlayer: PlayerID;
}

export function GameHeader({ players, currentPlayer }: GameHeaderProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="game-header">
      <div className="timer">
        <h2>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</h2>
      </div>
    
      <div className="players">
        {players.map((player) => (
          <PlayerInfo 
            key={player.id}
            player={player}
            active={currentPlayer===player.id}
          />
        ))}
      </div>
    </div>
  );
}
