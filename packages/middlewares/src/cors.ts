import { CorsOptions } from 'cors';

export const corsOptions: CorsOptions = {
  origin: '*', // Permite tudo (bom para dev, cuidado em produção)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};