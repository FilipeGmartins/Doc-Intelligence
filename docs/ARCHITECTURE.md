# Arquitetura

## Visão geral

O DOC Intelligence é uma aplicação React para funcionários enviarem documentos,
acompanharem um processamento simulado, revisarem extrações com baixa confiança e
aprovarem o resultado.
O produto também apresenta a situação documental das pessoas cadastradas por meio
de um serviço mockado independente.

## Fluxo de dados

```text
Página/componente
  -> DocumentService
  -> DocumentRepository
  -> MockDocumentRepository
  -> MockDatabase
  -> localStorage
```

O processamento segue um ramo separado, coordenado pelo serviço:

```text
DocumentService -> AIProcessor -> MockAIService -> resultado fictício determinístico
```

## Responsabilidades

- **Interface:** apresentação, acessibilidade e ações do usuário.
- **Hooks:** estado assíncrono e coordenação das páginas quando houver reutilização.
- **DocumentService:** casos de uso e transições de estado.
- **DocumentRepository:** contrato de persistência.
- **MockDocumentRepository:** implementação local do contrato.
- **MockDatabase:** serialização e acesso exclusivo ao `localStorage`.
- **MockAIService:** atraso e resultados fictícios reproduzíveis.
- **AIProcessor:** contrato que permite substituir o mock por um provedor remoto.

Componentes não acessam diretamente `localStorage`, mocks ou Supabase.

## Plano documental por cliente

Cada pessoa possui uma lista inicial de categorias sugeridas, mas o funcionário
pode marcar ou desmarcar itens para representar o atendimento real. O upload envia
`personId` e `expectedCategory`, permitindo que o processador produza campos
específicos para identidade, comprovante, contracheque, carteira de trabalho ou
contrato.

O fingerprint local combina cliente, nome, tamanho e última modificação. Ele serve
somente para demonstrar detecção de possível duplicidade; uma API real deverá usar
hash do conteúdo e chave de idempotência.

## Auditoria

Cada documento mantém eventos de recebimento, início de processamento, resultado,
falha, correção manual e aprovação. Em produção, esses eventos deverão ser
imutáveis, armazenados no servidor e associados à identidade autenticada do
funcionário.

O catálogo demonstrativo de pessoas segue um contrato próprio:

```text
PeoplePage -> usePeople -> PersonService -> PersonRepository -> MockPeopleDatabase
```

O tema é estado de interface compartilhado por `ThemeProvider`. A preferência é
o único dado visual persistido diretamente no navegador, pois não representa dado
de negócio e deve permanecer específico do dispositivo.

## Automação demonstrativa de atendimento

O fluxo de WhatsApp não se conecta a um canal externo. Ele simula um webhook e um
bot guiado por estados determinísticos:

```text
WhatsAppPage
  -> ConversationService
  -> ConversationRepository
  -> MockConversationRepository
  -> MockConversationDatabase / localStorage
```

Durante a coleta, `ConversationService` cria uma pessoa provisória de forma
idempotente, envia o documento para `DocumentService` e preserva os identificadores
da pessoa e do documento na conversa.

```text
novo contato -> pessoa provisória -> documento processado -> conferência humana
  -> aprovação -> requisito recebido -> próximo documento solicitado
  -> recusa -> motivo registrado -> reenvio da mesma categoria solicitado
```

`DocumentWorkflowService` coordena a decisão. Na aprovação,
`DocumentService.approve()` chama `PersonService.markDocumentReceived()` e a
conversa solicita o próximo requisito ainda ausente. Na recusa, o documento ganha
um motivo auditável e a conversa volta à etapa de envio. Assim, Pessoas permanece
como painel consolidado e ferramenta de exceção, não como etapa repetitiva.

Em produção, webhooks da WhatsApp Business Cloud API alimentariam o contrato de
conversa. Consentimento, autenticação, proteção de dados, auditoria e tratamento
de reentregas seriam obrigatórios antes de receber dados pessoais reais.

## Substituição futura

Uma integração real implementará `DocumentRepository` e será selecionada no ponto
de composição da aplicação. As páginas continuarão consumindo o mesmo contrato de
serviço. Upload binário e processamento assíncrono real poderão exigir pequenos
ajustes no contrato, mas não uma reescrita da interface.
O mesmo vale para `AIProcessor`: `MockAIService` poderá ser substituído por um
adaptador remoto sem alterar `DocumentService`.

## Evolução para edição e persistência reais

### Envio de arquivos

No mock, `DocumentService.upload()` recebe objetos `File`, cria registros locais e
mantém uma `blob URL` temporária para imagens. Em produção, o mesmo caso de uso
deverá enviar `multipart/form-data` para `POST /documents`. O backend armazenará o
binário em um bucket privado e salvará no banco apenas metadados, estado e a chave
do objeto. A interface não receberá uma URL pública permanente; solicitará uma URL
assinada e curta quando precisar do preview.

### Edição

A tela de detalhes carregará o documento por `getById()`, manterá uma cópia dos
campos em estado local e enviará apenas as alterações por `update()`. O serviço
comparará valores anteriores e novos para aplicar `manuallyEdited: true`. Em uma
API real, `PATCH /documents/:id` deverá receber também uma versão ou `updatedAt`
para detectar revisão concorrente.

### Banco de dados

O componente não será conectado diretamente ao banco. Uma implementação
`ApiDocumentRepository` ou `SupabaseDocumentRepository` substituirá o mock no
ponto de composição:

```text
DocumentService
  -> DocumentRepository
      -> MockDocumentRepository       (desenvolvimento atual)
      -> ApiDocumentRepository        (API REST futura)
      -> SupabaseDocumentRepository   (alternativa futura)
```

Uma estrutura relacional mínima teria `documents`, `extracted_fields` e,
posteriormente, `people`, `person_documents` e `document_events` para auditoria. Arquivos ficariam em storage
privado, nunca dentro das tabelas nem no `localStorage`.

## Limitações reconhecidas

O mock não resolve segurança de dados pessoais, armazenamento binário, filas
distribuídas, deduplicação robusta, custo por processamento, versionamento de
modelos/prompts ou revisão concorrente. Não implementado nesta fatia porque o foco
é validar o fluxo front-end completo.

## Fatos do ambiente e tratamento consciente

Os pontos abaixo fazem parte do ambiente esperado do produto, mas não ampliam o
escopo desta entrega. Para cada um, o projeto registra o que demonstra hoje e o
que uma implementação real deverá resolver.

### Latência, custo e indisponibilidade do modelo

O fornecedor real pode levar de 5 a 40 segundos por documento, cobra por chamada
e pode devolver erro ou não responder. O mock atual demonstra latência e falha de
forma determinística, mas não simula cobrança, timeout ou indisponibilidade
prolongada. Em produção, o processamento deverá ocorrer em fila assíncrona, com
timeout, retentativa limitada, orçamento por operação e estado consultável. **Não
implementado nesta fatia:** infraestrutura de fila e medição de custo.

### Entrada sem validação e fotografias imperfeitas

Arquivos podem chegar com nomes genéricos, orientação incorreta, baixa qualidade
ou conteúdo diferente da extensão informada. A interface valida formato declarado,
extensão e limite de 10 MB, e o operador informa a categoria esperada. O mock não
lê pixels nem corrige rotação. Uma implementação real deverá validar o conteúdo,
detectar corrupção, normalizar orientação e medir a qualidade antes de consumir o
modelo. **Não implementado nesta fatia:** OCR, correção de imagem e análise de
qualidade.

### Reenvio e duplicidade

O mesmo documento pode chegar mais de uma vez. A demonstração compara cliente,
nome, tamanho e última modificação para apontar duplicidade provável. Produção
deverá calcular hash do conteúdo e usar chave de idempotência e restrição
transacional no servidor. A heurística atual é intencionalmente limitada.

### Dados pessoais e sensíveis

A demonstração usa apenas nomes, contatos e documentos fictícios. `localStorage`
e URLs `blob:` não são adequados para dados reais. Antes de operar em produção,
serão necessários autenticação, autorização por perfil, storage privado,
criptografia, auditoria imutável e políticas de retenção e descarte compatíveis
com a LGPD. **Não implementado nesta fatia:** segurança de produção.

### Volume e concentração de demanda

O ambiente informa média de 150 documentos por dia e picos superiores a 800,
concentrados entre 9h e 11h. A aplicação local não foi projetada nem testada para
esse volume. Produção exigirá upload direto para storage, fila durável, workers
escaláveis, paginação, limites de concorrência e testes de carga. **Não
implementado nesta fatia:** dimensionamento e elasticidade.

### Troca de modelo e evolução de prompts

`AIProcessor` isola a interface do fornecedor e permite substituir
`MockAIService` por outro adaptador. Produção deverá persistir, em cada resultado,
as versões do modelo, prompt e esquema de extração para auditoria e comparação de
qualidade. **Não implementado nesta fatia:** catálogo e versionamento operacional
de modelos e prompts.

### Conferência simultânea

Duas pessoas podem abrir o mesmo item ao mesmo tempo. A persistência local não
oferece bloqueio ou detecção de conflito. A futura API deverá exigir versão ou
`updatedAt` no salvamento, responder `409 DOCUMENT_VERSION_CONFLICT` quando o
registro estiver desatualizado e identificar o conferente em cada evento. **Não
implementado nesta fatia:** controle de concorrência entre revisores.
