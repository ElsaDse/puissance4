import { Server } from "socket.io";

// Gestion des rooms en mémoire
type Room = {
  hostId: string;
  opponentId?: string;
  currentPlayerId?: string;
}

//
const rooms: Record<number, Room> = {};

//Initialise les WebSockets pour le jeu
export function initGameSockets(io: Server) {
    io.on("connection", (socket) => {
        console.log("Client WS connecté:", socket.id);

        // Hôte rejoint la room
        socket.on("host_join_room",( gameId: number) => {
            rooms[gameId] = { hostId: socket.id };
            socket.join(`game_${gameId}`);
            console.log(`Hôte ${socket.id} dans la room ${gameId}`);
        });

        // Adversaire rejoint la room
        socket.on("opponent_join_room", ({ gameId, starterUserId}) => {
            console.log("STARTER_USERID: ",starterUserId )
            if (!rooms[gameId]) return;
            rooms[gameId].opponentId = socket.id;
            socket.join(`game_${gameId}`);
            console.log(`Adversaire ${socket.id} rejoint ${gameId}`);

            // prévenir l’hôte que l’adversaire est là
            io.to(rooms[gameId].hostId).emit("player_joined");
            // envoyer le starter provenant de la BDD
            io.to(`game_${gameId}`).emit("start_game", {starterUserId});
        });

        socket.on("disconnect", () => {
            console.log("Client WS déconnecté:", socket.id);
        });
    });
}
