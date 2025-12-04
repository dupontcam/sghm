const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function criarUsuarioAdmin() {
    try {
        console.log('🔧 Criando usuário administrador...');

        // Hash da senha
        const senhaHash = await bcrypt.hash('admin123', 10);

        // Criar usuário
        const usuario = await prisma.usuarios.create({
            data: {
                nome_completo: 'Administrador',
                email: 'admin@sghm.com',
                senha: senhaHash,
                role: 'ADMIN',
                telefone: '(11) 99999-9999'
            }
        });

        console.log('✅ Usuário criado com sucesso!');
        console.log('📧 Email:', usuario.email);
        console.log('🔑 Senha: admin123');
        console.log('👤 Nome:', usuario.nome_completo);
        console.log('🎭 Role:', usuario.role);

    } catch (error) {
        if (error.code === 'P2002') {
            console.log('⚠️  Usuário já existe!');
            console.log('📧 Email: admin@sghm.com');
            console.log('🔑 Senha: admin123');
        } else {
            console.error('❌ Erro ao criar usuário:', error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

criarUsuarioAdmin();
