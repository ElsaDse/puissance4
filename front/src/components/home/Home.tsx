import type { Player } from "../../utils/types.ts";
import { HomeHeader } from "./HomeHeader";
import { SectionJoin } from "./SectionJoin";
import { SectionModeJeu } from "./SectionModeJeu";
import { SectionStats } from "./SectionStats";
import './../../style/home.css'

/*type PlayerStat= {
  username: string;
  games: number;
  wins: number;
  avgTime: string; // format 00:00
}*/

type HomeProps= {
  player: Player;
  /*stats: PlayerStat[];
  onLogout: () => void;
  onJoin: (id: string) => void;
  onCreate: () => void;*/
}

export function Home({player}:HomeProps){

    return(
        <>
            <div className="div home-container">
                <HomeHeader player={player}/>
                <SectionJoin/>
                <SectionModeJeu/>
                <SectionStats/>
                </div>
        </>
    )
}