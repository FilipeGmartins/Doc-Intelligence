# Decisões

## ADR-001 — React, TypeScript e Vite

**Decisão:** usar a stack exigida com tipagem estrita e build do Vite.

**Alternativas:** outros frameworks React ou JavaScript sem tipagem.

**Motivo:** aderência ao desafio, velocidade de desenvolvimento e contratos
explícitos.

**Trade-offs:** a aplicação continua sendo entregue ao navegador e não possui as
garantias de um backend.

## ADR-002 — API simulada

**Decisão:** expor operações assíncronas equivalentes aos endpoints futuros.

**Alternativas:** chamadas HTTP contra um servidor mock separado.

**Motivo:** preservar os limites da API sem adicionar infraestrutura.

**Trade-offs:** latência, falhas de rede e concorrência real não são reproduzidas.

## ADR-003 — Repository Pattern simples

**Decisão:** separar casos de uso de persistência por uma única interface.

**Alternativas:** acessar `localStorage` nos componentes ou adotar uma arquitetura
em mais camadas.

**Motivo:** permitir a troca por REST/Supabase com baixa complexidade.

**Trade-offs:** há uma camada adicional mesmo no mock local.

## ADR-004 — localStorage

**Decisão:** persistir somente registros e resultados processados localmente.

**Alternativas:** memória volátil, IndexedDB ou backend real.

**Motivo:** satisfazer a persistência após recarregar sem ampliar o escopo.

**Trade-offs:** não é adequado para documentos binários ou dados sensíveis reais.

## ADR-005 — Threshold configurável

**Decisão:** iniciar com confiança `0.80`, centralizada em uma constante.

**Alternativas:** threshold por tipo ou decisão manual.

**Motivo:** regra clara, demonstrável e testável.

**Trade-offs:** um único limite não representa a calibração necessária em produção.

## ADR-006 — Cenários determinísticos

**Decisão:** derivar sucesso, revisão e falha do nome do arquivo.

**Alternativas:** seleção aleatória.

**Motivo:** tornar a avaliação e os testes reproduzíveis.

**Trade-offs:** o comportamento não simula a variabilidade real de um modelo.

## ADR-007 — CSS comum inicialmente

**Decisão:** começar com CSS global e introduzir organização adicional somente
quando as telas justificarem.

**Alternativas:** Tailwind CSS ou CSS Modules desde o scaffold.

**Motivo:** evitar configuração e dependências antes de existir uma interface.

**Trade-offs:** estilos deverão seguir convenções claras conforme crescerem.

## ADR-008 — Binário não persistido no mock

**Decisão:** persistir metadados e resultados, mantendo previews binários apenas
durante a sessão atual do navegador.

**Alternativas:** converter arquivos para Base64 no `localStorage` ou usar
IndexedDB.

**Motivo:** `localStorage` possui limite reduzido e não é adequado para documentos
ou dados sensíveis.

**Trade-offs:** após recarregar a página, o registro permanece, mas o preview do
arquivo recém-enviado pode não estar mais disponível. Em produção, o binário será
enviado para storage privado e o banco guardará somente a referência.

## ADR-009 — Conferência como etapa anterior à finalização

**Decisão:** tratar dados extraídos como provisórios até a aprovação explícita do
funcionário. Salvar correções não finaliza o documento; aprovar muda o estado para
`approved`.

**Alternativas:** aprovar automaticamente ao salvar ou manter um único estado de
documento processado.

**Motivo:** aproxima a experiência de um cadastro conferido antes da conclusão,
deixa o fluxo compreensível e cria um ponto claro para auditoria.

**Trade-offs:** acrescenta uma ação ao fluxo e exige diferenciar rascunho salvo de
documento finalizado.
