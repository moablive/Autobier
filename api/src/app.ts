import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { router } from './routes/routes'; 
import { errorMiddleware } from '@autobier/middlewares';

class App {
  public server: express.Application;

  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
    // Handlers de erro devem vir DEPOIS das rotas
    this.handlers(); 
  }

  private middlewares() {
    // 1. Configuração de CORS
    // Se você não tiver o arquivo de options separado, pode usar assim para liberar tudo em dev:
    this.server.use(cors()); 
    // Ou se tiver o arquivo: this.server.use(cors(corsOptions));

    // 2. JSON Parser com Limite Aumentado (Essencial para upload de imagens Base64)
    this.server.use(express.json({ limit: '50mb' }));

    // 3. URL Encoded
    this.server.use(express.urlencoded({ limit: '50mb', extended: true }));
  }

  private routes() {
    // - /api/
    this.server.use('/api', router);
  }

  private handlers() {
    // Middleware de tratamento de erros global
    // Ele intercepta qualquer 'throw new Error' que acontecer nos Controllers/Services
    this.server.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      errorMiddleware(err, req, res, next);
    });
  }
}

export default new App().server;