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

## ADR-010 — Tema escuro como preferência local

**Decisão:** oferecer temas claro e escuro, iniciar pela preferência do sistema e
salvar a escolha no navegador.

**Alternativas:** manter somente o tema claro ou salvar a preferência no backend.

**Motivo:** reduzir desconforto em uso prolongado sem exigir conta ou integração.

**Trade-offs:** a escolha não acompanha o funcionário entre dispositivos.

## ADR-011 — Situação documental consolidada por pessoa

**Decisão:** apresentar uma lista mockada de pessoas com três situações simples:
correta, documento pendente e atualização necessária.

**Alternativas:** inferir a situação apenas na tela de documentos ou implementar
cadastro completo de pessoas.

**Motivo:** permitir priorização operacional sem ampliar a fatia para um módulo de
CRM ou cadastro completo.

**Trade-offs:** vínculos pessoa-documento ainda são demonstrativos e não podem ser
editados nesta versão.

## ADR-012 — Requisitos documentais configuráveis por cliente

**Decisão:** sugerir categorias por pessoa e permitir ajuste por checkbox antes do
envio, com um espaço de arquivo para cada tipo selecionado.

**Alternativas:** uma lista fixa para todos ou upload sem vínculo com cliente.

**Motivo:** os atendimentos não exigem os mesmos documentos e o vínculo melhora a
rastreabilidade.

**Trade-offs:** as sugestões são mockadas e ainda não derivam de regras de negócio
persistidas no servidor.

## ADR-013 — Detecção local de possível duplicidade

**Decisão:** comparar cliente, nome, tamanho e última modificação antes de criar um
registro.

**Alternativas:** aceitar todo reenvio ou calcular hash criptográfico no navegador.

**Motivo:** demonstrar o risco descrito no enunciado sem processar conteúdo real.

**Trade-offs:** arquivos diferentes podem compartilhar metadados e o mesmo arquivo
renomeado pode não ser reconhecido. Produção exige hash e idempotência no backend.

## ADR-014 — Eventos de auditoria no registro

**Decisão:** manter uma sequência de eventos para upload, processamento, correção,
falha e aprovação.

**Alternativas:** depender apenas do status atual.

**Motivo:** explicar quem fez o quê e como o documento chegou ao estado final.

**Trade-offs:** no `localStorage` os eventos podem ser alterados; em produção devem
ser imutáveis e gravados no servidor.

## ADR-015 — Contratos para integração futura

**Decisão:** depender de `AIProcessor` e `DocumentRepository`, usando implementações
mockadas na composição atual.

**Alternativas:** codificar o mock diretamente nos componentes ou iniciar uma API
real agora.

**Motivo:** preservar o escopo da Trilha B e deixar pontos explícitos de troca.

**Trade-offs:** o contrato remoto ainda poderá precisar de paginação, timeout,
autenticação e processamento assíncrono.
## ADR-016 — Separar documento exigido de documento recebido

- **Decisão:** a edição da pessoa usa duas marcações independentes por tipo documental: “Exigido” e “Recebido”.
- **Motivo:** marcar apenas que um tipo existe não informa se ele é uma obrigação do cliente ou se o arquivo já chegou ao escritório.
- **Consequência:** o status é recalculado automaticamente; qualquer item exigido e não recebido deixa a pessoa como `pending_document`.
- **Limite atual:** a marcação de recebimento é uma simulação local e não representa um arquivo efetivamente armazenado.

## ADR-017 — Um único fluxo para WhatsApp, revisão e pessoas

- **Decisão:** o WhatsApp cria um cadastro provisório e um documento vinculado; a fila de Conferência é responsável pela validação, e a aprovação marca a categoria como recebida em Pessoas.
- **Motivo:** evitar que o operador repita manualmente em Pessoas uma informação já confirmada durante a revisão.
- **Consequência:** Pessoas passa a ser um painel consolidado e uma ferramenta de exceção, não uma segunda etapa obrigatória do trabalho.
- **Limite atual:** mensagens, arquivos, processamento e eventos continuam totalmente simulados em armazenamento local.

## ADR-018 — Não persistir URLs temporárias de arquivos

- **Decisão:** manter URLs `blob:` somente em memória durante a sessão e persistir apenas metadados e resultados documentais.
- **Motivo:** uma URL temporária deixa de funcionar depois que a página é recarregada e não representa armazenamento real do arquivo.
- **Consequência:** o preview funciona na sessão do upload; depois disso, a interface informa a limitação sem tentar abrir um endereço inválido.
- **Evolução futura:** armazenamento privado deverá fornecer URLs assinadas de curta duração.

## ADR-019 — A decisão documental conduz o próximo contato

- **Decisão:** centralizar aprovação e recusa em `DocumentWorkflowService`, que atualiza o documento, a pessoa e a conversa relacionada.
- **Motivo:** eliminar a procura manual do cliente após cada conferência e manter a próxima ação visível no canal de origem.
- **Consequência:** uma aprovação solicita automaticamente o próximo requisito pendente; uma recusa registra o motivo e reabre o envio da mesma categoria.
- **Limite atual:** o disparo é uma nova mensagem local na conversa mockada. Uma integração futura deverá publicar o evento em uma fila e usar um adaptador oficial do WhatsApp.

## ADR-020 — Dashboard orientado a prioridades

- **Decisão:** consolidar documentos em conferência, atendimentos aguardando equipe e pessoas com pendências em atalhos operacionais.
- **Motivo:** oferecer uma entrada diária baseada no trabalho a realizar, e não apenas em métricas históricas.
- **Consequência:** os números são derivados dos mesmos repositórios locais usados pelas telas de destino e permanecem consistentes durante a sessão.
