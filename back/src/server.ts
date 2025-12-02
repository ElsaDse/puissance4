import Fastify from 'fastify';
import cors from '@fastify/cors'
import authRoutes from './routes/auth.ts';

const fastify = Fastify({ logger: true });


await fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type'],  
  credentials: true 
});

// REST routes
fastify.register(authRoutes, { prefix: '/auth' });


const start = async () => {
  try {
    await fastify.listen({ port: 4000 });
    console.log('Serveur lancé sur http://localhost:4000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
