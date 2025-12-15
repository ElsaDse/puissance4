import { useNavigate } from "react-router-dom"
import type { Player } from "../../utils/types.ts"

type HomeHeaderProps={
    player: Player,
    onLogout?: ()=>void
}

export function HomeHeader({player}: HomeHeaderProps){

    const navigate= useNavigate()
    const onLogout=()=>{
        localStorage.removeItem('user');
        navigate('/')
    }

    return(
        <>
        <header className="home-header">
            <span className="user-name">👤 {player.name}</span>
            <button className="logout-btn" onClick={onLogout}>Se déconnecter</button>
        </header>
        </>
    )
}