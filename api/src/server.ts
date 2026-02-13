import app from './app';
import { db } from '@autobier/db';
import { sql } from 'drizzle-orm';

const PORT = Number(process.env.PORT) || 3333;
const HOST = '0.0.0.0'; 

async function startServer() {
  try {
    console.log('⏳ Tentando conectar ao banco de dados...');
    
    // Teste de conexão simples
    await db.execute(sql`SELECT 1`);
    
    console.log('✅ Conexão com o Banco de Dados estabelecida com sucesso!');

    // Adicionamos o HOST aqui como segundo argumento
    app.listen(PORT, HOST, () => {
      console.log(`\n🔥 Server is running!`);
      console.log(`   📡 Local:    http://localhost:${PORT}`);
      console.log(`   🌐 Network:  http://${HOST}:${PORT} (Acessível via Tailscale)`);
    });

  } catch (error) {
    console.error('❌ Erro fatal: Não foi possível conectar ao banco de dados.');
    console.error(error);
    process.exit(1);
  }
}

// Em node-postgres/drizzle, o pool gerencia conexões.
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  process.exit(0);
});

startServer();