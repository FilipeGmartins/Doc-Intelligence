# Contrato inicial da API

Contrato conceitual para futura API REST. Datas usam ISO 8601, confiança varia de
`0` a `1` e respostas de sucesso envolvem o resultado em `data`.

## Documento

Campos principais: `id`, `originalFileName`, `suggestedFileName`, `mimeType`,
`sizeInBytes`, `documentType`, `status`, `confidence`, `extractedFields`,
`createdAt`, `updatedAt`, `approvedAt` e `processingError`.
O modelo também admite `personId`, `expectedCategory`, `fingerprint` e `events`.

## Endpoints

### `POST /documents`

Recebe `multipart/form-data` com um ou mais arquivos. Retorna `201` com os
documentos criados em estado `pending`.

Cada arquivo pode informar `personId` e `expectedCategory`. Um possível reenvio
poderá retornar `409` com `DUPLICATE_DOCUMENT` e o identificador já existente.

### `GET /documents`

Aceita `status` e `query` como filtros opcionais. Retorna `200` com uma lista.

### `GET /documents/:id`

Retorna `200` com o documento ou `404` com `DOCUMENT_NOT_FOUND`.

### `PATCH /documents/:id`

Aceita `suggestedFileName`, `documentType` e/ou `extractedFields`. Retorna o
documento atualizado.

Exemplo de edição futura:

```json
{
  "updatedAt": "2026-08-30T18:30:00.000Z",
  "extractedFields": [
    {
      "id": "field-cpf-joao",
      "value": "000.111.222-44",
      "manuallyEdited": true
    }
  ]
}
```

Se `updatedAt` estiver desatualizado, a API futura poderá responder `409` com
`DOCUMENT_VERSION_CONFLICT`. Controle de concorrência não está implementado nesta
fatia.

### `POST /documents/:id/reprocess`

Reinicia um documento com falha ou resultado revisável. Retorna `202` com o novo
estado de processamento.

### `POST /documents/:id/approve`

Aprova um documento processado ou revisado. Retorna `200` com `status: approved`.

### `POST /documents/:id/reject`

Recusa um documento processado ou revisado. Recebe um `reason` obrigatório,
retorna `200` com `status: rejected` e publica o resultado para o fluxo de
atendimento. Na implementação mockada, essa publicação atualiza a conversa local;
em produção, deverá ser um evento assíncrono e idempotente.

## Erros

```json
{
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Documento não encontrado."
  }
}
```

Códigos iniciais: `INVALID_FILE`, `DOCUMENT_NOT_FOUND`, `INVALID_STATUS_TRANSITION`,
`PROCESSING_FAILED`, `DUPLICATE_DOCUMENT`, `INVALID_CPF` e `INVALID_RG`.

CPF é recebido sem máscara, com exatamente 11 dígitos. RG é recebido sem
pontuação, com até 9 caracteres alfanuméricos; letras são normalizadas para
maiúsculas. O mock atual também valida os dois dígitos verificadores do CPF;
a máscara é responsabilidade exclusiva da apresentação.

Paginação, idempotência, controle otimista e versionamento formal não estão
implementados nesta fatia, mas deverão ser definidos antes de uma API de produção.

## Pessoas

### `POST /people`

Cria um cliente manual com nome, identificação, e-mail e categorias documentais
exigidas. Retorna `201` com `source: manual`. Uma identificação ou um e-mail já
cadastrado deverá retornar `409` com `PERSON_ALREADY_EXISTS`.

### `GET /people`

Aceita `query` e `status` como filtros opcionais. O status documental pode ser
`complete`, `pending_document` ou `update_required`. Retorna dados cadastrais
resumidos, quantidade de documentos, pendências e data da última atualização.

Na simulação atual, a edição de pessoas permite administrar requisitos e exceções.
No fluxo normal, a aprovação documental atualiza automaticamente a categoria
recebida e recalcula a situação da pessoa.

## Atendimentos de WhatsApp

### `GET /intake-conversations`

Lista conversas, progresso da coleta, mensagens e estado do pré-cadastro.

### `POST /intake-conversations/:id/replies`

Registra uma resposta simulada e avança a coleta guiada.

### `POST /intake-conversations/:id/documents/mock`

Simula o recebimento, cria a pessoa provisória, processa o documento e o coloca na
fila de conferência com vínculo de cliente e categoria.

### `POST /intake-conversations/:id/approve`

Valida o pré-cadastro de forma idempotente. A aprovação do documento continua
separada e é responsável por marcar o requisito como recebido. Uma implementação
real receberia eventos por webhook da API oficial, fora do navegador.

### Resultado da conferência

Quando um documento vinculado é aprovado, o atendimento solicita a próxima
categoria exigida ainda não recebida ou encerra a coleta. Quando é recusado, o
motivo aparece na conversa e a mesma categoria volta a aceitar um envio. Esse
comportamento pertence ao serviço de orquestração, deixando o adaptador do canal
substituível por uma integração real no futuro.
