# Especificação de requisitos e visão técnica — DOC Intelligence

**Versão:** 1.0  
**Data de referência:** 31 de agosto de 2026  
**Estado do produto:** protótipo funcional front-end com API, banco, IA e WhatsApp simulados  
**Público deste documento:** produto, engenharia, avaliação técnica, operação e futuras equipes de integração

## 1. Resumo executivo

O DOC Intelligence é uma aplicação interna concebida para reduzir o trabalho
manual de recebimento, identificação, renomeação, extração e conferência de
documentos de clientes. O problema observado é o processamento repetitivo de
arquivos recebidos por WhatsApp, e-mail ou atendimento presencial, hoje dependente
de abertura individual, classificação visual, digitação e organização manual.

A implementação atual valida a experiência e as regras centrais por meio de uma
fatia vertical executável no navegador. Ela permite cadastrar pessoas, definir
requisitos documentais específicos, receber arquivos, simular processamento,
encaminhar resultados de baixa confiança para conferência humana, corrigir campos,
aprovar ou recusar documentos, consultar o histórico e simular a continuidade do
atendimento pelo WhatsApp.

Esta versão não é adequada para documentos ou dados pessoais reais. Não existe
backend, autenticação, banco compartilhado, armazenamento permanente de arquivos,
integração oficial com WhatsApp ou processamento por IA real. Os dados usados são
fictícios e ficam no `localStorage` do navegador.

## 2. Objetivos do produto

### 2.1 Objetivo principal

Diminuir o tempo operacional por documento, automatizando as etapas previsíveis e
mantendo intervenção humana somente quando houver baixa confiança, inconsistência
ou decisão que exija responsabilidade do operador.

### 2.2 Objetivos específicos

- Receber imagens e PDFs vinculados a um cliente e a uma categoria esperada.
- Classificar o documento e extrair campos relevantes ao tipo identificado.
- Propor um nome padronizado para o arquivo.
- Separar resultados confiáveis daqueles que exigem conferência humana.
- Permitir correção sem aprovação implícita.
- Registrar os eventos relevantes do ciclo documental.
- Consolidar pendências por pessoa e orientar a próxima ação do operador.
- Demonstrar como um atendimento iniciado pelo WhatsApp pode alimentar o mesmo fluxo.
- Preservar contratos de software que permitam trocar mocks por integrações reais.

### 2.3 Indicadores futuros sugeridos

Os indicadores abaixo ainda não são medidos pela aplicação atual:

- Tempo médio entre recebimento e aprovação.
- Percentual de documentos aprovados sem correção.
- Percentual encaminhado para conferência humana.
- Taxa de falha por tipo e origem do arquivo.
- Campos mais corrigidos por categoria documental.
- Taxa de duplicidade e reenvio.
- Tempo poupado em comparação com o processo manual de quatro minutos por documento.

## 3. Escopo

### 3.1 Incluído na versão atual

- Front-end React e TypeScript responsivo.
- Dashboard operacional com prioridades.
- Tema claro e escuro persistido no navegador.
- Cadastro rápido de cliente durante o envio.
- Edição de pessoas e de requisitos documentais individualizados.
- Upload múltiplo de PDF, JPG, JPEG e PNG, até 10 MB por arquivo.
- Categorias: identidade, comprovante de residência, contracheque, cheque,
  carteira de trabalho, contrato, laudo, procuração e outros.
- Processamento simulado determinístico.
- Extrações específicas para as principais categorias.
- Nome de arquivo sugerido pelo processador simulado.
- Fila de conferência humana.
- Edição dos campos extraídos.
- Aprovação e recusa explícitas.
- Reprocessamento de falhas ou resultados revisáveis.
- Busca e filtros de documentos e pessoas.
- Estado consolidado de conformidade documental por pessoa.
- Trilha de eventos por documento.
- Detecção demonstrativa de possível duplicidade.
- Fluxo de atendimento por WhatsApp inteiramente simulado.
- Migração versionada dos dados locais antigos.
- Recuperação global para falhas inesperadas da interface.
- Configuração de rotas diretas para hospedagem da SPA na Vercel.
- Testes unitários e de interface para regras críticas.

### 3.2 Fora do escopo atual

- Uso de documentos, nomes, contatos ou identificadores reais.
- Autenticação e autorização de funcionários.
- API ou banco de dados remoto.
- Armazenamento permanente dos arquivos enviados.
- OCR, classificação ou extração por IA real.
- Integração com WhatsApp Business, e-mail ou scanners.
- Assinatura eletrônica, validade jurídica ou certificação de documentos.
- Cobrança, faturamento ou controle financeiro.
- Aplicativo móvel nativo.
- Operação multiempresa ou multitenant.

## 4. Perfis de usuário

### 4.1 Operador de atendimento

Recebe informações do cliente, cria ou localiza o cadastro, define os documentos
necessários e acompanha os itens ainda ausentes.

### 4.2 Conferente

Analisa resultados com baixa confiança, compara o documento com os campos
extraídos, corrige inconsistências e decide aprovar ou recusar.

### 4.3 Gestor operacional

Acompanha volume, prioridades, pendências e gargalos. Na versão atual, utiliza o
Dashboard, mas ainda não possui relatórios históricos ou indicadores persistentes.

### 4.4 Sistema interno consumidor — futuro

Aplicações internas poderão enviar documentos e consultar resultados por uma API
autenticada. Este perfil está previsto apenas no contrato conceitual.

## 5. Fluxos de negócio

### 5.1 Recebimento manual

1. O operador abre **Enviar documentos**.
2. Seleciona uma pessoa existente ou cria um cliente fictício sem sair da tela.
3. Confirma quais categorias são exigidas para aquele cliente.
4. Anexa um arquivo no espaço correspondente.
5. A aplicação valida formato e tamanho e verifica possível duplicidade.
6. O processamento simulado classifica, extrai campos e sugere um nome.
7. Alta confiança gera resultado processado; baixa confiança gera conferência.

### 5.2 Conferência humana

1. O conferente abre a fila de **Conferência**.
2. Seleciona um documento revisável.
3. Verifica e, se necessário, corrige campos, cliente, categoria e nome sugerido.
4. Salva as correções; o documento continua sem aprovação.
5. Aprova explicitamente ou recusa informando um motivo.
6. A decisão é registrada na trilha de eventos.
7. A aprovação marca a categoria como recebida para a pessoa vinculada.

### 5.3 Atendimento iniciado por WhatsApp — simulação

1. Uma conversa fictícia coleta nome, CPF, e-mail e endereço.
2. O cliente simulado envia o documento solicitado.
3. O serviço cria uma pessoa provisória de forma idempotente.
4. O documento é criado, processado e enviado à conferência.
5. A equipe valida o pré-cadastro separadamente da decisão documental.
6. Quando o documento é aprovado, o bot solicita o próximo requisito pendente.
7. Quando é recusado, o bot apresenta o motivo e solicita reenvio da mesma categoria.
8. Quando não restam requisitos, o atendimento é encerrado na simulação.

### 5.4 Consulta operacional

- O Dashboard mostra as prioridades atuais.
- Documentos podem ser pesquisados e filtrados por situação.
- Pessoas podem ser pesquisadas e filtradas por conformidade.
- O detalhe do documento apresenta campos, confiança, decisão e histórico.

## 6. Requisitos funcionais

Os estados utilizados são: **implementado**, **parcial**, **planejado** e
**inviável no ambiente atual**.

### RF-001 — Receber documentos

**Estado:** implementado no protótipo.

O sistema deve aceitar um ou mais arquivos PDF, JPG, JPEG ou PNG, limitados a
10 MB por arquivo. Arquivos fora dessas condições devem ser rejeitados com uma
mensagem compreensível sem impedir os demais arquivos válidos do lote.

### RF-002 — Vincular documento a uma pessoa

**Estado:** implementado.

O operador deve poder selecionar uma pessoa e uma categoria documental antes do
envio. O registro documental deve preservar `personId` e `expectedCategory`.

### RF-003 — Criar cliente durante o envio

**Estado:** implementado.

O operador deve cadastrar nome, CPF fictício, e-mail e requisitos iniciais sem
sair da tela de envio. Ao concluir, o novo cliente deve ficar selecionado.

### RF-004 — Configurar requisitos por cliente

**Estado:** implementado.

Cada pessoa deve possuir uma lista própria de documentos exigidos e recebidos. A
aplicação não deve impor uma lista única para todos os atendimentos.

### RF-005 — Processar documento

**Estado:** implementado por mock; integração real planejada.

O processador deve retornar tipo, nome sugerido, confiança global e campos com
confiança individual. A interface não deve depender diretamente da implementação
do processador.

### RF-006 — Encaminhar baixa confiança para revisão

**Estado:** implementado.

Resultados com confiança abaixo de `0.80` devem receber o estado
`review_required`. Eles não podem entrar automaticamente como aprovados.

### RF-007 — Simular cenários reproduzíveis

**Estado:** implementado.

- Arquivos comuns produzem resultado de alta confiança.
- Nomes contendo `revisao` ou `baixa_confianca` produzem baixa confiança.
- Nomes contendo `falha` ou `erro` produzem falha controlada.

### RF-008 — Editar extração

**Estado:** implementado.

O conferente deve alterar os campos extraídos. Campos modificados devem receber
`manuallyEdited: true`, e a correção deve gerar evento de auditoria.

### RF-009 — Separar salvamento e aprovação

**Estado:** implementado.

Salvar uma correção não deve aprovar o documento. A aprovação deve exigir uma
ação separada e explícita.

### RF-010 — Aprovar documento

**Estado:** implementado.

Somente documentos `processed` ou `review_required` podem ser aprovados. A ação
deve registrar data, ator e evento e atualizar a categoria recebida da pessoa.

### RF-011 — Recusar documento

**Estado:** implementado.

Somente documentos `processed` ou `review_required` podem ser recusados. Um motivo
não vazio é obrigatório e deve ser apresentado ao fluxo de atendimento associado.

### RF-012 — Reprocessar documento

**Estado:** implementado.

Somente documentos `failed` ou `review_required` podem ser reprocessados.
Transições incompatíveis devem resultar em erro de domínio.

### RF-013 — Consultar documentos

**Estado:** implementado.

O usuário deve listar, pesquisar, filtrar e abrir o detalhe de documentos já
registrados.

### RF-014 — Consultar pessoas e pendências

**Estado:** implementado.

A listagem deve indicar se a pessoa está completa, possui documento pendente ou
necessita atualização, incluindo os itens ou o motivo correspondente.

### RF-015 — Editar cadastro e matriz documental

**Estado:** implementado.

O operador deve alterar dados cadastrais, requisitos, recebimentos simulados e
motivo de atualização. O status deve ser recalculado após o salvamento.

### RF-016 — Validar CPF

**Estado:** implementado.

CPF deve ser armazenado sem máscara, conter 11 números, rejeitar sequências
repetidas e passar pela validação matemática dos dois dígitos verificadores. A
máscara deve existir somente na apresentação.

### RF-017 — Validar RG

**Estado:** implementado por formato.

RG deve aceitar no máximo nove caracteres alfanuméricos, normalizados em letras
maiúsculas. Não existe validação estadual de dígito verificador nesta versão.

### RF-018 — Evitar duplicidade provável

**Estado:** parcial e demonstrativo.

O protótipo compara cliente, nome, tamanho e última modificação. Produção deve usar
hash do conteúdo, idempotência no servidor e restrição transacional.

### RF-019 — Manter trilha de eventos

**Estado:** implementado localmente.

Upload, início de processamento, resultado, revisão, falha, correção, recusa e
aprovação devem aparecer no histórico. A trilha atual não é imutável.

### RF-020 — Simular atendimento do WhatsApp

**Estado:** implementado por mock.

O sistema deve demonstrar coleta guiada, criação provisória, anexação, validação
interna, retorno da conferência, pedido de reenvio e solicitação do próximo item.

### RF-021 — Recuperar dados locais antigos

**Estado:** implementado.

Ao encontrar chaves de persistência `v1`, a aplicação deve normalizar os dados e
gravar a versão `v2`. Identificadores inválidos não podem ser silenciosamente
aceitos como válidos.

### RF-022 — Restaurar estado demonstrativo

**Estado:** implementado.

Os módulos de documentos, pessoas e conversas devem oferecer restauração dos dados
fictícios iniciais para repetir a demonstração.

### RF-023 — Consumir API interna

**Estado:** planejado.

Outros sistemas internos deverão enviar arquivos, consultar estados e recuperar
resultados por uma API autenticada e versionada.

## 7. Regras de negócio

- **RN-001:** confiança inferior a `0.80` exige conferência humana.
- **RN-002:** correção salva e aprovação são ações diferentes.
- **RN-003:** aprovação e recusa só partem de `processed` ou `review_required`.
- **RN-004:** reprocessamento só parte de `failed` ou `review_required`.
- **RN-005:** recusa exige motivo.
- **RN-006:** aprovação de documento vinculado marca a categoria como recebida.
- **RN-007:** qualquer requisito exigido e não recebido deixa a pessoa pendente.
- **RN-008:** sem pendências, um motivo de atualização prevalece sobre o estado completo.
- **RN-009:** requisitos documentais variam por pessoa.
- **RN-010:** identificação ou e-mail duplicado impede novo cadastro manual local.
- **RN-011:** CPF é canônico sem máscara e validado no serviço e na interface.
- **RN-012:** dados e cenários da demonstração devem ser fictícios e reproduzíveis.
- **RN-013:** uma decisão documental deve orientar automaticamente o próximo passo da conversa associada.
- **RN-014:** URLs `blob:` não devem ser persistidas, pois deixam de funcionar após recarregar.

## 8. Requisitos não funcionais

### RNF-001 — Segurança

**Estado atual:** não atende produção.

Produção deverá usar autenticação, autorização por função, proteção de sessão,
segregação por organização, criptografia em trânsito e repouso, gestão de segredos,
auditoria imutável e política de retenção.

### RNF-002 — Privacidade e LGPD

**Estado atual:** somente dados fictícios.

Antes de dados reais, devem ser definidos base legal, finalidade, minimização,
retenção, descarte, atendimento aos direitos do titular, contratos com operadores
e resposta a incidentes.

### RNF-003 — Acessibilidade

**Estado:** parcialmente implementado.

A interface possui rótulos, foco visível, controles por teclado, estados
semânticos e respeito a movimento reduzido. Uma auditoria WCAG formal ainda deve
ser executada.

### RNF-004 — Usabilidade

**Estado:** implementado para demonstração.

A navegação deve manter identidade azul, temas claro e escuro, estados de
carregamento, erro, vazio e sucesso, além de linguagem orientada ao trabalho diário.

### RNF-005 — Desempenho

**Estado:** adequado ao volume local.

Produção deverá definir metas de tamanho de upload, latência de API, tempo de
processamento, paginação e carregamento incremental. O bundle atual não foi
submetido a metas formais de performance.

### RNF-006 — Disponibilidade e resiliência

**Estado:** parcial.

Existe recuperação global da interface e tratamento de falhas simuladas. Produção
deverá adicionar filas duráveis, tentativas com backoff, dead-letter queue,
idempotência e procedimentos de recuperação.

### RNF-007 — Observabilidade

**Estado:** não implementado.

Produção deverá registrar logs estruturados, métricas, traces, alertas e
correlação entre atendimento, arquivo, processamento e revisão, sem expor dados
sensíveis indevidamente.

### RNF-008 — Compatibilidade

**Estado:** aplicação web responsiva.

Deve funcionar em navegadores modernos com JavaScript, armazenamento local e APIs
Web suportadas. Não há matriz formal de navegadores homologados.

### RNF-009 — Testabilidade

**Estado:** implementado na camada local.

Regras críticas devem permanecer determinísticas e cobertas por Vitest e Testing
Library. Integrações futuras deverão adicionar testes de contrato, integração e
end-to-end.

### RNF-010 — Manutenibilidade

**Estado:** implementado como princípio arquitetural.

Páginas consomem hooks ou serviços; persistência fica atrás de repositórios; o
processamento implementa `AIProcessor`. Nenhum componente deve acessar mocks ou
`localStorage` diretamente.

## 9. Arquitetura atual

### 9.1 Tecnologias

- React 19 e TypeScript.
- Vite como servidor e empacotador.
- React Router para navegação.
- Lucide React para iconografia.
- Vitest, jsdom e Testing Library para testes.
- OXLint para análise estática.
- Vercel como destino de hospedagem estática.

### 9.2 Organização lógica

```text
Página / componente
  -> hook ou serviço
  -> caso de uso
  -> interface de repositório ou AIProcessor
  -> implementação mockada
  -> localStorage ou resultado determinístico
```

Principais pontos de extensão:

- `DocumentRepository`: persistência de documentos.
- `PersonRepository`: persistência de pessoas.
- `ConversationRepository`: persistência de atendimentos.
- `AIProcessor`: classificação e extração.
- `DocumentWorkflowService`: orquestração entre decisão documental e conversa.

### 9.3 Rotas

- `/`: Dashboard operacional.
- `/upload`: plano e envio documental por cliente.
- `/review`: fila de conferência.
- `/documents`: consulta de documentos.
- `/documents/:id`: detalhe, edição, auditoria e decisão.
- `/people`: pessoas e conformidade documental.
- `/whatsapp`: atendimento automatizado simulado.

`vercel.json` reescreve rotas diretas para `index.html`, permitindo recarregar uma
rota interna da SPA no deploy.

### 9.4 Persistência local

Os bancos mockados usam chaves versionadas:

- `doc-intelligence:documents:v2`.
- `doc-intelligence:people:v2`.
- `doc-intelligence:whatsapp-intakes:v2`.

O tema é persistido separadamente pelo provedor visual. Arquivos binários não são
persistidos; previews existem apenas durante a sessão em que a `blob URL` é válida.

### 9.5 Modelo de documento

Um documento contém identificação, nomes original e sugerido, MIME type, tamanho,
tipo classificado, status, confiança, campos extraídos, datas, erro ou motivo de
recusa, vínculo com pessoa e categoria, fingerprint e eventos.

Estados documentais:

```text
pending -> processing -> processed -> approved
                    |-> review_required -> approved
                    |                   -> rejected
                    |                   -> processing (reprocessamento)
                    |-> failed -> processing (reprocessamento)
```

### 9.6 Modelo de pessoa

Uma pessoa contém nome, CPF fictício, e-mail, origem, requisitos, categorias
recebidas, pendências, motivo de atualização e situação consolidada.

Situações:

- `complete`: todos os requisitos recebidos e sem motivo de atualização.
- `pending_document`: existe requisito ainda não recebido.
- `update_required`: requisitos completos, mas existe correção ou atualização necessária.

### 9.7 Modelo de conversa

A conversa contém telefone fictício, nome exibido, estado, etapa, progresso,
rascunho cadastral, mensagens e vínculos com pessoa e documentos.

Etapas de coleta:

```text
name -> identifier -> email -> address -> document -> complete
```

## 10. Processamento simulado

O `MockAIService` implementa `AIProcessor` e usa o nome do arquivo e a categoria
esperada para produzir resultados reproduzíveis. Há templates para identidade,
comprovante, contracheque, cheque, carteira de trabalho, contrato, laudo,
procuração e outros.

O mock não lê o conteúdo do arquivo. Portanto, a demonstração valida o fluxo e a
arquitetura, mas não mede acurácia, qualidade de OCR ou desempenho de modelos.

## 11. Validação e qualidade

Comandos obrigatórios antes de concluir uma alteração:

```bash
npm run build
npm run lint
npm test
```

Para validar um deploy:

```bash
npm run test:smoke -- https://endereco-do-deploy
```

A suíte atual cobre validação de arquivos, confiança, CPF e RG, serviços de
documentos, pessoas e conversas, migrações locais, cadastro durante o envio,
edição de pessoas e recuperação global de erros.

Ainda são necessários para produção:

- Testes end-to-end em navegador contra preview e produção.
- Testes de contrato da API.
- Testes de concorrência e idempotência.
- Testes de segurança e autorização.
- Testes de carga e arquivos corrompidos.
- Auditoria formal de acessibilidade.

## 12. Melhorias recomendadas

### Prioridade 0 — bloqueadores para dados reais

1. Criar backend autenticado e versionado.
2. Implementar autenticação e autorização por perfis.
3. Armazenar binários em bucket privado com URLs assinadas e expiração curta.
4. Migrar dados de negócio para banco relacional com trilha imutável.
5. Definir controles de LGPD, retenção e descarte.
6. Implementar logs, métricas, alertas e gestão segura de segredos.
7. Submeter arquitetura e integrações a revisão de segurança.

### Prioridade 1 — operação confiável

1. Criar fila assíncrona de processamento com idempotência e retentativas.
2. Calcular hash do conteúdo para duplicidade real.
3. Adicionar versionamento otimista para evitar sobrescrita entre conferentes.
4. Implementar paginação e filtros no servidor.
5. Criar notificações e filas de trabalho por prioridade e prazo.
6. Registrar operador autenticado em todos os eventos.
7. Criar testes end-to-end e pipeline de CI obrigatório.

### Prioridade 2 — inteligência documental real

1. Avaliar OCR e modelos usando conjunto de dados autorizado e anonimizado.
2. Criar processadores separados por categoria e versão.
3. Versionar modelo, prompt, esquema e confiança em cada resultado.
4. Calibrar thresholds por tipo e campo, não apenas globalmente.
5. Medir precisão, recall, taxa de correção e custo por documento.
6. Implementar fallback entre provedores e revisão de qualidade.

### Prioridade 3 — integrações e eficiência

1. Integrar WhatsApp Business por webhook oficial.
2. Adicionar entrada por e-mail e API interna.
3. Criar importação em lote e exportação padronizada.
4. Enviar eventos para sistemas internos após aprovação.
5. Criar regras de requisitos por serviço contratado, mantendo exceção por cliente.
6. Adicionar relatórios históricos e métricas de produtividade.

### Prioridade 4 — evolução de experiência

1. Atalhos de teclado para conferência em alto volume.
2. Comparação lado a lado e zoom avançado do documento.
3. Destaque visual da região de origem de cada campo extraído.
4. Salvamento automático de rascunho sem aprovação.
5. Filas pessoais, filtros salvos e ações em lote com confirmação.
6. Internacionalização e máscaras configuráveis quando houver necessidade real.

## 13. Implementações inviáveis no momento

“Inviável” aqui significa bloqueada pelo escopo, infraestrutura ou credenciais
atuais, e não tecnicamente impossível.

### 13.1 IA e OCR reais

Não podem ser implementados com qualidade verificável sem provedor, credenciais,
backend seguro, conjunto de avaliação, política de dados, orçamento e critérios de
acurácia. Chamar uma API diretamente do navegador exporia segredos e documentos.

### 13.2 WhatsApp real

Depende de conta empresarial, número aprovado, configuração no Meta Business,
templates, consentimento, webhooks públicos, backend, verificação de assinatura,
idempotência e política de privacidade. A interface atual é somente uma simulação.

### 13.3 Segurança somente no front-end

Uma tela de login ou senha escrita no React não protege arquivos nem dados. O
controle real deve existir no servidor e na plataforma de hospedagem. Proteção da
Vercel é útil para demonstração, mas não substitui autorização de negócio.

### 13.4 Multiusuário com `localStorage`

Não é possível garantir consistência, compartilhamento, concorrência, backup ou
auditoria imutável usando armazenamento local. Isso exige API e banco transacional.

### 13.5 Persistência real de arquivos com `blob URL`

`blob URL` é temporária e específica da sessão. Arquivos duráveis exigem storage
privado e uma referência persistente no banco.

### 13.6 Validade jurídica automática

Classificação, OCR e confiança de modelo não comprovam autenticidade, vigência ou
validade jurídica. Essas decisões exigem regras formais, fontes confiáveis e, em
alguns casos, análise humana especializada.

### 13.7 Automação integral sem revisão

Eliminar a conferência humana de documentos sensíveis antes de medir e calibrar o
sistema criaria risco operacional. O caminho recomendado é automação progressiva,
com revisão baseada em confiança e amostragem de resultados considerados seguros.

## 14. Arquitetura alvo sugerida

```text
Canais internos / WhatsApp / e-mail
  -> API Gateway autenticado
  -> serviço de recebimento e idempotência
  -> storage privado + banco relacional
  -> fila de processamento
  -> OCR / classificadores / extratores por categoria
  -> regras de confiança e qualidade
  -> fila de conferência humana
  -> decisão e auditoria imutável
  -> eventos para atendimento e sistemas internos
```

Componentes recomendados:

- API REST ou equivalente, versionada.
- Banco relacional para documentos, pessoas, campos, requisitos e eventos.
- Storage de objetos privado.
- Fila durável para processamento assíncrono.
- Workers independentes e escaláveis.
- Adaptadores de IA implementando `AIProcessor`.
- Adaptadores de persistência implementando os repositórios existentes.
- Provedor de identidade e controle de acesso por perfil.
- Observabilidade centralizada.

## 15. Critérios para considerar um MVP real

O produto poderá ser tratado como MVP operacional, e não apenas demonstração,
quando todos os itens abaixo forem atendidos:

- Funcionários autenticados e autorizados por perfil.
- Arquivos armazenados de forma privada e recuperável.
- API e banco com backup, migração e auditoria.
- Processamento assíncrono com falhas recuperáveis.
- Resultado real medido em conjunto de avaliação autorizado.
- Revisão obrigatória abaixo do threshold calibrado.
- Duplicidade baseada em conteúdo e idempotência.
- Eventos associados ao operador autenticado.
- Política de privacidade, retenção e descarte aprovada.
- Testes de segurança, integração, end-to-end e carga aprovados.
- Runbook de incidentes e monitoramento em funcionamento.
- Integrações externas usando credenciais e webhooks no backend.

## 16. Critérios de aceite da demonstração atual

- A aplicação inicia e todas as rotas principais são acessíveis.
- Arquivos válidos e inválidos apresentam resultados coerentes.
- Um cliente pode ter requisitos diferentes de outro.
- Cenários de sucesso, revisão e falha são reproduzíveis.
- Baixa confiança não aprova automaticamente.
- Correções podem ser salvas sem aprovação.
- Aprovação atualiza a pessoa vinculada.
- Recusa solicita reenvio no atendimento simulado.
- CPF e RG respeitam suas regras de validação.
- A trilha registra eventos importantes.
- Tema claro e escuro funcionam.
- Build, lint e testes automatizados passam.
- O projeto utiliza apenas dados fictícios.

## 17. Riscos principais

- Confundir dados mockados com capacidade real de extração.
- Expor dados pessoais ao publicar uma versão sem autenticação.
- Usar `localStorage` como se fosse fonte oficial de dados.
- Adotar confiança não calibrada como decisão automática.
- Conectar WhatsApp ou IA diretamente no navegador.
- Não tratar reentrega, duplicidade e concorrência no backend.
- Manter eventos editáveis sem trilha externa imutável.
- Crescer o escopo antes de medir o fluxo operacional com usuários.

## 18. Documentos relacionados

- [Arquitetura](ARCHITECTURE.md)
- [Contrato conceitual da API](API_CONTRACT.md)
- [Decisões arquiteturais](DECISIONS.md)
- [Roadmap de integrações](INTEGRATION_ROADMAP.md)
- [Guia de demonstração](DEMO_GUIDE.md)
- [Checklist de implantação](DEPLOY_CHECKLIST.md)
- [Uso de IA no desenvolvimento](AI_USAGE.md)
- [Changelog](CHANGELOG.md)

## 19. Conclusão técnica

O projeto cumpre bem o objetivo de validar uma experiência operacional e uma
arquitetura substituível sem depender prematuramente de integrações externas. A
separação entre interface, serviços, repositórios e `AIProcessor` reduz o custo de
evolução futura. Os fluxos de pessoa, documento, conferência e atendimento já
formam uma única cadeia demonstrável.

O próximo salto não deve ser apenas adicionar telas. A prioridade é transformar
as fronteiras simuladas em serviços seguros: identidade, API, banco, storage,
fila, observabilidade e governança de dados. Somente depois disso faz sentido
introduzir OCR, IA e WhatsApp reais de maneira mensurável e responsável.
