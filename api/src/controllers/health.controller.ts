import { Request, Response } from 'express';
import { db } from '@autobier/db';
import { sql } from 'drizzle-orm';

export class HealthController {
  
  async handle(req: Request, res: Response) {
    try {
      // O comando `SELECT 1` força uma ida e volta (round-trip) ao banco.
      // Se houver falha de rede ou autenticação, o Drizzle lançará uma exceção.
      await db.execute(sql`SELECT 1`);

      return res.status(200).json({
        status: 'UP',
        database: 'CONNECTED',
        timestamp: new Date(),
        message: 'Sistema de Bar operando normalmente 🍺'
      });

    } catch (error) {
      // Log do erro real no servidor para debug (não enviar isso ao cliente por segurança)
      console.error("❌ ERRO CRÍTICO: Falha de conexão com o Banco de Dados:", error);

      // Retorna 503 (Service Unavailable). 
      // Isso avisa balanceadores de carga ou Docker que este container NÃO está pronto.
      return res.status(503).json({
        status: 'DOWN',
        database: 'DISCONNECTED',
        timestamp: new Date(),
        message: 'A API está online, mas o Banco de Dados está inacessível.'
      });
    }
  }
}