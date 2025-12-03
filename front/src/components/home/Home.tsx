import type { Player } from "../../utils/types.ts";
import { HomeHeader } from "./HomeHeader";
import { SectionJoin } from "./SectionJoin";
import { SectionModeJeu } from "./SectionModeJeu";
import { SectionStats } from "./SectionStats";
import './../../style/home.css'



export function Home(){

  let user: Player|null= null
  const stored = localStorage.getItem("user");
  if(stored){
    const stored_user =JSON.parse(stored)
    user= {id: stored_user.id, name: stored_user.username}
  }

    return(
        <>
            <div className="div home-container">
                <HomeHeader player={user!}/>
                <SectionJoin/>
                <SectionModeJeu/>
                <SectionStats/>
                </div>
        </>
    )
}