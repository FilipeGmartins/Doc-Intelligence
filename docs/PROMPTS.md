# Prompts

Os textos abaixo são preservados exatamente como enviados, em ordem cronológica.

## Prompt 001 — Solicitação inicial

```text
Você atuará como um engenheiro de software sênior e Product Designer auxiliando no desenvolvimento de um desafio técnico para uma vaga de Desenvolvedor.

O projeto se chama:

DOC Intelligence

==================================================
1. CONTEXTO DO PRODUTO
==================================================

O DOC Intelligence é uma aplicação para apoiar funcionários de um escritório no processamento e conferência de documentos.

O escritório recebe documentos de clientes em PDF ou imagem, como:

- documentos de identidade;
- comprovantes de residência;
- contracheques;
- carteiras de trabalho;
- laudos;
- procurações;
- contratos;
- fotografias de documentos.

No sistema real, um modelo de inteligência artificial multimodal faria:

- classificação do documento;
- extração de campos;
- sugestão de nome padronizado;
- cálculo de confiança da extração.

Porém, neste desafio NÃO será criada uma integração real com IA.

Os resultados da IA deverão ser simulados.

==================================================
2. TRILHA ESCOLHIDA
==================================================

Estamos implementando somente a:

TRILHA B — FRONT-END

O foco é construir a interface utilizada pelos funcionários.

Não implementar backend real.

A API ainda não existe.

Nós devemos:

1. definir o contrato da API;
2. criar uma camada de serviços;
3. simular a API;
4. simular um banco de dados com comportamento semelhante ao Supabase.

A arquitetura deve permitir futuramente substituir os mocks por uma API REST ou Supabase real sem precisar reescrever os componentes da interface.

==================================================
3. STACK
==================================================

Utilizar obrigatoriamente:

- React
- TypeScript
- Vite
- React Router
- Vitest para poucos testes relevantes

Para estilos:

Preferir Tailwind CSS.

Se a configuração adicionar complexidade desnecessária, CSS Modules ou CSS comum são aceitáveis.

Para ícones:

Lucide React.

Não utilizar bibliotecas pesadas sem necessidade.

Não utilizar Redux.

Para este escopo, preferir Context API, hooks e estado local.

==================================================
4. PERSISTÊNCIA / MOCK DO BANCO
==================================================

Criar uma abstração que simule o comportamento de um banco semelhante ao Supabase.

NÃO conectar obrigatoriamente ao Supabase real.

Criar algo como:

src/
  services/
    documentService.ts

  repositories/
    documentRepository.ts
    mockDocumentRepository.ts

  mocks/
    mockDatabase.ts

O componente React nunca deverá acessar diretamente:

localStorage
mockDatabase
Supabase

Os componentes devem consumir serviços.

Exemplo conceitual:

Component
   ↓
DocumentService
   ↓
DocumentRepository
   ↓
MockDocumentRepository
   ↓
MockDatabase / localStorage

No futuro:

Component
   ↓
DocumentService
   ↓
SupabaseDocumentRepository
   ↓
Supabase

A substituição deverá exigir poucas alterações.

Utilizar localStorage apenas para permitir que os documentos permaneçam após atualizar a página.

==================================================
5. MODELO DE DOCUMENTO
==================================================

Criar tipos TypeScript consistentes.

Exemplo inicial:

type DocumentStatus =
  | "pending"
  | "processing"
  | "processed"
  | "review_required"
  | "failed"
  | "approved";

interface ExtractedField {
  id: string;
  label: string;
  key: string;
  value: string;
  confidence: number;
  manuallyEdited: boolean;
}

interface Document {
  id: string;

  originalFileName: string;
  suggestedFileName: string;

  mimeType: string;

  documentType: string;

  status: DocumentStatus;

  confidence: number;

  extractedFields: ExtractedField[];

  createdAt: string;
  updatedAt: string;

  processingError?: string;
}

Sinta-se livre para melhorar esse modelo, mas não adicionar complexidade sem justificativa.

==================================================
6. FATIA VERTICAL OBRIGATÓRIA
==================================================

Implementar completamente este fluxo:

UPLOAD
   ↓
PROCESSAMENTO SIMULADO
   ↓
RESULTADO DA IA MOCKADA
   ↓
VERIFICAÇÃO DE CONFIANÇA
   ↓
FILA DE CONFERÊNCIA
   ↓
VISUALIZAÇÃO DO DOCUMENTO
   ↓
CORREÇÃO DE UM OU MAIS CAMPOS
   ↓
SALVAR
   ↓
APROVAR DOCUMENTO

Essa é a principal funcionalidade do projeto.

Não priorizar funcionalidades que não contribuam para esse fluxo.

==================================================
7. REGRA DE CONFIANÇA
==================================================

Utilizar inicialmente:

confidence >= 0.80
    → processed

confidence < 0.80
    → review_required

Campos individuais também podem possuir confiança.

Exemplo:

Nome
João da Silva
Confiança: 96%

CPF
123.456.789-00
Confiança: 61%
⚠ Revisar

Não tratar essa regra como regra definitiva de produção.

Documentar que o threshold é uma decisão configurável.

==================================================
8. SIMULAÇÃO DA IA
==================================================

Criar:

mockAIService.ts

O processamento deve ser assíncrono.

Simular uma duração entre aproximadamente:

1 e 4 segundos

Não usar API de IA real.

Criar pelo menos três comportamentos diferentes:

CENÁRIO A

Documento processado normalmente.

confidence: aproximadamente 0.94

status:
processed


CENÁRIO B

Documento com baixa confiança.

confidence: aproximadamente 0.68

status:
review_required


CENÁRIO C

Falha no processamento.

status:
failed

Mensagem:

"Não foi possível processar este documento."

Adicionar opção:

"Tentar novamente"

Não criar comportamento aleatório demais.

Os cenários devem ser reproduzíveis durante uma avaliação.

==================================================
9. DADOS MOCKADOS
==================================================

Criar documentos totalmente FICTÍCIOS.

Não utilizar dados reais.

Exemplos:

Documento:
identidade_joao_silva.jpg

Tipo:
Documento de Identidade

Nome:
João Henrique Silva

CPF fictício:
000.111.222-33

Data de nascimento:
15/04/1994

Nome sugerido:
IDENTIDADE_JOAO_HENRIQUE_SILVA.pdf


Outro:

Documento:
comprovante_maria.pdf

Tipo:
Comprovante de residência

Nome:
Maria Ferreira

Endereço:
Rua das Palmeiras, 120

Cidade:
Mossoró

Estado:
RN

Todos os dados utilizados devem deixar claro que são fictícios.

==================================================
10. TELAS
==================================================

Construir somente as telas necessárias.

1. DASHBOARD

Mostrar:

DOC Intelligence

Cards resumidos:

Total
Processando
Processados
Revisão necessária
Falhas

Adicionar:

"Enviar documentos"

Mostrar também:

Documentos recentes


2. UPLOAD

Criar uma área amigável de drag and drop.

Texto:

"Envie seus documentos"

"Arraste arquivos até aqui ou clique para selecionar."

Aceitar:

PDF
JPG
JPEG
PNG

Permitir selecionar vários arquivos.

Mostrar antes de processar:

nome
tipo
tamanho
opção remover

Botão:

"Processar documentos"


3. FILA DE CONFERÊNCIA

Mostrar somente documentos com:

status = review_required

Exibir:

nome
tipo detectado
confiança
data
botão Revisar

Permitir busca simples.


4. DETALHES DO DOCUMENTO

Esta é uma das telas mais importantes.

Layout desktop:

------------------------------------------------

Documento original      | Dados extraídos
                        |
      Preview           | Tipo
                        |
                        | Confiança
                        |
                        | Nome
                        |
                        | CPF
                        |
                        | Data
                        |
                        | ...
------------------------------------------------

Em mobile:

documento primeiro
dados extraídos abaixo

Os campos extraídos devem poder ser editados.

Quando um funcionário alterar um campo:

manuallyEdited = true

Mostrar visualmente:

"Corrigido manualmente"

Adicionar:

Salvar alterações

Aprovar documento


5. DOCUMENTOS PROCESSADOS

Pode fazer parte do Dashboard ou ser uma rota separada.

Permitir buscar por:

nome original
nome sugerido
tipo
status

Não criar busca avançada.

==================================================
11. EXPERIÊNCIA DO USUÁRIO
==================================================

A interface deve parecer um software corporativo moderno.

Características:

- limpa;
- simples;
- profissional;
- amigável;
- responsiva;
- sem excesso de elementos;
- sem excesso de cores;
- fácil de entender sem treinamento.

Priorizar hierarquia visual.

Utilizar:

Sidebar ou header simples.

Sugestão de navegação:

DOC Intelligence

Dashboard
Enviar documentos
Conferência
Documentos

Destacar claramente os status.

Exemplos:

Processando
Revisão necessária
Processado
Falha
Aprovado

Adicionar feedback para ações.

Exemplo:

"Alterações salvas com sucesso."

Usar loading states.

Usar empty states.

Exemplo:

"Nenhum documento aguardando conferência."

Não criar animações complexas.

==================================================
12. ACESSIBILIDADE
==================================================

Aplicar práticas básicas:

labels nos inputs;

botões semanticamente corretos;

contraste adequado;

navegação compreensível;

aria-label quando necessário;

não comunicar status somente por cor.

==================================================
13. ARQUITETURA
==================================================

Não criar arquitetura exageradamente complexa.

Estrutura sugerida:

src/
├── components/
│   ├── layout/
│   ├── documents/
│   └── ui/
│
├── pages/
│   ├── Dashboard/
│   ├── Upload/
│   ├── ReviewQueue/
│   └── DocumentDetails/
│
├── services/
│   ├── documentService.ts
│   └── mockAIService.ts
│
├── repositories/
│   ├── DocumentRepository.ts
│   └── MockDocumentRepository.ts
│
├── mocks/
│   ├── mockDatabase.ts
│   └── mockDocuments.ts
│
├── types/
│   └── document.ts
│
├── hooks/
│
├── utils/
│
├── router/
│
└── App.tsx

Não crie arquivos apenas para parecer arquiteturalmente sofisticado.

Cada abstração deve ter motivo.

==================================================
14. CONTRATO DA API
==================================================

Mesmo utilizando mock, especificar uma futura API.

Projetar conceitualmente endpoints como:

POST /documents

GET /documents

GET /documents/:id

PATCH /documents/:id

POST /documents/:id/reprocess

POST /documents/:id/approve

GET /documents?status=review_required

Documentar request e response.

A aplicação mockada deverá possuir métodos equivalentes:

documentService.upload()

documentService.list()

documentService.getById()

documentService.update()

documentService.reprocess()

documentService.approve()

==================================================
15. SITUAÇÕES DO MUNDO REAL
==================================================

A arquitetura/documentação deve reconhecer estes problemas mesmo que não sejam todos implementados:

- processamento da IA pode demorar;
- IA pode falhar;
- cada processamento possui custo;
- documentos podem ser enviados mais de uma vez;
- documentos possuem dados pessoais e sensíveis;
- existem picos de processamento;
- fornecedor/modelo de IA pode mudar;
- prompts podem mudar;
- duas pessoas podem tentar revisar o mesmo documento.

Não é necessário resolver tudo.

É necessário demonstrar que os problemas foram percebidos.

Para aquilo que não for implementado, registrar:

"Não implementado nesta fatia."

E explicar por quê.

==================================================
16. TESTES
==================================================

Não buscar alta cobertura.

Criar apenas alguns testes úteis.

Prioridade:

Teste 1:

confidence < 0.80
→ review_required


Teste 2:

confidence >= 0.80
→ processed


Teste 3:

editar campo
→ manuallyEdited = true


Teste 4, se simples:

falha de processamento
→ opção de tentar novamente

==================================================
17. DOCUMENTAÇÃO
==================================================

Antes de escrever grande quantidade de código, criar:

docs/
├── ARCHITECTURE.md
├── DECISIONS.md
├── API_CONTRACT.md
├── AI_USAGE.md
├── PROMPTS.md
└── CHANGELOG.md

Criar também:

README.md

ARCHITECTURE.md:

explicar:

- visão geral;
- arquitetura;
- fluxo de dados;
- divisão de responsabilidades;
- funcionamento dos mocks;
- como trocar mock por API/Supabase real.


DECISIONS.md:

registrar decisões no estilo ADR simples.

Exemplo:

ADR-001
React + TypeScript

Decisão
...

Alternativas
...

Motivo
...

Trade-offs
...


ADR-002
Mock da API

ADR-003
Repository Pattern simples

ADR-004
localStorage

ADR-005
threshold de confiança


API_CONTRACT.md:

documentar o contrato futuro da API.


AI_USAGE.md:

registrar:

- ferramenta de IA utilizada;
- finalidade;
- como os resultados foram validados;
- erros da IA;
- correções humanas;
- decisões rejeitadas.


PROMPTS.md:

REGRA IMPORTANTE:

Registrar os prompts EXATAMENTE como foram enviados.

Não reescrever depois para parecerem melhores.

Adicionar cada novo prompt na ordem cronológica.


CHANGELOG.md:

registrar evoluções relevantes.

==================================================
18. USO DE INTELIGÊNCIA ARTIFICIAL
==================================================

Você é um agente de IA trabalhando neste projeto.

Por isso:

NÃO implemente tudo silenciosamente.

A cada etapa relevante:

1. explique brevemente o que pretende fazer;
2. diga por que;
3. implemente;
4. informe possíveis trade-offs.

Se detectar um requisito mal definido:

não invente silenciosamente.

Escolha uma solução razoável e registre como decisão.

Se sugerir uma biblioteca nova:

explique por que ela é necessária.

Não adicionar dependências que podemos substituir facilmente por código simples.

==================================================
19. GIT
==================================================

O projeto precisa demonstrar evolução.

Não fazer tudo em um único commit.

Sugestão de evolução:

chore: initialize React TypeScript application

docs: add initial architecture specification

feat: add document domain models

feat: add mock document repository

feat: add document upload flow

feat: simulate document processing

feat: add review queue

feat: add document correction workflow

feat: add document approval flow

test: add document processing tests

docs: document AI usage and tradeoffs

Não executar commits automaticamente sem autorização.

Apenas indicar quando seria um bom momento para commit.

==================================================
20. NÃO IMPLEMENTAR AGORA
==================================================

Não implementar, salvo necessidade descoberta posteriormente:

backend real;

banco PostgreSQL real;

Supabase real;

login;

JWT;

OAuth;

controle de permissões;

AWS;

Docker;

WebSockets;

WhatsApp;

e-mail;

OCR real;

modelo multimodal real;

OpenAI API;

Gemini API;

upload para storage em nuvem;

microserviços;

Redux;

CQRS;

Clean Architecture excessivamente formal;

testes E2E completos;

animações complexas.

Esses itens podem aparecer na documentação como evolução futura.

==================================================
21. PRIORIDADES
==================================================

Prioridade 1:

Fatia vertical funcionando.

Prioridade 2:

Código simples e organizado.

Prioridade 3:

Boa experiência de usuário.

Prioridade 4:

Documentação das decisões.

Prioridade 5:

Poucos testes relevantes.

Prioridade 6:

Melhorias visuais.

==================================================
22. DEFINITION OF DONE
==================================================

A fatia está pronta quando for possível:

1. abrir a aplicação;

2. selecionar vários documentos;

3. iniciar o processamento;

4. acompanhar o status;

5. receber resultados simulados;

6. encontrar um documento em revisão;

7. abrir esse documento;

8. visualizar o documento ao lado dos dados;

9. alterar pelo menos um campo;

10. identificar visualmente que ele foi corrigido manualmente;

11. salvar;

12. aprovar;

13. recarregar a aplicação sem perder os dados mockados;

14. executar os testes;

15. entender pelo README como iniciar o projeto.

==================================================
23. FORMA DE TRABALHO
==================================================

IMPORTANTE:

Não desenvolva o projeto inteiro de uma vez.

Vamos trabalhar incrementalmente.

Antes de cada implementação:

- apresente a etapa;
- apresente os arquivos que serão criados/modificados;
- explique rapidamente a decisão;
- aguarde minha autorização quando houver mudança estrutural relevante.

Comece AGORA apenas com:

1. análise dos requisitos;
2. definição do escopo da fatia vertical;
3. proposta da arquitetura;
4. estrutura de diretórios;
5. modelo de dados;
6. contrato inicial da API mockada;
7. lista do que deliberadamente ficará de fora.

NÃO escreva ainda todas as telas.

Depois que eu aprovar a arquitetura, começaremos pela configuração do projeto e seguiremos funcionalidade por funcionalidade.
```

## Prompt 002 — Aprovação da criação

```text
estou aprovando a criacao 
```

## Prompt 003 — Continuação das implementações

```text
continue as implementacoes 
```

## Prompt 004 — Continuação após discussão de autenticação e armazenamento

```text
continue com as implementacoes que estavam sendo feitas anteriormente 
```

## Prompt 005 — Publicação no GitHub

```text
a dashboard esta muito bem feita agora devera ser feita a implementação de envio de documentos mas antes disso iremos subir o projeto para o github&#x20;
assim ficara mais facil controlar e vercionar as proximas versões 
```

## Prompt 006 — Upload, edição e banco de dados

```text
execute entao&#x20;
apos isso veja como podera ser feita o envio de arquivos&#x20;
a parte de edicao dos mesmos&#x20;
e sobre o link com o banco de dados 
```

## Prompt 007 — Pull Requests por etapa e conferência antes da finalização

```text
o projeto pede para que um dos seus requisitos tecnicos seka o rastreio das alteracoes&#x20;
por conta disso vamos fazer os Pulls requestes por parte&#x20;
suba a alteracao do envio de documentos agora&#x20;
apos o novo envio vamos fazer a nova etapa para conferencia&#x20;
eu penso que pode ser importante na parte de documento ser simular a uma parte de cadastro onde as informacoes do usuario ficar aguardando seres editadas antes da finalizacao do cadastro 
```
