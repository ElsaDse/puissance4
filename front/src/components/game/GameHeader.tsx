import PlayerInfo from "./PlayerInfo.tsx";
import type { Player, PlayerID } from "../../utils/types.ts";

type GameHeaderProps = {
  players: Player[];
  currentPlayer: PlayerID;
  timer: string;
}

export function GameHeader({ players, currentPlayer, timer }: GameHeaderProps) {

  return (
    <div className="game-header">
      <div className="timer">
        <h2>{timer}</h2>
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
