// Script para criar usuário administrador inicial
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function criarAdminInicial() {
  try {
    console.log('🔧 Criando usuário administrador inicial...');

    // Verificar se já existe um admin
    const adminExistente = await prisma.usuarios.findFirst({
      where: { role: 'ADMIN' }
    });

    if (adminExistente) {
      console.log('✅ Já existe um usuário administrador:');
      console.log(`   Email: ${adminExistente.email}`);
      console.log(`   Nome: ${adminExistente.nome_completo}`);
      return;
    }

    // Criar senha hash
    const senhaPlana = 'admin123';
    const senhaHash = await bcrypt.hash(senhaPlana, 12);

    // Criar usuário admin
    const admin = await prisma.usuarios.create({
      data: {
        email: 'admin@sghm.com',
        senha: senhaHash,
        nome_completo: 'Administrador SGHM',
        role: 'ADMIN',
        cpf: '000.000.000-00',
        telefone: '(00) 00000-0000'
      }
    });

    console.log('✅ Usuário administrador criado com sucesso!');
    console.log('');
    console.log('📧 Credenciais de acesso:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Senha: ${senhaPlana}`);
    console.log('');
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');

  } catch (error) {
    console.error('❌ Erro ao criar usuário administrador:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

criarAdminInicial();
