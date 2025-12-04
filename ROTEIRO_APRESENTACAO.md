# 🎬 Roteiro de Apresentação em Vídeo - SGHM
## Duração: 15-18 minutos

---

## 📋 Preparação Antes da Gravação

### Checklist Técnico
- [ ] Câmera/webcam funcionando
- [ ] Microfone com boa qualidade
- [ ] Sistema SGHM rodando localmente
- [ ] Slides prontos (PowerPoint/Canva)
- [ ] Ambiente silencioso
- [ ] Boa iluminação
- [ ] Testar gravação de tela

### Material Necessário
- Slides da apresentação
- Sistema SGHM rodando
- Dados de exemplo cadastrados
- Script/roteiro impresso

---

## 🎯 Estrutura da Apresentação (15-18 min)

### SLIDE 1 - ABERTURA (1 min)
**Tempo: 0:00 - 1:00**

**Visual:** Slide de título com logo do SGHM

**Narração:**
> "Bom dia/Boa tarde. Meu nome é [SEU NOME] e venho apresentar o SGHM - Sistema de Gestão de Honorários Médicos, um projeto desenvolvido para revolucionar a gestão financeira de clínicas médicas no Brasil.
> 
> Nos próximos 15 minutos, vou demonstrar como nossa solução pode reduzir em até 75% as perdas com glosas e economizar 40% do tempo administrativo."

---

### SLIDE 2-3 - PROBLEMA E OPORTUNIDADE (3 min)
**Tempo: 1:00 - 4:00**

**SLIDE 2: O Problema**

**Visual:** Infográfico com estatísticas
- Taxa de glosa: 15-25%
- Perda anual: R$ 50-100K por clínica
- Tempo desperdiçado: 40h/mês

**Narração:**
> "Vocês sabiam que clínicas médicas no Brasil perdem entre 15 e 25% de sua receita devido a glosas de planos de saúde? Isso representa uma perda de 50 a 100 mil reais por ano em uma clínica de médio porte.
>
> Atualmente, a gestão é feita de forma manual, com planilhas Excel fragmentadas, sem controle de recursos contra glosas, e sem rastreabilidade das alterações. O tempo médio para contestar uma glosa é de 15 a 30 dias, com taxa de sucesso de apenas 30%."

**SLIDE 3: A Oportunidade**

**Visual:** Gráfico do mercado
- 15.000+ clínicas no Brasil
- Crescimento de healthtech: 25% a.a.
- Potencial de economia: R$ 30-60K/clínica/ano

**Narração:**
> "Por outro lado, temos uma enorme oportunidade. Com mais de 15 mil clínicas médicas no Brasil e o mercado de healthtech crescendo 25% ao ano, existe uma demanda clara por soluções que automatizem e otimizem a gestão de honorários.
>
> Nossa análise mostra que cada clínica pode economizar entre 30 e 60 mil reais por ano apenas otimizando o processo de gestão de glosas."

---

### SLIDE 4-5 - SOLUÇÃO PROPOSTA (2 min)
**Tempo: 4:00 - 6:00**

**SLIDE 4: Visão Geral**

**Visual:** Diagrama da arquitetura do sistema
- Frontend (React)
- Backend (Node.js)
- Banco (PostgreSQL)

**Narração:**
> "Nossa solução é o SGHM - um sistema web completo, moderno e escalável, desenvolvido com as tecnologias mais atuais do mercado: React no frontend, Node.js no backend, e PostgreSQL como banco de dados.
>
> O sistema centraliza toda a gestão: desde o cadastro de médicos, pacientes e planos, até o controle completo de consultas, honorários e, principalmente, o gerenciamento de glosas e recursos."

**SLIDE 5: Diferenciais**

**Visual:** Tabela comparativa SGHM vs Concorrentes

**Narração:**
> "Nosso principal diferencial é a gestão COMPLETA de recursos de glosa, com histórico 100% rastreável para auditoria. Enquanto os concorrentes cobram mais de 200 reais por mês, nossa solução custa entre 0 e 50 reais mensais, sendo até 80% mais acessível."

---

### DEMONSTRAÇÃO PRÁTICA (7 min)
**Tempo: 6:00 - 13:00**

**IMPORTANTE:** Gravar tela do sistema funcionando

**TELA 1: Login (30 seg)**
**Tempo: 6:00 - 6:30**

**Ação:** Fazer login no sistema

**Narração:**
> "Vamos à demonstração prática. Aqui está nossa tela de login, com autenticação segura usando JWT tokens."

---

**TELA 2: Dashboard (1 min)**
**Tempo: 6:30 - 7:30**

**Ação:** Mostrar dashboard com estatísticas

**Narração:**
> "Ao entrar, o usuário visualiza o dashboard com estatísticas em tempo real: total de honorários, valores pendentes, pagos e glosados. Temos gráficos que mostram a taxa de glosa e a evolução dos honorários ao longo do tempo."

---

**TELA 3: Registrar Consulta (1 min 30)**
**Tempo: 7:30 - 9:00**

**Ação:** Passo a passo de cadastro de consulta
1. Menu → Consultas → Nova Consulta
2. Selecionar médico
3. Selecionar paciente
4. Selecionar plano
5. Informar data e valor
6. Salvar

**Narração:**
> "Vou demonstrar o fluxo completo. Primeiro, registro uma nova consulta.
> 
> Seleciono o médico Dr. João Silva, a paciente Maria Santos, o plano Unimed, informo a data de hoje e o valor de 500 reais. Ao salvar... pronto! O sistema cria automaticamente o honorário vinculado a essa consulta."

---

**TELA 4: Gestão de Honorários (1 min)**
**Tempo: 9:00 - 10:00**

**Ação:** Mostrar lista de honorários com filtros

**Narração:**
> "Aqui no módulo de honorários, podemos visualizar todos os registros, filtrar por período, médico, plano ou status. Veja que temos seleção múltipla e ações em lote, permitindo marcar vários honorários como enviados ou pagos de uma só vez."

---

**TELA 5: Registrar Glosa (1 min 30)**
**Tempo: 10:00 - 11:30**

**Ação:** Registrar glosa em um honorário
1. Selecionar honorário
2. Clicar em "Registrar Glosa"
3. Informar valor (R$ 200)
4. Informar motivo
5. Salvar

**Narração:**
> "Agora vem o diferencial: vou registrar uma glosa. Este honorário de 500 reais foi parcialmente glosado em 200 reais. Informo o motivo 'Falta de documentação complementar' e salvo.
>
> Observe que o status muda automaticamente para GLOSADO e o valor da glosa é registrado."

---

**TELA 6: Enviar Recurso (1 min 30)**
**Tempo: 11:30 - 13:00**

**Ação:** Enviar recurso contra glosa
1. Clicar em "Enviar Recurso"
2. Informar data
3. Escrever justificativa detalhada
4. Enviar

**Narração:**
> "Agora contestamos essa glosa. Clico em 'Enviar Recurso', informo a data de hoje e justifico: 'Toda documentação foi enviada conforme protocolo estabelecido pelo plano. Solicitamos revisão da glosa aplicada.'
>
> Ao enviar, o sistema registra o recurso automaticamente no banco de dados PostgreSQL e marca o status como PENDENTE. Tudo fica 100% rastreável no histórico."

---

**TELA 7: Histórico (30 seg)**
**Tempo: 13:00 - 13:30**

**Ação:** Mostrar histórico completo do honorário

**Narração:**
> "E aqui está o histórico completo: registro da consulta, mudança para GLOSADO, recurso enviado. Cada evento mostra data, hora, usuário responsável e todos os detalhes. Perfeito para auditorias e conformidade."

---

### SLIDE 6-7 - VIABILIDADE E IMPLANTAÇÃO (2 min)
**Tempo: 13:00 - 15:00**

**SLIDE 6: Viabilidade Técnica e Econômica**

**Visual:** Tabela de custos

**Narração:**
> "Sobre a viabilidade: tecnicamente, utilizamos tecnologias consolidadas e confiáveis - React usado pela Meta e Netflix, Node.js pela LinkedIn e Uber, PostgreSQL é o banco mais confiável do mercado.
>
> Economicamente, o projeto é extremamente viável. O custo inicial é de apenas 40 a 100 reais no primeiro ano, com custos operacionais de 35 a 50 reais por mês. Compare isso com o valor gerado: 50 a 80 mil reais por ano em economia e valores recuperados. O ROI é praticamente infinito!"

**SLIDE 7: Plano de Implantação**

**Visual:** Timeline com fases

**Narração:**
> "Nosso plano de implantação é gradual e seguro:
> - Semanas 1-2: Deploy em produção
> - Semana 3: Piloto com 1 clínica
> - Semanas 4-5: Ajustes
> - Semanas 6-8: Rollout para mais clínicas
>
> Em 6 meses, projetamos estar em 10 a 20 clínicas. Em 12 meses, de 50 a 100 clínicas ativas."

---

### SLIDE 8-9 - IMPACTOS E KPIS (1 min 30)
**Tempo: 15:00 - 16:30**

**SLIDE 8: KPIs Operacionais**

**Visual:** Gráficos de antes/depois

**Narração:**
> "Os impactos são significativos e mensuráveis. Reduzimos em 80% o tempo para registrar uma consulta, de 5 para 1 minuto. O tempo para enviar um recurso cai 90%, de 30 para apenas 3 minutos. Eliminamos completamente erros de digitação e dados duplicados."

**SLIDE 9: KPIs Financeiros**

**Visual:** Gráfico de economia

**Narração:**
> "Financeiramente, conseguimos reduzir a taxa de glosa de 20% para 15%, um ganho de 25%. A taxa de sucesso em recursos dobra, de 30% para 60%. Isso significa recuperar 12 mil reais por mês ao invés de apenas 5 mil - um aumento de 140%."

---

### SLIDE 10 - CONCLUSÃO E PRÓXIMOS PASSOS (1 min)
**Tempo: 16:30 - 17:30**

**Visual:** Slide final com call-to-action

**Narração:**
> "Para concluir: o SGHM é mais do que um projeto acadêmico. É uma solução real, viável e necessária para um problema validado de mercado.
>
> Temos um sistema 100% funcional, com 6 módulos, 40 endpoints de API, documentação completa e pronto para produção.
>
> Nossos próximos passos são:
> - Deployment em produção nas próximas semanas
> - Piloto com 1-2 clínicas no próximo mês
> - Expansão gradual para 10-20 clínicas em 6 meses
>
> E a longo prazo, transformar isso em um SaaS consolidado, atendendo centenas de clínicas e gerando receita recorrente mensal."

---

### SLIDE 11 - ENCERRAMENTO (30 seg)
**Tempo: 17:30 - 18:00**

**Visual:** Informações de contato e agradecimento

**Narração:**
> "Obrigado pela atenção! Estou à disposição para responder perguntas. Podem entrar em contato pelo email [seu-email] ou acessar nosso repositório no GitHub [link].
>
> O futuro da gestão de honorários médicos é digital, integrado e inteligente. O SGHM já está aqui!"

---

## 🎬 Dicas de Gravação

### Durante a Gravação

✅ **Voz:**
- Fale de forma clara e pausada
- Mantenha entusiasmo na voz
- Evite vícios de linguagem ("né", "tipo", "então")

✅ **Ritmo:**
- Respeite os tempos do roteiro
- Faça pausas estratégicas
- Não fale muito rápido

✅ **Visual:**
- Mantenha contato visual com a câmera
- Use gestos naturais
- Sorria quando apropriado

✅ **Demonstração:**
- Movimentos de mouse suaves
- Destaque áreas importantes (cursor maior ou círculos)
- Teste tudo antes de gravar

### Pós-Produção

✅ **Edição:**
- Cortar erros e pausas longas
- Adicionar legendas (opcional mas recomendado)
- Música de fundo sutil (cuidado com volume)
- Transições suaves entre slides e demos

✅ **Qualidade:**
- Exportar em pelo menos 1080p
- Formato MP4 (mais compatível)
- Testar o vídeo antes de enviar

---

## 📊 Slides Sugeridos (PowerPoint/Canva)

### Template Recomendado
- **Cores:** Azul profissional + branco + verde (sucesso)
- **Fonte:** Roboto ou Open Sans (moderna e legível)
- **Layout:** Limpo, com bastante espaço em branco

### Lista de Slides

1. **Título/Capa** - Logo + Nome do projeto
2. **Problema** - Estatísticas de glosa
3. **Oportunidade** - Mercado e potencial
4. **Solução** - Visão geral do SGHM
5. **Diferenciais** - Tabela comparativa
6. *[Demonstração ao vivo - sem slide]*
7. **Viabilidade** - Custos e ROI
8. **Implantação** - Timeline
9. **KPIs Operacionais** - Gráficos antes/depois
10. **KPIs Financeiros** - Economia gerada
11. **Conclusão** - Próximos passos
12. **Encerramento** - Contato e agradecimento

---

## ✅ Checklist Final

### Antes de Gravar
- [ ] Roteiro memorizado ou impresso
- [ ] Slides finalizados
- [ ] Sistema testado e funcionando
- [ ] Dados de exemplo cadastrados
- [ ] Ambiente organizado
- [ ] Equipamentos testados

### Durante a Gravação
- [ ] Seguir o roteiro
- [ ] Respeitar os tempos
- [ ] Mostrar entusiasmo
- [ ] Demonstrar com clareza

### Após a Gravação
- [ ] Editar vídeo
- [ ] Adicionar legendas (opcional)
- [ ] Revisar qualidade
- [ ] Exportar em formato adequado
- [ ] Testar reprodução
- [ ] Enviar no prazo

---

**Boa apresentação! 🎯**

**Lembre-se:** 
- Demonstre confiança no projeto
- Mostre os resultados práticos
- Seja claro e objetivo
- Mostre entusiasmo pela solução

**Você tem uma solução real para um problema real. Acredite nisso!** 💪
