# Processo de Gerenciamento de Honorários Médicos e Controle de Glosas

## 1. Introdução

O gerenciamento de honorários médicos é fundamental para garantir o correto recebimento dos valores devidos pelas operadoras de saúde, bem como o controle eficiente das glosas e recursos. Este documento visa esclarecer o fluxo, responsabilidades e melhores práticas para o controle de honorários e glosas.

---

## 2. Fluxo Geral do Processo

1. **Registro da Consulta**
   - O atendimento é realizado e a consulta/procedimento é registrada no sistema.
   - Informações essenciais: paciente, médico, data, procedimento, valor, convênio/plano.

2. **Envio para a Operadora**
   - O faturamento gera o lote de cobranças e envia para a operadora de saúde.
   - Cada consulta recebe um status inicial: `PENDENTE` ou `ENVIADO`.

3. **Recebimento do Retorno**
   - A operadora devolve o lote com o status de cada cobrança:
     - `PAGO`: valor integral recebido.
     - `GLOSADO`: valor total ou parcial recusado, com motivo da glosa.
     - `PENDENTE`: aguardando análise.

4. **Análise de Glosas**
   - O setor responsável analisa os motivos das glosas.
   - Decide se cabe recurso (contestação) ou se a glosa é definitiva.

5. **Recurso de Glosa**
   - Caso seja possível, é enviado um recurso com documentação e justificativa.
   - O status do recurso pode ser:
     - `PENDENTE`: aguardando resposta.
     - `ACEITO_TOTAL`: valor integral recuperado.
     - `ACEITO_PARCIAL`: parte do valor recuperado.
     - `NEGADO`: recurso não aceito, glosa mantida.

6. **Atualização dos Honorários**
   - O sistema atualiza o status e valores conforme o retorno da operadora.
   - O valor líquido é recalculado considerando glosas e recursos.

7. **Pagamento ao Médico**
   - Após a finalização do processo, o valor líquido é liberado para pagamento ao médico.

---

## 3. Controle de Glosas

- **Motivo da Glosa:** Sempre registrar o motivo detalhado fornecido pela operadora.
- **Valor Glosado:** Informar o valor exato glosado (total ou parcial).
- **Histórico:** Manter o histórico de todas as interações (glosa, recurso, resposta da operadora).
- **Documentação:** Anexar documentos comprobatórios no recurso, quando necessário.

---

## 4. Cálculo do Valor Líquido

- **Sem Glosa:** Valor líquido = valor total do procedimento.
- **Glosa sem recurso:** Valor líquido = valor total - valor glosado.
- **Glosa com recurso aceito total:** Valor líquido = valor total.
- **Glosa com recurso aceito parcial:** Valor líquido = valor recuperado.
- **Glosa com recurso negado:** Valor líquido = valor total - valor glosado.

---

## 5. Responsabilidades

- **Faturamento:** Registro correto das consultas, envio dos lotes e acompanhamento dos retornos.
- **Auditoria/Financeiro:** Análise das glosas, elaboração e envio de recursos, atualização dos status.
- **TI/Suporte:** Garantir que o sistema registre corretamente todos os eventos e mantenha o histórico acessível.

---

## 6. Boas Práticas

- Conferir periodicamente os relatórios de honorários e glosas.
- Manter comunicação clara com os médicos sobre glosas e recursos.
- Utilizar o histórico do sistema para rastrear todo o processo de cada cobrança.
- Atualizar o status dos honorários imediatamente após cada retorno da operadora.

---

## 7. Dúvidas Frequentes

- **Como saber se um recurso foi aceito?**
  - Verifique o status do recurso no sistema: `ACEITO_TOTAL`, `ACEITO_PARCIAL` ou `NEGADO`.
- **O que fazer se a glosa for mantida?**
  - O valor glosado será descontado do valor líquido a ser pago ao médico.
- **Posso consultar o histórico de cada cobrança?**
  - Sim, o sistema mantém o histórico completo de glosas, recursos e respostas.

---

## 8. Observações Finais

O controle rigoroso dos honorários e glosas é essencial para a saúde financeira da clínica e para a transparência com os profissionais médicos. Utilize sempre o sistema para registrar todas as etapas e consulte o histórico sempre que necessário.

---

Se restar qualquer dúvida, consulte o setor de faturamento ou o suporte do sistema.

---
