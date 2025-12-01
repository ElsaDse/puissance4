import { findColor } from "../../utils/functions/game.ts";
import type { Player } from "../../utils/types.ts";

type PlayerInfoProps= {
  player: Player;
  active: boolean;
}

export default function PlayerInfo({ player, active=true }: PlayerInfoProps) {
  return (
    <div className={`player-info ${active ? "active" : ""}`}>
      <span className="player-name">{player.name}</span>
      <div className={`cell${findColor(player.color!)}`}/>
    </div>
  );
}
