@echo off
REM ========================================
REM SGHM - Script de Teste Completo
REM ========================================

echo.
echo ====================================
echo    SGHM - TESTES COMPLETOS
echo ====================================
echo.

REM Verificar Node.js
echo [1/8] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado! Instale em: https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js instalado
echo.

REM Verificar npm
echo [2/8] Verificando npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] npm nao encontrado!
    pause
    exit /b 1
)
echo [OK] npm instalado
echo.

REM Verificar Docker (opcional)
echo [3/8] Verificando Docker (opcional)...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [AVISO] Docker nao encontrado (opcional para PostgreSQL local)
) else (
    echo [OK] Docker instalado
)
echo.

REM Verificar arquivos .env
echo [4/8] Verificando arquivos .env...
if not exist ".env" (
    echo [AVISO] Arquivo .env nao encontrado no frontend
    echo [ACAO] Copiando de .env.example...
    copy .env.example .env >nul 2>&1
) else (
    echo [OK] Frontend .env encontrado
)

if not exist "backend\.env" (
    echo [AVISO] Arquivo backend\.env nao encontrado
    echo [ACAO] Copiando de backend\.env.example...
    copy backend\.env.example backend\.env >nul 2>&1
) else (
    echo [OK] Backend .env encontrado
)
echo.

REM Verificar dependências do frontend
echo [5/8] Verificando dependencias do frontend...
if not exist "node_modules" (
    echo [AVISO] node_modules nao encontrado
    echo [ACAO] Instalando dependencias...
    call npm install
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependencias do frontend
        pause
        exit /b 1
    )
) else (
    echo [OK] Dependencias do frontend instaladas
)
echo.

REM Verificar dependências do backend
echo [6/8] Verificando dependencias do backend...
if not exist "backend\node_modules" (
    echo [AVISO] backend\node_modules nao encontrado
    echo [ACAO] Instalando dependencias do backend...
    cd backend
    call npm install
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependencias do backend
        cd ..
        pause
        exit /b 1
    )
    cd ..
) else (
    echo [OK] Dependencias do backend instaladas
)
echo.

REM Verificar compilação TypeScript
echo [7/8] Verificando compilacao TypeScript...
call npm run build >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Falha na compilacao TypeScript
    echo [ACAO] Execute 'npm run build' para ver detalhes
    pause
    exit /b 1
) else (
    echo [OK] Projeto compila sem erros
)
echo.

REM Testar sintaxe do backend
echo [8/8] Verificando sintaxe do backend...
node -c backend\server.js >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Erro de sintaxe em backend\server.js
    pause
    exit /b 1
)

node -c backend\middleware\validators.js >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Erro de sintaxe em backend\middleware\validators.js
    pause
    exit /b 1
)
echo [OK] Backend sem erros de sintaxe
echo.

REM Resumo
echo ====================================
echo        RESUMO DOS TESTES
echo ====================================
echo [OK] Node.js e npm instalados
echo [OK] Dependencias instaladas
echo [OK] Arquivos .env configurados
echo [OK] TypeScript compila sem erros
echo [OK] Backend sem erros de sintaxe
echo ====================================
echo.
echo PROXIMOS PASSOS:
echo.
echo 1. Iniciar PostgreSQL:
echo    docker-compose up -d
echo.
echo 2. Configurar banco de dados:
echo    cd backend
echo    npx prisma migrate dev
echo    npx prisma db seed
echo    cd ..
echo.
echo 3. Iniciar backend:
echo    cd backend
echo    npm run dev
echo.
echo 4. Iniciar frontend (em outro terminal):
echo    npm start
echo.
echo 5. Acessar aplicacao:
echo    http://localhost:3000
echo.
echo ====================================

pause
