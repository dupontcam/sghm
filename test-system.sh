#!/bin/bash

# ========================================
# SGHM - Script de Teste Completo
# ========================================

echo ""
echo "===================================="
echo "   SGHM - TESTES COMPLETOS"
echo "===================================="
echo ""

# Verificar Node.js
echo "[1/8] Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "[ERRO] Node.js não encontrado! Instale em: https://nodejs.org"
    exit 1
fi
echo "[OK] Node.js instalado: $(node --version)"
echo ""

# Verificar npm
echo "[2/8] Verificando npm..."
if ! command -v npm &> /dev/null; then
    echo "[ERRO] npm não encontrado!"
    exit 1
fi
echo "[OK] npm instalado: $(npm --version)"
echo ""

# Verificar Docker (opcional)
echo "[3/8] Verificando Docker (opcional)..."
if ! command -v docker &> /dev/null; then
    echo "[AVISO] Docker não encontrado (opcional para PostgreSQL local)"
else
    echo "[OK] Docker instalado: $(docker --version)"
fi
echo ""

# Verificar arquivos .env
echo "[4/8] Verificando arquivos .env..."
if [ ! -f ".env" ]; then
    echo "[AVISO] Arquivo .env não encontrado no frontend"
    echo "[AÇÃO] Copiando de .env.example..."
    cp .env.example .env
else
    echo "[OK] Frontend .env encontrado"
fi

if [ ! -f "backend/.env" ]; then
    echo "[AVISO] Arquivo backend/.env não encontrado"
    echo "[AÇÃO] Copiando de backend/.env.example..."
    cp backend/.env.example backend/.env
else
    echo "[OK] Backend .env encontrado"
fi
echo ""

# Verificar dependências do frontend
echo "[5/8] Verificando dependências do frontend..."
if [ ! -d "node_modules" ]; then
    echo "[AVISO] node_modules não encontrado"
    echo "[AÇÃO] Instalando dependências..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERRO] Falha ao instalar dependências do frontend"
        exit 1
    fi
else
    echo "[OK] Dependências do frontend instaladas"
fi
echo ""

# Verificar dependências do backend
echo "[6/8] Verificando dependências do backend..."
if [ ! -d "backend/node_modules" ]; then
    echo "[AVISO] backend/node_modules não encontrado"
    echo "[AÇÃO] Instalando dependências do backend..."
    cd backend
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERRO] Falha ao instalar dependências do backend"
        cd ..
        exit 1
    fi
    cd ..
else
    echo "[OK] Dependências do backend instaladas"
fi
echo ""

# Verificar compilação TypeScript
echo "[7/8] Verificando compilação TypeScript..."
npm run build > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "[ERRO] Falha na compilação TypeScript"
    echo "[AÇÃO] Execute 'npm run build' para ver detalhes"
    exit 1
else
    echo "[OK] Projeto compila sem erros"
fi
echo ""

# Testar sintaxe do backend
echo "[8/8] Verificando sintaxe do backend..."
node -c backend/server.js > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "[ERRO] Erro de sintaxe em backend/server.js"
    exit 1
fi

node -c backend/middleware/validators.js > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "[ERRO] Erro de sintaxe em backend/middleware/validators.js"
    exit 1
fi
echo "[OK] Backend sem erros de sintaxe"
echo ""

# Resumo
echo "===================================="
echo "       RESUMO DOS TESTES"
echo "===================================="
echo "[OK] Node.js e npm instalados"
echo "[OK] Dependências instaladas"
echo "[OK] Arquivos .env configurados"
echo "[OK] TypeScript compila sem erros"
echo "[OK] Backend sem erros de sintaxe"
echo "===================================="
echo ""
echo "PRÓXIMOS PASSOS:"
echo ""
echo "1. Iniciar PostgreSQL:"
echo "   docker-compose up -d"
echo ""
echo "2. Configurar banco de dados:"
echo "   cd backend"
echo "   npx prisma migrate dev"
echo "   npx prisma db seed"
echo "   cd .."
echo ""
echo "3. Iniciar backend:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "4. Iniciar frontend (em outro terminal):"
echo "   npm start"
echo ""
echo "5. Acessar aplicação:"
echo "   http://localhost:3000"
echo ""
echo "===================================="
