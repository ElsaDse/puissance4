import axios from "axios";
import { useEffect, useState } from "react";

type Stat={
    username: string,
    games: number,
    wins: number,
    avgTime: string,
}

export function SectionStats(){

    const [stats, setStats] = useState<Stat[]>([]);
    const [loading, setLoading] = useState(true);
   
    useEffect(() => {
        async function fetchStats() {
        try {
            const res = await axios.get("http://localhost:4000/game/stats");
            setStats(res.data);
        } catch (err) {
            console.error("Erreur stats :", err);
        } finally {
            setLoading(false);
        }
        }
        fetchStats();
    }, []);

    if (loading) {
        return <p>Chargement des statistiques...</p>;
    }
   

    return(
        <>
        <section className="stats-section">
            <table>
            <thead>
                <tr>
                <th>Joueur</th>
                <th>Parties</th>
                <th>Victoires</th>
                <th>Temps moyen</th>
                </tr>
            </thead>
            <tbody>
                {stats.map((stat) => (
                <tr key={stat.username}>
                    <td>{stat.username}</td>
                    <td>{stat.games}</td>
                    <td>{stat.wins}</td>
                    <td>{stat.avgTime}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </section>
        </>
    )
}