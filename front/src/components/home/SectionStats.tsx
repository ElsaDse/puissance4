
/*type SectionStatsProps={
    stats: {
        username: string,
        games: number,
        wins: number,
        avgTime: string,
    }[]
}*/

export function SectionStats(){
   
    const stats=[
        {
            username: "playeur1",
            games: 12,
            wins: 7,
            avgTime: "06:27",
        },
    ]

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