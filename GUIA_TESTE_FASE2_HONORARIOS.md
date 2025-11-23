# 🧪 GUIA DE TESTES - FASE 2: Gestão de Honorários com Seleção Múltipla

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Cenários de Teste](#cenários-de-teste)
4. [Validações Esperadas](#validações-esperadas)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

A **Fase 2** implementa funcionalidades avançadas de gestão de honorários médicos, incluindo:
- ✅ Seleção múltipla de honorários
- ✅ Ações em lote (Enviar, Pagar, Glosar)
- ✅ Interface visual moderna com barra de ações dinâmica
- ✅ Modal dedicado para registro de glosas

### Objetivo dos Testes
Validar que todas as operações em lote funcionam corretamente, mantêm a integridade dos dados e fornecem feedback adequado ao usuário.

---

## ✅ Pré-requisitos

### 1. Dados no Banco
```sql
-- Verificar honorários existentes
SELECT COUNT(*) FROM honorarios;
-- Deve retornar: 4 honorários

-- Verificar distribuição por status
SELECT status_pagamento, COUNT(*) 
FROM honorarios 
GROUP BY status_pagamento;
-- Esperado: Todos PENDENTE inicialmente
```

### 2. Servidores Rodando
```bash
# Backend (Terminal 1)
cd C:\SGHM\sghm\backend
node server.js

# Frontend (Terminal 2)
cd C:\SGHM\sghm
npm start
```

### 3. Acesso ao Sistema
- URL: http://localhost:3000
- Login: Use credenciais de administrador
- Navegue até: **Gestão de Honorários**

---

## 🧪 Cenários de Teste

### **TESTE 1: Seleção Individual de Honorários**

#### Objetivo
Validar que o sistema permite selecionar honorários individualmente.

#### Passos
1. Acesse a página "Gestão de Honorários"
2. Localize a tabela de honorários
3. Clique no **checkbox** da primeira linha

#### Resultado Esperado
- ✅ Checkbox marca como selecionado (✓)
- ✅ Barra de ações em lote **aparece** com animação slide-down
- ✅ Contador mostra: **"1 honorário(s) selecionado(s)"**
- ✅ Linha pode ter destaque visual (opcional)

#### Validação Adicional
- Clicar novamente no checkbox **desmarca** o item
- Barra de ações **desaparece** quando nenhum item está selecionado

---

### **TESTE 2: Seleção Múltipla com Checkbox Master**

#### Objetivo
Validar que o checkbox do cabeçalho seleciona/desseleciona todos.

#### Passos
1. Na página de Gestão de Honorários
2. Clique no **checkbox do cabeçalho** (primeira coluna)

#### Resultado Esperado
- ✅ **Todos** os honorários ficam selecionados
- ✅ Contador mostra: **"4 honorário(s) selecionado(s)"** (ou quantidade total)
- ✅ Barra de ações exibe os 3 botões:
  - 📤 Marcar como Enviado
  - ✓ Marcar como Pago  
  - ✖ Registrar Glosa

#### Validação Adicional
- Clicar novamente no checkbox master **desmarca todos**
- Se desmarcar manualmente alguns itens, o checkbox master fica desmarcado

---

### **TESTE 3: Limpar Seleção**

#### Objetivo
Validar o botão "Limpar seleção" na barra de ações.

#### Passos
1. Selecione 2 ou mais honorários
2. Na barra de ações, clique em **"Limpar seleção"**

#### Resultado Esperado
- ✅ Todos os checkboxes ficam desmarcados
- ✅ Barra de ações **desaparece**
- ✅ Contador volta para 0

---

### **TESTE 4: Marcar como ENVIADO (Ação em Lote)**

#### Objetivo
Validar mudança de status PENDENTE → ENVIADO em lote.

#### Pré-condição
- Pelo menos 2 honorários com status **PENDENTE**

#### Passos
1. Selecione 2 honorários com status PENDENTE
2. Clique no botão **"📤 Marcar como Enviado"** (azul)
3. Confirme na caixa de diálogo

#### Resultado Esperado
- ✅ Modal de confirmação aparece: *"Deseja marcar 2 honorário(s) como ENVIADO?"*
- ✅ Após confirmar:
  - Status dos honorários muda para **ENVIADO**
  - Seleção é **limpa automaticamente**
  - Alerta de sucesso: *"Honorários marcados como ENVIADO com sucesso!"*
  - Tabela atualiza visualmente

#### Validação no Backend
```sql
-- Verificar status alterado
SELECT id, status_pagamento 
FROM honorarios 
WHERE status_pagamento = 'ENVIADO';
-- Deve mostrar os 2 honorários atualizados
```

#### Validação Visual
- Ícone muda para 📤 (avião de papel)
- Classe CSS: `.status-enviado`
- Cor: azul/ciano

---

### **TESTE 5: Marcar como PAGO (Ação em Lote)**

#### Objetivo
Validar mudança de status para PAGO em lote.

#### Pré-condição
- Pelo menos 2 honorários com status **ENVIADO** (use Teste 4 antes)

#### Passos
1. Selecione 2 honorários com status ENVIADO
2. Clique no botão **"✓ Marcar como Pago"** (verde)
3. Confirme na caixa de diálogo

#### Resultado Esperado
- ✅ Modal de confirmação aparece
- ✅ Após confirmar:
  - Status muda para **PAGO**
  - Alerta: *"Honorários marcados como PAGO com sucesso!"*
  - Seleção limpa
  - Estatísticas atualizam (card "Pago")

#### Validação de Estatísticas
- Card **"Pago"** deve mostrar o valor total dos honorários pagos
- Card **"Pendente"** deve diminuir proporcionalmente

#### Validação no Backend
```sql
-- Verificar honorários pagos
SELECT id, status_pagamento, valor_consulta 
FROM honorarios 
WHERE status_pagamento = 'PAGO';

-- Verificar total pago
SELECT SUM(valor_consulta) as total_pago 
FROM honorarios 
WHERE status_pagamento = 'PAGO';
```

---

### **TESTE 6: Registrar Glosa (Modal e Ação em Lote)**

#### Objetivo
Validar o fluxo completo de registro de glosa.

#### Pré-condição
- Pelo menos 1 honorário disponível (qualquer status)

#### Passos
1. Selecione 1 ou mais honorários
2. Clique no botão **"✖ Registrar Glosa"** (vermelho)
3. No modal que abre:
   - **Valor da Glosa**: Digite `50.00` (opcional)
   - **Motivo da Glosa**: Digite *"Código do procedimento não autorizado"*
4. Clique em **"✖ Registrar Glosa"**

#### Resultado Esperado - Modal
- ✅ Modal abre com título **"Registrar Glosa"**
- ✅ Mostra contador: *"X honorário(s) selecionado(s)"*
- ✅ Campos disponíveis:
  - Valor da Glosa (número, opcional)
  - Motivo da Glosa (texto obrigatório)
- ✅ Botões: "Cancelar" (cinza) e "Registrar Glosa" (vermelho)

#### Resultado Esperado - Após Salvar
- ✅ Status dos honorários muda para **GLOSADO**
- ✅ Motivo é salvo no campo `motivo`
- ✅ Alerta: *"Glosa registrada com sucesso!"*
- ✅ Modal fecha
- ✅ Seleção limpa
- ✅ Tabela atualiza

#### Validação Visual
- Coluna **"Motivo"** mostra o texto da glosa
- Ícone muda para ✖ (X vermelho)
- Status mostra **"GLOSADO"** em vermelho

#### Validação no Backend
```sql
-- Verificar glosa registrada
SELECT id, status_pagamento, motivo_glosa, valor_glosa 
FROM honorarios 
WHERE status_pagamento = 'GLOSADO';
```

#### Validação de Erro
**Teste:** Tente salvar sem preencher o motivo
- ✅ Alerta: *"Por favor, informe o motivo da glosa."*
- ✅ Modal permanece aberto

---

### **TESTE 7: Cancelar Operação no Modal de Glosa**

#### Objetivo
Validar que cancelar não altera dados.

#### Passos
1. Selecione 1 honorário
2. Clique em "Registrar Glosa"
3. Preencha o motivo: *"Teste de cancelamento"*
4. Clique em **"Cancelar"**

#### Resultado Esperado
- ✅ Modal fecha
- ✅ Honorário **mantém status original**
- ✅ Nenhum dado é alterado
- ✅ Seleção permanece ativa

---

### **TESTE 8: Filtros Combinados com Seleção**

#### Objetivo
Validar que seleção funciona com filtros aplicados.

#### Passos
1. Aplique filtro: **Status = PENDENTE**
2. Use checkbox master para selecionar todos
3. Marque como ENVIADO
4. Remova o filtro

#### Resultado Esperado
- ✅ Apenas honorários PENDENTES são exibidos após filtro
- ✅ Seleção afeta apenas os visíveis
- ✅ Após marcar como ENVIADO, esses honorários **desaparecem** da lista filtrada
- ✅ Ao remover filtro, todos os honorários reaparecem com status correto

---

### **TESTE 9: Responsividade Mobile**

#### Objetivo
Validar layout em telas pequenas.

#### Passos
1. Pressione **F12** no navegador
2. Ative modo responsivo (Ctrl+Shift+M)
3. Selecione dispositivo: **iPhone 12 Pro** (390x844)
4. Selecione alguns honorários

#### Resultado Esperado
- ✅ Barra de ações **empilha verticalmente**
- ✅ Botões ocupam largura total
- ✅ Texto permanece legível
- ✅ Checkboxes mantêm tamanho adequado
- ✅ Tabela tem scroll horizontal se necessário

---

### **TESTE 10: Performance com Múltiplas Seleções**

#### Objetivo
Validar performance ao processar muitos honorários.

#### Pré-condição
- Crie mais honorários de teste (use API ou SQL)

#### Passos
1. Selecione **todos** os honorários (se >10 itens)
2. Marque como ENVIADO
3. Aguarde processamento

#### Resultado Esperado
- ✅ Sistema processa **sequencialmente** (loop for)
- ✅ Pode levar alguns segundos para muitos itens
- ✅ Interface não trava
- ✅ Alerta só aparece após **todos** serem processados
- ✅ Sem erros no console

#### Validação no Console
```javascript
// Abra Console (F12)
// Verifique se há erros durante o processamento
// Deve mostrar apenas logs de sucesso
```

---

## ✅ Validações Esperadas - Checklist Geral

### Interface Visual
- [ ] Barra de ações tem gradiente roxo
- [ ] Animação slide-down ao aparecer
- [ ] Botões têm cores distintas (azul, verde, vermelho)
- [ ] Hover nos botões eleva card (transform: translateY)
- [ ] Checkboxes têm cor roxa (accent-color)
- [ ] Contador atualiza em tempo real

### Funcionalidade
- [ ] Seleção individual funciona
- [ ] Checkbox master seleciona/desseleciona todos
- [ ] Limpar seleção funciona
- [ ] Marcar como ENVIADO atualiza status
- [ ] Marcar como PAGO atualiza status
- [ ] Registrar glosa salva motivo e status
- [ ] Cancelar operações não altera dados
- [ ] Filtros não interferem na seleção

### Integridade de Dados
- [ ] Status só muda após confirmação
- [ ] Backend reflete mudanças (verificar SQL)
- [ ] Estatísticas atualizam corretamente
- [ ] Motivo de glosa é persistido
- [ ] Não há duplicação de registros
- [ ] Transações são atômicas (sucesso ou falha total)

### UX e Feedback
- [ ] Mensagens de confirmação são claras
- [ ] Alertas de sucesso aparecem
- [ ] Erros são tratados com mensagens amigáveis
- [ ] Modal de glosa valida campos obrigatórios
- [ ] Interface responde rapidamente (<1s para operações simples)

---

## 🔧 Troubleshooting

### Problema: Barra de Ações Não Aparece

**Sintomas:**
- Checkboxes funcionam mas barra não exibe

**Solução:**
```tsx
// Verificar em GestaoHonorarios.tsx:
{selecionados.length > 0 && (
  <div className="acoes-lote-bar">
    ...
  </div>
)}
```

**Debug:**
```javascript
// Console:
console.log('Selecionados:', selecionados);
// Deve mostrar array com IDs
```

---

### Problema: Status Não Atualiza

**Sintomas:**
- Clica em "Marcar como Enviado" mas status não muda

**Verificar:**
1. **Backend rodando?**
   ```bash
   # Terminal backend deve mostrar:
   Server running on http://localhost:3001
   ```

2. **API respondendo?**
   ```bash
   # Verificar network no navegador (F12 > Network)
   # Procurar por PUT /api/honorarios/:id
   ```

3. **Função updateHonorario existe?**
   ```typescript
   // Em DataContext.tsx, verificar:
   const updateHonorario = async (honorario: Honorario) => {
     // ... implementação
   }
   ```

---

### Problema: Modal de Glosa Não Valida

**Sintomas:**
- Consegue salvar glosa sem motivo

**Verificar:**
```typescript
// Em handleRegistrarGlosa:
if (!glosaData.motivoGlosa.trim()) {
  alert('Por favor, informe o motivo da glosa.');
  return;
}
```

---

### Problema: Checkbox Master Não Funciona

**Sintomas:**
- Clica mas não seleciona todos

**Debug:**
```typescript
// Verificar se honorariosFiltrados tem dados:
console.log('Filtrados:', honorariosFiltrados.length);

// Verificar handleSelecionarTodos:
const handleSelecionarTodos = () => {
  if (selecionados.length === honorariosFiltrados.length) {
    setSelecionados([]);
  } else {
    setSelecionados(honorariosFiltrados.map(h => h.id));
  }
};
```

---

### Problema: Estilos Não Aplicados

**Sintomas:**
- Barra de ações sem gradiente roxo
- Botões sem cores

**Solução:**
```bash
# Verificar se CSS foi importado:
# Em GestaoHonorarios.tsx:
import './GestaoHonorarios.css';

# Limpar cache do navegador:
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

---

## 📊 Dados de Teste Sugeridos

### Criar Honorários de Teste via SQL
```sql
-- Inserir consultas de teste
INSERT INTO consultas (
  paciente_id, medico_id, data_consulta, 
  tipo_pagamento, valor_bruto, protocolo,
  plano_saude_id, status_pagamento,
  usuario_inclusao_id, usuario_alteracao_id
) VALUES 
  (3, 1, '2025-11-15', 'PLANO_SAUDE', 350.00, 'PROTO-TEST-001', 2, 'PENDENTE', 1, 1),
  (4, 2, '2025-11-16', 'PLANO_SAUDE', 400.00, 'PROTO-TEST-002', 3, 'PENDENTE', 1, 1),
  (5, 3, '2025-11-17', 'PLANO_SAUDE', 550.00, 'PROTO-TEST-003', 4, 'PENDENTE', 1, 1);

-- Criar honorários automaticamente (via trigger ou script)
-- Ou usar a interface para criar consultas com convênio
```

---

## ✅ Critérios de Sucesso - Fase 2

A Fase 2 é considerada **APROVADA** quando:

1. ✅ Todos os 10 cenários de teste passam sem erros
2. ✅ Checklist de validações 100% completo
3. ✅ Nenhum erro no console do navegador
4. ✅ Nenhum erro no console do backend
5. ✅ Dados no banco refletem mudanças corretamente
6. ✅ Interface responsiva funciona em mobile
7. ✅ Feedback ao usuário é claro e imediato

---

## 📝 Relatório de Testes (Template)

```markdown
# Relatório de Testes - Fase 2: Gestão de Honorários

**Data:** _____/_____/_____
**Testador:** _____________________
**Ambiente:** Desenvolvimento / Produção
**Branch:** production-integration

## Resultados

| # | Cenário | Status | Observações |
|---|---------|--------|-------------|
| 1 | Seleção Individual | ✅ / ❌ |  |
| 2 | Checkbox Master | ✅ / ❌ |  |
| 3 | Limpar Seleção | ✅ / ❌ |  |
| 4 | Marcar como Enviado | ✅ / ❌ |  |
| 5 | Marcar como Pago | ✅ / ❌ |  |
| 6 | Registrar Glosa | ✅ / ❌ |  |
| 7 | Cancelar Modal | ✅ / ❌ |  |
| 8 | Filtros + Seleção | ✅ / ❌ |  |
| 9 | Responsividade | ✅ / ❌ |  |
| 10 | Performance | ✅ / ❌ |  |

**Taxa de Sucesso:** ____/10 (____%)

## Bugs Encontrados
1. 
2. 

## Sugestões de Melhoria
1. 
2. 

## Conclusão
[ ] APROVADO - Sistema pronto para produção
[ ] APROVADO COM RESSALVAS - Pequenos ajustes necessários
[ ] REPROVADO - Bugs críticos encontrados
```

---

## 🎓 Dicas para Testadores

1. **Teste Incremental:** Comece pelos testes simples (1-3) antes dos complexos
2. **Limpe o Estado:** Entre testes, recarregue a página (F5) para garantir estado limpo
3. **Verifique o Backend:** Sempre confirme mudanças no banco de dados
4. **Use DevTools:** Console (F12) e Network tab são seus amigos
5. **Teste Casos Extremos:** Tente selecionar 0 itens, todos os itens, apenas 1 item
6. **Valide Mensagens:** Leia todos os alertas e confirmações
7. **Documente Bugs:** Anote passos para reproduzir problemas encontrados

---

## 📚 Referências

- **Código Fonte:** `src/components/GestaoHonorarios.tsx`
- **Estilos:** `src/components/GestaoHonorarios.css`
- **API Backend:** `backend/routes/honorarios.js`
- **Contexto:** `src/contexts/DataContext.tsx`

---

**Versão:** 1.0  
**Última Atualização:** 23/11/2025  
**Responsável:** Equipe de Desenvolvimento SGHM
