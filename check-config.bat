@echo off
REM Script de Verificação de Configuração de Ambiente (Windows)
REM Sistema SGHM - Preparação para Deploy

echo ==========================================
echo SGHM - Verificacao de Configuracao
echo ==========================================
echo.

echo 1. Verificando Arquivos de Ambiente...
echo ----------------------------------------
if exist .env (
    echo [OK] .env encontrado
) else (
    echo [ERRO] .env NAO ENCONTRADO
)

if exist .env.example (
    echo [OK] .env.example encontrado
) else (
    echo [ERRO] .env.example NAO ENCONTRADO
)

if exist backend\.env (
    echo [OK] backend\.env encontrado
) else (
    echo [ERRO] backend\.env NAO ENCONTRADO
)

if exist backend\.env.example (
    echo [OK] backend\.env.example encontrado
) else (
    echo [ERRO] backend\.env.example NAO ENCONTRADO
)

if exist .gitignore (
    echo [OK] .gitignore encontrado
) else (
    echo [ERRO] .gitignore NAO ENCONTRADO
)
echo.

echo 2. Verificando Configuracoes Frontend (.env)...
echo ----------------------------------------
if exist .env (
    findstr "REACT_APP_API_URL" .env >nul
    if %errorlevel% equ 0 (
        echo [OK] REACT_APP_API_URL configurado
    ) else (
        echo [ERRO] REACT_APP_API_URL nao configurado
    )
)
echo.

echo 3. Verificando Configuracoes Backend (backend\.env)...
echo ----------------------------------------
if exist backend\.env (
    findstr "DATABASE_URL" backend\.env >nul
    if %errorlevel% equ 0 (
        echo [OK] DATABASE_URL configurado
    ) else (
        echo [ERRO] DATABASE_URL nao configurado
    )
    
    findstr "JWT_SECRET" backend\.env >nul
    if %errorlevel% equ 0 (
        echo [OK] JWT_SECRET configurado
    ) else (
        echo [ERRO] JWT_SECRET nao configurado
    )
    
    findstr "JWT_REFRESH_SECRET" backend\.env >nul
    if %errorlevel% equ 0 (
        echo [OK] JWT_REFRESH_SECRET configurado
    ) else (
        echo [ERRO] JWT_REFRESH_SECRET nao configurado
    )
    
    findstr "PORT" backend\.env >nul
    if %errorlevel% equ 0 (
        echo [OK] PORT configurado
    ) else (
        echo [ERRO] PORT nao configurado
    )
    
    findstr "NODE_ENV" backend\.env >nul
    if %errorlevel% equ 0 (
        echo [OK] NODE_ENV configurado
    ) else (
        echo [ERRO] NODE_ENV nao configurado
    )
)
echo.

echo 4. Verificando .gitignore...
echo ----------------------------------------
if exist .gitignore (
    findstr ".env" .gitignore >nul
    if %errorlevel% equ 0 (
        echo [OK] .env esta no .gitignore
    ) else (
        echo [AVISO] .env NAO esta no .gitignore (PERIGO!)
    )
    
    findstr "backend/.env" .gitignore >nul
    if %errorlevel% equ 0 (
        echo [OK] backend/.env esta no .gitignore
    ) else (
        echo [AVISO] backend/.env pode nao estar no .gitignore
    )
)
echo.

echo 5. Verificando Dependencias...
echo ----------------------------------------
if exist package.json (
    echo [OK] package.json (frontend) encontrado
)

if exist backend\package.json (
    echo [OK] backend\package.json encontrado
)
echo.

echo 6. Verificando Prisma...
echo ----------------------------------------
if exist backend\prisma\schema.prisma (
    echo [OK] schema.prisma encontrado
)

if exist backend\prisma\migrations (
    echo [OK] Pasta migrations encontrada
)
echo.

echo ==========================================
echo RESUMO DA VERIFICACAO
echo ==========================================
echo.
echo Status: Configuracao verificada!
echo.
echo Proximos Passos:
echo 1. Instalar dependencias: npm install ^&^& cd backend ^&^& npm install
echo 2. Subir PostgreSQL: cd backend ^&^& docker-compose up -d
echo 3. Aplicar migrations: cd backend ^&^& npx prisma migrate deploy
echo 4. Iniciar backend: cd backend ^&^& npm run dev
echo 5. Iniciar frontend: npm start
echo.
echo Para deploy em producao:
echo - Atualizar .env com URLs de producao
echo - Gerar JWT secrets seguros (32+ caracteres)
echo - Configurar DATABASE_URL do Neon
echo.

pause
