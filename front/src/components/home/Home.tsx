import type { Player } from "../../utils/types.ts";
import { HomeHeader } from "./HomeHeader";
import { SectionJoin } from "./SectionJoin";
import { SectionModeJeu } from "./SectionModeJeu";
import { SectionStats } from "./SectionStats";
import './../../style/home.css'

export function Home(){

  const stored = localStorage.getItem("user");
  let user: Player | null = null;
  if (stored) {
    try {
      const storedUser = JSON.parse(stored);
      user = {
        id: storedUser.id,
        name: storedUser.username, // ou .name selon ton type Player
      };
    } catch (e) {
      console.error("Erreur lors du parsing de l'utilisateur depuis localStorage", e);
      // Optionnel : nettoyer un localStorage corrompu
      localStorage.removeItem("user");
    }
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