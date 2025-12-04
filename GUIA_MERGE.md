# 🔀 GUIA DE MERGE: production-integration → feature/e2e-tests

## 📋 Situação Atual

**Branch atual:** `feature/e2e-tests`  
**Branch com Fase 1 completa:** `production-integration`  
**Objetivo:** Trazer todas as mudanças da Fase 1 para a branch atual

---

## ⚠️ IMPORTANTE: Backup Primeiro!

Antes de fazer o merge, vamos garantir que você não perca nada:

```bash
# 1. Commit qualquer mudança não salva
git add .
git commit -m "backup: salvando estado atual antes do merge"

# 2. Criar uma branch de backup (caso algo dê errado)
git branch backup-before-merge
```

---

## 🔀 Opção 1: Merge Simples (Recomendado)

Se você quer **manter ambas as mudanças** (e2e-tests + Fase 1):

```bash
# 1. Certifique-se de estar na branch correta
git checkout feature/e2e-tests

# 2. Fazer merge da production-integration
git merge production-integration

# 3. Se houver conflitos, resolva-os manualmente
# Git vai mostrar quais arquivos têm conflitos

# 4. Após resolver conflitos (se houver):
git add .
git commit -m "merge: integra Fase 1 (production-integration) com e2e-tests"
```

---

## 🔀 Opção 2: Rebase (Mais Limpo)

Se você quer um histórico mais linear:

```bash
# 1. Certifique-se de estar na branch correta
git checkout feature/e2e-tests

# 2. Fazer rebase sobre production-integration
git rebase production-integration

# 3. Se houver conflitos, resolva um por um:
git add <arquivo-resolvido>
git rebase --continue

# 4. Se quiser cancelar o rebase:
git rebase --abort
```

---

## 🔀 Opção 3: Substituir Completamente (Descartar e2e-tests)

Se você quer **descartar** as mudanças de e2e-tests e usar **apenas** production-integration:

```bash
# 1. Fazer backup primeiro!
git branch backup-e2e-tests

# 2. Resetar para production-integration
git checkout feature/e2e-tests
git reset --hard production-integration

# 3. Forçar push (se já tiver feito push antes)
git push --force origin feature/e2e-tests
```

---

## 🔀 Opção 4: Criar Nova Branch com Ambas (Mais Seguro)

Se você quer testar o merge sem afetar as branches existentes:

```bash
# 1. Criar nova branch a partir de production-integration
git checkout production-integration
git checkout -b integration-with-e2e-tests

# 2. Fazer merge de e2e-tests
git merge feature/e2e-tests

# 3. Resolver conflitos se houver
git add .
git commit -m "merge: combina production-integration com e2e-tests"

# 4. Testar tudo
# Se funcionar, você pode deletar as branches antigas e renomear esta
```

---

## 🛠️ Resolvendo Conflitos

Se aparecer conflitos durante o merge, você verá algo assim:

```
Auto-merging src/services/api.ts
CONFLICT (content): Merge conflict in src/services/api.ts
Automatic merge failed; fix conflicts and then commit the result.
```

### Como Resolver:

1. **Abra o arquivo com conflito** no VS Code
2. **Procure por marcadores de conflito:**
   ```
   <<<<<<< HEAD
   // Seu código atual (e2e-tests)
   =======
   // Código de production-integration
   >>>>>>> production-integration
   ```
3. **Escolha qual versão manter** (ou combine ambas)
4. **Remova os marcadores** (`<<<<<<<`, `=======`, `>>>>>>>`)
5. **Salve o arquivo**
6. **Marque como resolvido:**
   ```bash
   git add <arquivo-resolvido>
   ```
7. **Continue o merge:**
   ```bash
   git commit -m "merge: resolve conflitos"
   ```

---

## 📊 Verificar Diferenças Antes do Merge

Para ver o que vai mudar:

```bash
# Ver lista de arquivos diferentes
git diff --name-only feature/e2e-tests production-integration

# Ver diferenças detalhadas
git diff feature/e2e-tests production-integration

# Ver commits que serão trazidos
git log feature/e2e-tests..production-integration --oneline
```

---

## ✅ Após o Merge

1. **Verificar se tudo compilou:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Verificar se frontend funciona:**
   ```bash
   cd ..
   npm start
   ```

3. **Rodar testes (se houver):**
   ```bash
   npm test
   ```

4. **Fazer push:**
   ```bash
   git push origin feature/e2e-tests
   ```

---

## 🆘 Se Algo Der Errado

### Cancelar merge em andamento:
```bash
git merge --abort
```

### Voltar ao estado anterior:
```bash
git reset --hard HEAD~1
```

### Restaurar do backup:
```bash
git checkout backup-before-merge
git branch -D feature/e2e-tests
git branch feature/e2e-tests
```

---

## 💡 Recomendação

**Para o seu caso, recomendo a Opção 1 (Merge Simples):**

```bash
# Passo a passo completo:
cd c:\SGHM\sghm

# 1. Salvar estado atual
git add .
git commit -m "backup: antes do merge com production-integration"

# 2. Criar backup
git branch backup-before-merge

# 3. Fazer merge
git merge production-integration

# 4. Se houver conflitos, resolva e depois:
git add .
git commit -m "merge: integra Fase 1 completa com e2e-tests"

# 5. Verificar
git log --oneline -10
```

---

## 📝 Arquivos que Provavelmente Terão Conflitos

Baseado nas mudanças que vi, estes arquivos podem ter conflitos:

1. `backend/prisma/schema.prisma` ⚠️ IMPORTANTE
2. `backend/routes/honorarios.js` ⚠️ IMPORTANTE
3. `src/services/api.ts` ⚠️ IMPORTANTE
4. `src/contexts/DataContext.tsx` ⚠️ IMPORTANTE
5. `src/components/GestaoHonorarios.tsx` ⚠️ IMPORTANTE

**Para estes arquivos, escolha SEMPRE a versão de `production-integration`** (a que tem a Fase 1 completa).

---

Quer que eu execute o merge para você ou prefere fazer manualmente seguindo este guia?
