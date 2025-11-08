// Teste direto da conexão Prisma
const { PrismaClient } = require('@prisma/client');

async function testPrismaConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testando conexão direta com Prisma...');
    
    // Testar conexão básica
    await prisma.$connect();
    console.log('✅ Conexão Prisma estabelecida');
    
    // Testar consulta na tabela honorarios
    console.log('🔍 Testando consulta na tabela honorarios...');
    const count = await prisma.honorarios.count();
    console.log(`✅ Total de honorários encontrados: ${count}`);
    
    // Testar busca de alguns registros
    console.log('🔍 Buscando primeiros registros...');
    const honorarios = await prisma.honorarios.findMany({
      take: 3,
      include: {
        consulta: {
          include: {
            medico: true,
            paciente: true
          }
        },
        plano_saude: true
      }
    });
    
    console.log(`✅ Encontrados ${honorarios.length} registros com relacionamentos`);
    
    if (honorarios.length > 0) {
      const primeiro = honorarios[0];
      console.log(`📋 Exemplo: Consulta ${primeiro.consulta_id} - R$ ${primeiro.valor_consulta} - Status: ${primeiro.status_pagamento}`);
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão Prisma:', error.message);
    console.error('❌ Stack completo:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexão Prisma fechada');
  }
}

testPrismaConnection();