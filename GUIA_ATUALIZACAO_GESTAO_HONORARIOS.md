/**
 * GUIA DE ATUALIZAÇÃO: GestaoHonorarios.tsx
 * Fase 1, Item 1.4 - Substituir localStorage por chamadas à API
 */

## Função 1: handleConfirmarRecurso (linhas 107-152)

### REMOVER (linhas 113-147):
```typescript
const honorarioAtualizado: Honorario = {
  ...honorarioSelecionado,
  recursoEnviado: true,
  statusRecurso: 'PENDENTE',
  dataRecurso: recursoData.dataRecurso,
  motivoRecurso: recursoData.motivoRecurso,
  updatedAt: new Date().toISOString()
};

// Salvar no localStorage também (backup caso backend não suporte ainda)
const recursosStorage = localStorage.getItem('sghm_recursos');
const recursos = recursosStorage ? JSON.parse(recursosStorage) : {};
recursos[honorarioSelecionado.id] = {
  recursoEnviado: true,
  statusRecurso: 'PENDENTE',
  dataRecurso: recursoData.dataRecurso,
  motivoRecurso: recursoData.motivoRecurso
};
localStorage.setItem('sghm_recursos', JSON.stringify(recursos));

// Buscar valorGlosa atualizado do honorário
const honorarioAtual = honorarios.find(h => h.id === honorarioSelecionado.id);
adicionarHistorico(
  honorarioSelecionado.id,
  'RECURSO_ENVIADO',
  `Recurso enviado contra glosa de R$ ${(honorarioAtual?.valorGlosa || 0).toFixed(2)}`,
  {
    detalhes: recursoData.motivoRecurso
  }
);

// Disparar evento para notificar DataContext
window.dispatchEvent(new Event('sghm_recursos_updated'));

await updateHonorario(honorarioAtualizado);
```

### SUBSTITUIR POR:
```typescript
try {
  // Chamar API para enviar recurso
  await honorariosAPI.enviarRecurso(honorarioSelecionado.id, {
    motivo_recurso: recursoData.motivoRecurso,
    data_recurso: recursoData.dataRecurso
  });

  // Atualizar lista de honorários
  await refreshHonorarios();

  setIsRecursoModalOpen(false);
  setRecursoData({ motivoRecurso: '', dataRecurso: '' });
  setHonorarioSelecionado(null);

  alert('Recurso enviado com sucesso!');
} catch (error) {
  console.error('Erro ao enviar recurso:', error);
  alert('Erro ao enviar recurso. Tente novamente.');
}
```

---

## Função 2: handleConfirmarStatusRecurso (linhas 163-210)

### REMOVER (linhas 166-207):
```typescript
const valorRecuperado = statusRecursoData.statusRecurso === 'ACEITO_PARCIAL' ? statusRecursoData.valorRecuperado : 
                        statusRecursoData.statusRecurso === 'ACEITO_TOTAL' ? honorarioSelecionado.valor : 0;

const honorarioAtualizado: Honorario = {
  ...honorarioSelecionado,
  statusRecurso: statusRecursoData.statusRecurso,
  valorRecuperado: valorRecuperado,
  updatedAt: new Date().toISOString()
};

// Salvar no localStorage também (backup caso backend não suporte ainda)
const recursosStorage = localStorage.getItem('sghm_recursos');
const recursos = recursosStorage ? JSON.parse(recursosStorage) : {};
recursos[honorarioSelecionado.id] = {
  ...recursos[honorarioSelecionado.id],
  statusRecurso: statusRecursoData.statusRecurso,
  valorRecuperado: valorRecuperado
};
localStorage.setItem('sghm_recursos', JSON.stringify(recursos));

// Registrar no histórico
let descricaoStatus = '';
let detalhesStatus = '';
const honorarioAtual = honorarios.find(h => h.id === honorarioSelecionado.id);
if (statusRecursoData.statusRecurso === 'ACEITO_TOTAL') {
  descricaoStatus = 'Recurso aceito integralmente';
  detalhesStatus = `Valor integral de R$ ${honorarioSelecionado.valor.toFixed(2)} recuperado`;
} else if (statusRecursoData.statusRecurso === 'ACEITO_PARCIAL') {
  descricaoStatus = 'Recurso parcialmente aceito';
  detalhesStatus = `Valor recuperado: R$ ${valorRecuperado.toFixed(2)} de R$ ${honorarioSelecionado.valor.toFixed(2)}`;
} else {
  descricaoStatus = 'Recurso negado';
  detalhesStatus = `Glosa mantida. Perda de R$ ${(honorarioAtual?.valorGlosa || 0).toFixed(2)}`;
}
adicionarHistorico(
  honorarioSelecionado.id,
  'RECURSO_RESPONDIDO',
  descricaoStatus,
  {
    statusNovo: statusRecursoData.statusRecurso,
    detalhes: detalhesStatus
  }
);

// Disparar evento para notificar DataContext
window.dispatchEvent(new Event('sghm_recursos_updated'));

await updateHonorario(honorarioAtualizado);
```

### SUBSTITUIR POR:
```typescript
const valorRecuperado = statusRecursoData.statusRecurso === 'ACEITO_PARCIAL' ? statusRecursoData.valorRecuperado : 
                        statusRecursoData.statusRecurso === 'ACEITO_TOTAL' ? honorarioSelecionado.valor : 0;

try {
  // Chamar API para atualizar status do recurso
  await honorariosAPI.atualizarStatusRecurso(honorarioSelecionado.id, {
    status_recurso: statusRecursoData.statusRecurso,
    valor_recuperado: valorRecuperado
  });

  // Atualizar lista de honorários
  await refreshHonorarios();

  setIsStatusRecursoModalOpen(false);
  setStatusRecursoData({ statusRecurso: 'ACEITO_TOTAL', valorRecuperado: 0 });
  setHonorarioSelecionado(null);

  alert('Status do recurso atualizado com sucesso!');
} catch (error) {
  console.error('Erro ao atualizar status do recurso:', error);
  alert('Erro ao atualizar status do recurso. Tente novamente.');
}
```

---

## Resumo das Mudanças

**handleConfirmarRecurso:**
- ❌ Remove: criação manual de honorarioAtualizado
- ❌ Remove: localStorage.getItem/setItem
- ❌ Remove: adicionarHistorico manual
- ❌ Remove: window.dispatchEvent
- ❌ Remove: updateHonorario
- ✅ Adiciona: honorariosAPI.enviarRecurso()
- ✅ Adiciona: refreshHonorarios()
- ✅ Adiciona: try/catch para tratamento de erros

**handleConfirmarStatusRecurso:**
- ✅ Mantém: cálculo de valorRecuperado
- ❌ Remove: criação manual de honorarioAtualizado
- ❌ Remove: localStorage.getItem/setItem
- ❌ Remove: adicionarHistorico manual (com lógica de descrição)
- ❌ Remove: window.dispatchEvent
- ❌ Remove: updateHonorario
- ✅ Adiciona: honorariosAPI.atualizarStatusRecurso()
- ✅ Adiciona: refreshHonorarios()
- ✅ Adiciona: try/catch para tratamento de erros

**Benefícios:**
- Código mais simples e limpo
- Histórico gerenciado automaticamente pelo backend
- Sem duplicação de dados (localStorage vs backend)
- Melhor tratamento de erros
- Dados sempre sincronizados
