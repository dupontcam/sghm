const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('admin', 12);
    const operatorPassword = await bcrypt.hash('operador', 12);

    // Admin
    try {
        const admin = await prisma.usuarios.upsert({
            where: { email: 'admin@sghm.com' },
            update: {
                senha: password,
                nome_completo: 'Admin Teste',
                role: 'ADMIN'
            },
            create: {
                email: 'admin@sghm.com',
                nome_completo: 'Admin Teste',
                senha: password,
                role: 'ADMIN'
            },
        });
        console.log('✅ Admin user upserted:', admin.email);
    } catch (e) {
        console.error('Error handling admin:', e);
    }

    // Operator
    try {
        const operator = await prisma.usuarios.upsert({
            where: { email: 'operador@sghm.com' },
            update: {
                senha: operatorPassword,
                nome_completo: 'Operador Teste',
                role: 'OPERADOR'
            },
            create: {
                email: 'operador@sghm.com',
                nome_completo: 'Operador Teste',
                senha: operatorPassword,
                role: 'OPERADOR'
            },
        });
        console.log('✅ Operator user upserted:', operator.email);
    } catch (e) {
        console.error('Error handling operator:', e);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
