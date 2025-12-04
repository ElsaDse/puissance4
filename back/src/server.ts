import Fastify from 'fastify';
import cors from '@fastify/cors'
import authRoutes from './routes/auth.ts';
import { gameRoutes } from './routes/game.ts';
import { Server } from 'socket.io';
import http from 'http';
import type { Server as HttpServer } from 'http';
import { initGameSockets } from './websockets/game.ts';

const app = Fastify({ logger: true });


await app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type'],  
  credentials: true 
});


// REST routes
await app.register(authRoutes, { prefix: '/auth' });
await app.register(gameRoutes, { prefix: '/game' });


let io: Server;
app.ready(()=>{
  io= new Server(app.server, {
    cors: {
    origin: true,           
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
  });
  initGameSockets(io);
  console.log("socket.io initialisé")
})


const start = async () => {
  try {
    await app.listen({ port: 4000 });
    console.log('Serveur lancé sur http://localhost:4000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
