#!/bin/bash
# Script de Verificação de Configuração de Ambiente
# Sistema SGHM - Preparação para Deploy

echo "=========================================="
echo "SGHM - Verificação de Configuração"
echo "=========================================="
echo ""

# Cores para output (compatível com Windows)
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
NC="\033[0m" # No Color

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 encontrado"
        return 0
    else
        echo -e "${RED}✗${NC} $1 NÃO ENCONTRADO"
        return 1
    fi
}

echo "1. Verificando Arquivos de Ambiente..."
echo "----------------------------------------"
check_file ".env"
check_file ".env.example"
check_file "backend/.env"
check_file "backend/.env.example"
check_file ".gitignore"
echo ""

echo "2. Verificando Configurações Frontend (.env)..."
echo "----------------------------------------"
if [ -f ".env" ]; then
    if grep -q "REACT_APP_API_URL" .env; then
        API_URL=$(grep "REACT_APP_API_URL" .env | cut -d '=' -f2)
        echo -e "${GREEN}✓${NC} REACT_APP_API_URL configurado: $API_URL"
    else
        echo -e "${RED}✗${NC} REACT_APP_API_URL não configurado"
    fi
fi
echo ""

echo "3. Verificando Configurações Backend (backend/.env)..."
echo "----------------------------------------"
if [ -f "backend/.env" ]; then
    # Database URL
    if grep -q "DATABASE_URL" backend/.env; then
        echo -e "${GREEN}✓${NC} DATABASE_URL configurado"
    else
        echo -e "${RED}✗${NC} DATABASE_URL não configurado"
    fi
    
    # JWT Secret
    if grep -q "JWT_SECRET" backend/.env; then
        JWT_LEN=$(grep "JWT_SECRET" backend/.env | cut -d '=' -f2 | tr -d '"' | wc -c)
        if [ $JWT_LEN -ge 32 ]; then
            echo -e "${GREEN}✓${NC} JWT_SECRET configurado (${JWT_LEN} caracteres)"
        else
            echo -e "${YELLOW}⚠${NC} JWT_SECRET muito curto (${JWT_LEN} caracteres, recomendado 32+)"
        fi
    else
        echo -e "${RED}✗${NC} JWT_SECRET não configurado"
    fi
    
    # JWT Refresh Secret
    if grep -q "JWT_REFRESH_SECRET" backend/.env; then
        echo -e "${GREEN}✓${NC} JWT_REFRESH_SECRET configurado"
    else
        echo -e "${RED}✗${NC} JWT_REFRESH_SECRET não configurado"
    fi
    
    # Port
    if grep -q "PORT" backend/.env; then
        PORT=$(grep "PORT" backend/.env | cut -d '=' -f2)
        echo -e "${GREEN}✓${NC} PORT configurado: $PORT"
    else
        echo -e "${RED}✗${NC} PORT não configurado"
    fi
    
    # Node Environment
    if grep -q "NODE_ENV" backend/.env; then
        NODE_ENV=$(grep "NODE_ENV" backend/.env | cut -d '=' -f2)
        echo -e "${GREEN}✓${NC} NODE_ENV configurado: $NODE_ENV"
    else
        echo -e "${RED}✗${NC} NODE_ENV não configurado"
    fi
fi
echo ""

echo "4. Verificando .gitignore..."
echo "----------------------------------------"
if [ -f ".gitignore" ]; then
    if grep -q ".env" .gitignore; then
        echo -e "${GREEN}✓${NC} .env está no .gitignore"
    else
        echo -e "${RED}✗${NC} .env NÃO está no .gitignore (PERIGO!)"
    fi
    
    if grep -q "backend/.env" .gitignore; then
        echo -e "${GREEN}✓${NC} backend/.env está no .gitignore"
    else
        echo -e "${YELLOW}⚠${NC} backend/.env não está explicitamente no .gitignore"
    fi
fi
echo ""

echo "5. Verificando Dependências..."
echo "----------------------------------------"
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json (frontend) encontrado"
fi

if [ -f "backend/package.json" ]; then
    echo -e "${GREEN}✓${NC} backend/package.json encontrado"
fi
echo ""

echo "6. Verificando Prisma..."
echo "----------------------------------------"
if [ -f "backend/prisma/schema.prisma" ]; then
    echo -e "${GREEN}✓${NC} schema.prisma encontrado"
fi

if [ -d "backend/prisma/migrations" ]; then
    MIGRATIONS=$(ls -1 backend/prisma/migrations | wc -l)
    echo -e "${GREEN}✓${NC} $MIGRATIONS migrations encontradas"
fi
echo ""

echo "=========================================="
echo "RESUMO DA VERIFICAÇÃO"
echo "=========================================="
echo ""
echo "Status: Configuração verificada!"
echo ""
echo "Próximos Passos:"
echo "1. Instalar dependências: npm install && cd backend && npm install"
echo "2. Subir PostgreSQL: cd backend && docker-compose up -d"
echo "3. Aplicar migrations: cd backend && npx prisma migrate deploy"
echo "4. Iniciar backend: cd backend && npm run dev"
echo "5. Iniciar frontend: npm start"
echo ""
echo "Para deploy em produção:"
echo "- Atualizar .env com URLs de produção"
echo "- Gerar JWT secrets seguros (32+ caracteres)"
echo "- Configurar DATABASE_URL do Neon"
echo ""
